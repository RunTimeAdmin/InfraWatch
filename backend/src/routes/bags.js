/**
 * Bags Routes
 * Provides endpoints for Bags FM API integration
 */

const express = require('express');
const router = express.Router();
const bagsApi = require('../services/bagsApi');
const redis = require('../models/redis');
const cacheKeys = require('../models/cacheKeys');

// Cache TTL for Bags data (60 seconds)
const BAGS_CACHE_TTL = 60;

/**
 * GET /api/bags/pools
 * Get Bags pools
 * Cache-first pattern with 60s TTL
 */
router.get('/pools', async (req, res, next) => {
  try {
    const { onlyMigrated } = req.query;
    const onlyMigratedBool = onlyMigrated === 'true' || onlyMigrated === '1';
    const cacheKey = `bags:pools:${onlyMigratedBool}`;

    // Try cache first
    let cached = null;
    try {
      cached = await redis.getCache(cacheKey);
    } catch (redisError) {
      // Redis unavailable, continue to API fallback
    }

    if (cached) {
      return res.json({
        success: true,
        source: 'cache',
        data: cached,
      });
    }

    // Fetch from Bags API
    const pools = await bagsApi.getBagsPools(onlyMigratedBool);

    if (pools === null) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Bags API is not configured or temporarily unavailable',
      });
    }

    // Cache the result
    try {
      await redis.setCache(cacheKey, pools, BAGS_CACHE_TTL);
    } catch (cacheError) {
      // Non-critical: continue even if cache fails
      console.warn('[BagsRoute] Cache set failed:', cacheError.message);
    }

    res.json({
      success: true,
      source: 'api',
      data: pools,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/bags/launches
 * Get token launch feed
 * Cache-first pattern with 60s TTL
 */
router.get('/launches', async (req, res, next) => {
  try {
    const cacheKey = 'bags:launches';

    // Try cache first
    let cached = null;
    try {
      cached = await redis.getCache(cacheKey);
    } catch (redisError) {
      // Redis unavailable, continue to API fallback
    }

    if (cached) {
      return res.json({
        success: true,
        source: 'cache',
        data: cached,
      });
    }

    // Fetch from Bags API
    const launches = await bagsApi.getTokenLaunchFeed();

    if (launches === null) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Bags API is not configured or temporarily unavailable',
      });
    }

    // Cache the result
    try {
      await redis.setCache(cacheKey, launches, BAGS_CACHE_TTL);
    } catch (cacheError) {
      // Non-critical: continue even if cache fails
      console.warn('[BagsRoute] Cache set failed:', cacheError.message);
    }

    res.json({
      success: true,
      source: 'api',
      data: launches,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/bags/fees/:tokenMint
 * Get token lifetime fees
 * No caching - always fresh data
 */
router.get('/fees/:tokenMint', async (req, res, next) => {
  try {
    const { tokenMint } = req.params;

    if (!tokenMint) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'tokenMint parameter is required',
      });
    }

    // Fetch from Bags API (no caching for fees)
    const fees = await bagsApi.getTokenLifetimeFees(tokenMint);

    if (fees === null) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Bags API is not configured or temporarily unavailable',
      });
    }

    res.json({
      success: true,
      tokenMint: tokenMint,
      lifetimeFeesLamports: fees,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/bags/quote
 * Get trade quote
 * No caching - quotes are time-sensitive
 */
router.get('/quote', async (req, res, next) => {
  try {
    const { inputMint, outputMint, amount, slippageMode, slippageBps } = req.query;

    // Validate required parameters
    if (!inputMint || !outputMint || !amount) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'inputMint, outputMint, and amount parameters are required',
      });
    }

    // Fetch from Bags API (no caching for quotes)
    const quote = await bagsApi.getTradeQuote({
      inputMint,
      outputMint,
      amount,
      slippageMode: slippageMode || 'auto',
      slippageBps: slippageBps ? parseInt(slippageBps, 10) : undefined,
    });

    if (quote === null) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Bags API is not configured or temporarily unavailable',
      });
    }

    res.json({
      success: true,
      quote: quote,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
