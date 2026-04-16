/**
 * Routine Poller Job
 * Runs every 5 minutes to fetch validator data and detect changes
 * Handles less time-sensitive data
 */

const cron = require('node-cron');
const validatorsApp = require('../services/validatorsApp');
const solanaRpc = require('../services/solanaRpc');
const queries = require('../models/queries');
const redis = require('../models/redis');
const cacheKeys = require('../models/cacheKeys');

let isRunning = false;

/**
 * Start the routine poller
 * @param {Object} io - Socket.io instance for broadcasting
 */
function startRoutinePoller(io) {
  cron.schedule('*/5 * * * *', async () => {
    if (isRunning) {
      console.log('[RoutinePoller] Skipping tick - previous still running');
      return;
    }

    isRunning = true;

    try {
      // 1. Fetch validators from Validators.app
      const validators = await validatorsApp.getValidators(100);

      // 2. Detect commission changes
      const cached = validatorsApp.getCachedValidators();
      const changes = validatorsApp.detectCommissionChanges(validators, cached);

      // 3. Upsert each validator to DB (graceful - don't crash if DB unavailable)
      for (const v of validators) {
        try {
          await queries.upsertValidator(v);
        } catch (dbError) {
          console.warn('[RoutinePoller] DB upsertValidator failed:', dbError.message);
          break; // Stop trying if DB is down
        }
      }

      // 4. Write validator snapshots for historical tracking (top 50)
      for (const v of validators.slice(0, 50)) {
        try {
          await queries.insertValidatorSnapshot({
            vote_pubkey: v.vote_pubkey,
            is_delinquent: v.is_delinquent,
            skip_rate: v.skip_rate,
            commission: v.commission,
            stake_sol: v.stake_sol,
            vote_distance: v.vote_distance || null,
            root_distance: v.root_distance || null,
          });
        } catch (dbError) {
          console.warn('[RoutinePoller] DB insertValidatorSnapshot failed:', dbError.message);
          break;
        }
      }

      // 5. Fetch and cache total validator count from Validators.app
      // This provides an accurate count (~1900) vs RPC's limited response (~785)
      let totalValidatorCount = 0;
      try {
        totalValidatorCount = await validatorsApp.getTotalValidatorCount();
        if (totalValidatorCount > 0) {
          await redis.setCache(cacheKeys.VALIDATORS_TOTAL_COUNT, { count: totalValidatorCount, timestamp: Date.now() }, 600);
          console.log(`[RoutinePoller] Cached total validator count: ${totalValidatorCount}`);
        }
      } catch (countError) {
        console.warn('[RoutinePoller] Failed to fetch total validator count:', countError.message);
      }

      // 6. Update Redis cache (graceful - don't crash if Redis unavailable)
      try {
        await redis.setCache(cacheKeys.VALIDATORS_TOP100, validators, cacheKeys.TTL.ROUTINE);
      } catch (redisError) {
        console.warn('[RoutinePoller] Redis cache update failed:', redisError.message);
      }

      // 7. Update epoch info cache
      try {
        const epochInfo = await solanaRpc.getEpochInfo();
        await redis.setCache(cacheKeys.EPOCH_INFO, epochInfo, cacheKeys.TTL.EPOCH);
      } catch (epochError) {
        console.warn('[RoutinePoller] Epoch info fetch/cache failed:', epochError.message);
      }

      // 8. Create alerts for commission changes
      for (const change of changes) {
        const alert = {
          type: 'commission_change',
          severity: 'warning',
          entity: change.votePubkey,
          message: `Validator ${change.name || change.votePubkey} changed commission from ${change.oldCommission}% to ${change.newCommission}%`,
          details_json: change,
        };

        try {
          await queries.insertAlert(alert);
        } catch (dbError) {
          console.warn('[RoutinePoller] DB insertAlert failed:', dbError.message);
        }

        // Emit alert via WebSocket
        if (io) {
          io.emit('alert:new', alert);
        }
      }

      console.log(`[RoutinePoller] Tick complete — Validators: ${validators.length}, Commission changes: ${changes.length}`);
    } catch (error) {
      console.error('[RoutinePoller] Error:', error.message);
    } finally {
      isRunning = false;
    }
  });

  console.log('[RoutinePoller] Started - running every 5 minutes');
}

module.exports = {
  startRoutinePoller,
};
