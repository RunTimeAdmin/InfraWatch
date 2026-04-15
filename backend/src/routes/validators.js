/**
 * Validators Routes
 * Provides endpoints for validator data
 */

const express = require('express');
const router = express.Router();
const queries = require('../models/queries');
const redis = require('../models/redis');
const cacheKeys = require('../models/cacheKeys');
const validatorsApp = require('../services/validatorsApp');

/**
 * GET /api/validators/top?limit=50
 * Get top validators sorted by score
 */
router.get('/top', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const clampedLimit = Math.min(Math.max(limit, 1), 100);

    // Try cache first
    let cached = null;
    try {
      cached = await redis.getCache(cacheKeys.VALIDATORS_TOP100);
      if (cached) {
        // Return requested subset from cache
        return res.json(cached.slice(0, clampedLimit));
      }
    } catch (redisError) {
      // Redis unavailable, continue to DB fallback
    }

    // Fallback to DB
    let validators = [];
    try {
      validators = await queries.getTopValidators(clampedLimit);
    } catch (dbError) {
      // DB unavailable - return empty array
      return res.json([]);
    }
    res.json(validators);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/validators/:votePubkey
 * Get single validator detail
 */
router.get('/:votePubkey', async (req, res, next) => {
  try {
    const { votePubkey } = req.params;

    if (!votePubkey) {
      return res.status(400).json({
        error: 'Missing votePubkey parameter',
      });
    }

    // Try cache first
    const cacheKey = cacheKeys.VALIDATOR_DETAIL(votePubkey);
    let cached = null;
    try {
      cached = await redis.getCache(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    } catch (redisError) {
      // Redis unavailable, continue
    }

    // Try to fetch fresh data from Validators.app
    let validator = null;
    try {
      validator = await validatorsApp.getValidatorDetail(votePubkey);
    } catch (fetchError) {
      console.warn('[ValidatorsRoute] Fetch from Validators.app failed:', fetchError.message);
    }

    // Fallback to DB if API fetch failed or returned null
    if (!validator) {
      try {
        validator = await queries.getValidatorByPubkey(votePubkey);
      } catch (dbError) {
        // DB unavailable
      }
    }

    if (!validator) {
      return res.status(404).json({
        error: 'Validator not found',
        votePubkey,
      });
    }

    // Cache the result
    try {
      await redis.setCache(cacheKey, validator, cacheKeys.TTL.ROUTINE);
    } catch (cacheError) {
      console.warn('[ValidatorsRoute] Cache set failed:', cacheError.message);
    }

    res.json(validator);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
