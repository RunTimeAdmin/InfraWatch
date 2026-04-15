/**
 * RPC Routes
 * Provides endpoints for RPC provider health and status
 */

const express = require('express');
const router = express.Router();
const queries = require('../models/queries');
const redis = require('../models/redis');
const cacheKeys = require('../models/cacheKeys');
const rpcProber = require('../services/rpcProber');

/**
 * GET /api/rpc/status
 * Get current RPC provider status with rolling stats and recommendation
 */
router.get('/status', async (req, res, next) => {
  try {
    // Try cache first for latest results
    let providers = null;
    try {
      providers = await redis.getCache(cacheKeys.RPC_LATEST);
    } catch (redisError) {
      // Redis unavailable, continue to DB fallback
    }

    // Fallback to DB if no cache
    if (!providers) {
      try {
        providers = await queries.getRpcLatestByProvider();
        // Transform DB rows to match expected format
        providers = providers.map(p => ({
          providerName: p.provider_name,
          endpoint: p.endpoint_url,
          latencyMs: p.latency_ms,
          isHealthy: p.is_healthy,
          slotHeight: p.slot_height,
          error: p.error_message,
          timestamp: p.timestamp,
        }));
      } catch (dbError) {
        // DB unavailable - use empty array
        providers = [];
      }
    }

    // Get rolling stats for each provider
    const rollingStats = rpcProber.getAllProviderStats();

    // Merge latest results with rolling stats
    const enhancedProviders = providers.map(provider => {
      const stats = rollingStats.find(s => s.providerName === provider.providerName) || {};
      return {
        ...provider,
        stats: {
          p50: stats.p50 || 0,
          p95: stats.p95 || 0,
          p99: stats.p99 || 0,
          uptimePercent: stats.uptimePercent || 0,
          totalChecks: stats.totalChecks || 0,
          healthyChecks: stats.healthyChecks || 0,
          lastIncident: stats.lastIncident,
        },
        category: stats.category || 'unknown',
        requiresKey: stats.requiresKey || false,
        note: stats.note || null,
      };
    });

    // Get best provider recommendation
    const bestProvider = rpcProber.getBestProvider();
    const recommendation = bestProvider
      ? {
          name: bestProvider.providerName,
          latencyMs: bestProvider.p95,
          uptimePercent: bestProvider.uptimePercent,
        }
      : null;

    res.json({
      providers: enhancedProviders,
      recommendation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/rpc/:provider/history?range=1h|24h|7d
 * Get RPC health history for a specific provider
 */
router.get('/:provider/history', async (req, res, next) => {
  try {
    const { provider } = req.params;
    const { range = '1h' } = req.query;

    // Validate range parameter
    const validRanges = ['1h', '24h', '7d'];
    if (!validRanges.includes(range)) {
      return res.status(400).json({
        error: 'Invalid range parameter',
        validRanges,
      });
    }

    // Get history from DB
    let history = [];
    try {
      history = await queries.getRpcHistoryByProvider(provider, range);
    } catch (dbError) {
      // DB unavailable - return empty array
      return res.json([]);
    }

    // Transform to consistent format
    const transformed = history.map(h => ({
      providerName: h.provider_name,
      endpoint: h.endpoint_url,
      latencyMs: h.latency_ms,
      isHealthy: h.is_healthy,
      slotHeight: h.slot_height,
      error: h.error_message,
      timestamp: h.timestamp,
    }));

    res.json(transformed);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
