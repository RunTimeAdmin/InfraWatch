/**
 * Epoch Routes
 * Provides endpoints for epoch information
 */

const express = require('express');
const router = express.Router();
const redis = require('../models/redis');
const cacheKeys = require('../models/cacheKeys');
const solanaRpc = require('../services/solanaRpc');

/**
 * GET /api/epoch/current
 * Get current epoch information
 */
router.get('/current', async (req, res, next) => {
  try {
    // Try cache first
    let cached = null;
    try {
      cached = await redis.getCache(cacheKeys.EPOCH_INFO);
      if (cached) {
        return res.json({
          epoch: cached.epoch,
          slotIndex: cached.slotIndex,
          slotsInEpoch: cached.slotsInEpoch,
          progress: cached.progress,
          slotsRemaining: cached.slotsRemaining,
          etaMs: cached.etaMs,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (redisError) {
      // Redis unavailable, continue to RPC fallback
    }

    // Fallback to RPC
    const epochInfo = await solanaRpc.getEpochInfo();

    // Cache the result
    try {
      await redis.setCache(cacheKeys.EPOCH_INFO, epochInfo, cacheKeys.TTL.EPOCH);
    } catch (cacheError) {
      console.warn('[EpochRoute] Cache set failed:', cacheError.message);
    }

    res.json({
      epoch: epochInfo.epoch,
      slotIndex: epochInfo.slotIndex,
      slotsInEpoch: epochInfo.slotsInEpoch,
      progress: epochInfo.progress,
      slotsRemaining: epochInfo.slotsRemaining,
      etaMs: epochInfo.etaMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
