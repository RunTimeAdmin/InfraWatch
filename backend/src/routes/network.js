/**
 * Network Routes
 * Provides endpoints for network status and historical data
 */

const express = require('express');
const router = express.Router();
const queries = require('../models/queries');
const redis = require('../models/redis');
const cacheKeys = require('../models/cacheKeys');

/**
 * GET /api/network/current
 * Get current network status
 * Cache-first pattern: tries Redis, falls back to DB
 */
router.get('/current', async (req, res, next) => {
  try {
    // Try cache first
    let cached = null;
    try {
      cached = await redis.getCache(cacheKeys.NETWORK_CURRENT);
    } catch (redisError) {
      // Redis unavailable, continue to DB fallback
    }

    if (cached) {
      // Transform snapshot to API response format
      return res.json({
        status: cached.health || 'unknown',
        tps: cached.tps,
        slotHeight: cached.slot,
        slotLatencyMs: cached.slot_latency_ms,
        epoch: cached.epoch,
        epochProgress: cached.epoch_progress,
        delinquentCount: cached.delinquent_validators,
        activeValidators: cached.total_validators,
        confirmationTimeMs: cached.avg_confirmation_ms,
        congestionScore: cached.congestion_score,
        timestamp: cached.timestamp,
      });
    }

    // Fallback to DB
    let snapshot = null;
    try {
      snapshot = await queries.getLatestNetworkSnapshot();
    } catch (dbError) {
      // DB unavailable
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Data collection is starting up or temporarily unavailable',
      });
    }

    if (!snapshot) {
      return res.status(503).json({
        error: 'No network data available',
        message: 'Service is starting up or data collection is unavailable',
      });
    }

    res.json({
      status: 'unknown',
      tps: snapshot.tps,
      slotHeight: snapshot.slot_height,
      slotLatencyMs: snapshot.slot_latency_ms,
      epoch: snapshot.epoch,
      epochProgress: snapshot.epoch_progress,
      delinquentCount: snapshot.delinquent_count,
      activeValidators: snapshot.active_validators,
      confirmationTimeMs: snapshot.confirmation_time_ms,
      congestionScore: snapshot.congestion_score,
      timestamp: snapshot.timestamp,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/network/history?range=1h|24h|7d
 * Get network snapshots for charting
 */
router.get('/history', async (req, res, next) => {
  try {
    const { range = '1h' } = req.query;

    // Validate range parameter
    const validRanges = ['1h', '24h', '7d'];
    if (!validRanges.includes(range)) {
      return res.status(400).json({
        error: 'Invalid range parameter',
        validRanges,
      });
    }

    // Try cache first
    let cached = null;
    try {
      const cacheKey = cacheKeys.NETWORK_HISTORY(range);
      cached = await redis.getCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    } catch (redisError) {
      // Redis unavailable, continue to DB fallback
    }

    // Fallback to DB
    let history = [];
    try {
      history = await queries.getNetworkHistory(range);
    } catch (dbError) {
      // DB unavailable - return empty array
      return res.json([]);
    }

    // Cache the result
    try {
      const cacheKey = cacheKeys.NETWORK_HISTORY(range);
      await redis.setCache(cacheKey, history, cacheKeys.TTL.HISTORY);
    } catch (cacheError) {
      // Non-critical: continue even if cache fails
      console.warn('[NetworkRoute] Cache set failed:', cacheError.message);
    }

    res.json(history);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
