/**
 * Critical Poller Job
 * Runs every 30 seconds to collect network snapshot and RPC health data
 * This is the heartbeat of InfraWatch
 */

const cron = require('node-cron');
const solanaRpc = require('../services/solanaRpc');
const helius = require('../services/helius');
const rpcProber = require('../services/rpcProber');
const queries = require('../models/queries');
const redis = require('../models/redis');
const cacheKeys = require('../models/cacheKeys');

let isRunning = false;

/**
 * Start the critical poller
 * @param {Object} io - Socket.io instance for broadcasting
 */
function startCriticalPoller(io) {
  // Run every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    if (isRunning) {
      console.log('[CriticalPoller] Skipping tick - previous still running');
      return;
    }

    isRunning = true;

    try {
      // 1. Collect network snapshot (TPS, slot, epoch, delinquent count, congestion)
      const snapshot = await solanaRpc.collectNetworkSnapshot();

      // 2. Enhance with Helius priority fee data if available
      const priorityFees = await helius.getPriorityFeeEstimate();
      if (priorityFees) {
        snapshot.congestionScore = solanaRpc.calculateCongestionScore(
          snapshot.tps,
          priorityFees.percentile90,
          snapshot.slotLatencyMs
        );
      }

      // 3. Probe all RPC providers
      const rpcResults = await rpcProber.probeAllProviders();

      // 4. Write to PostgreSQL (graceful - don't crash if DB unavailable)
      try {
        await queries.insertNetworkSnapshot({
          tps: snapshot.tps,
          slot_height: snapshot.slot,
          slot_latency_ms: snapshot.slotLatencyMs,
          epoch: snapshot.epoch,
          epoch_progress: snapshot.epochProgress,
          delinquent_count: snapshot.delinquentValidators,
          active_validators: snapshot.totalValidators,
          confirmation_time_ms: snapshot.avgConfirmationMs,
          congestion_score: snapshot.congestionScore,
        });
      } catch (dbError) {
        console.warn('[CriticalPoller] DB insertNetworkSnapshot failed:', dbError.message);
      }

      for (const result of rpcResults) {
        try {
          await queries.insertRpcHealthCheck({
            provider_name: result.providerName,
            endpoint_url: result.endpoint,
            latency_ms: result.latencyMs,
            is_healthy: result.isHealthy,
            slot_height: result.slotHeight,
            error_message: result.error || null,
          });
        } catch (dbError) {
          console.warn('[CriticalPoller] DB insertRpcHealthCheck failed:', dbError.message);
        }
      }

      // 5. Update Redis cache (graceful - don't crash if Redis unavailable)
      try {
        await redis.setCache(cacheKeys.NETWORK_CURRENT, snapshot, cacheKeys.TTL.CRITICAL);
        await redis.setCache(cacheKeys.RPC_LATEST, rpcResults, cacheKeys.TTL.CRITICAL);
      } catch (redisError) {
        console.warn('[CriticalPoller] Redis cache update failed:', redisError.message);
      }

      // 6. Push via WebSocket
      if (io) {
        io.emit('network:update', snapshot);
        io.emit('rpc:update', rpcResults);
      }

      console.log(`[CriticalPoller] Tick complete — TPS: ${snapshot.tps}, Providers: ${rpcResults.length}`);
    } catch (error) {
      console.error('[CriticalPoller] Error:', error.message);
    } finally {
      isRunning = false;
    }
  });

  console.log('[CriticalPoller] Started - running every 30 seconds');
}

module.exports = {
  startCriticalPoller,
};
