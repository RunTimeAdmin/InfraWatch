/**
 * Validators.app API Client
 * Fetches validator data with rate limiting and caching
 */

const axios = require('axios');
const config = require('../config');

// Rate limiter: max 40 requests per 5 minutes
class RateLimiter {
  constructor(maxRequests = 40, windowMs = 5 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
    this.queue = [];
    this.processing = false;
  }

  /**
   * Clean up old requests outside the window
   */
  cleanup() {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    this.requests = this.requests.filter(timestamp => timestamp > cutoff);
  }

  /**
   * Get current request count in window
   */
  getCurrentCount() {
    this.cleanup();
    return this.requests.length;
  }

  /**
   * Get remaining requests in window
   */
  getRemaining() {
    return this.maxRequests - this.getCurrentCount();
  }

  /**
   * Get time until next slot available (ms)
   */
  getTimeUntilNextSlot() {
    this.cleanup();
    if (this.requests.length < this.maxRequests) {
      return 0;
    }
    const oldestRequest = Math.min(...this.requests);
    return (oldestRequest + this.windowMs) - Date.now();
  }

  /**
   * Acquire a request slot
   */
  async acquire() {
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }

  /**
   * Process the queue
   */
  async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      this.cleanup();

      if (this.requests.length < this.maxRequests) {
        // Slot available
        this.requests.push(Date.now());
        const resolve = this.queue.shift();
        resolve();
      } else {
        // Wait until a slot is available
        const waitTime = this.getTimeUntilNextSlot();
        if (waitTime > 0) {
          // Log warning if approaching limit
          if (this.requests.length >= this.maxRequests - 5) {
            console.warn(`[ValidatorsApp] Rate limit warning: ${this.getRemaining()} requests remaining, waiting ${Math.ceil(waitTime / 1000)}s`);
          }
          await this.sleep(waitTime);
        }
      }
    }

    this.processing = false;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create rate limiter instance
const rateLimiter = new RateLimiter(40, 5 * 60 * 1000);

// Module-level cache
let validatorsCache = null;
let cacheTimestamp = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Make a rate-limited request to Validators.app API
 * @param {string} endpoint - API endpoint path
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>}
 */
async function makeRequest(endpoint, params = {}) {
  // Check if API key is configured
  if (!config.validatorsApp.apiKey) {
    console.log('[ValidatorsApp] No API key configured');
  }

  await rateLimiter.acquire();

  try {
    const url = `${config.validatorsApp.baseUrl}${endpoint}`;
    const headers = {};
    
    if (config.validatorsApp.apiKey) {
      headers['Token'] = config.validatorsApp.apiKey;
    }

    const response = await axios.get(url, {
      params: {
        ...params,
        network: 'mainnet',
      },
      headers,
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    console.error('[ValidatorsApp] Request error:', error.message);
    if (error.response) {
      console.error('[ValidatorsApp] Response status:', error.response.status);
      console.error('[ValidatorsApp] Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Normalize validator data from Validators.app format to our schema
 * @param {Object} validator - Raw validator data
 * @returns {Object} Normalized validator
 */
function normalizeValidator(validator) {
  return {
    vote_pubkey: validator.vote_account || validator.vote_pubkey || '',
    identity_pubkey: validator.account || validator.identity_pubkey || '',
    name: validator.name || 'Unknown',
    avatar_url: validator.avatar_url || null,
    score: validator.score || 0,
    stake_sol: (validator.active_stake || 0) / 1e9,
    commission: validator.commission || 0,
    is_delinquent: validator.delinquent || false,
    skip_rate: validator.skipped_slot_percent || 0,
    software_version: validator.software_version || null,
    data_center: validator.data_center_key || null,
    asn: validator.asn || null,
    jito_enabled: validator.jito || false,
    // Additional fields for reference
    activated_stake: validator.activated_stake || 0,
    credits: validator.credits || 0,
    epoch_credits: validator.epoch_credits || 0,
    root_slot: validator.root_slot || 0,
    last_vote: validator.last_vote || 0,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Get validators list
 * @param {number} limit - Number of validators to fetch (default: 100)
 * @returns {Promise<Array<Object>>} Normalized validators array
 */
async function getValidators(limit = 100) {
  try {
    const data = await makeRequest('/validators.json', {
      order: 'score',
      limit,
    });

    if (!data || !Array.isArray(data)) {
      console.error('[ValidatorsApp] Invalid response format');
      return [];
    }

    const validators = data.map(normalizeValidator);

    // Update cache
    validatorsCache = validators;
    cacheTimestamp = Date.now();

    return validators;
  } catch (error) {
    console.error('[ValidatorsApp] getValidators error:', error.message);
    return [];
  }
}

/**
 * Get detailed validator info
 * @param {string} votePubkey - Validator vote account pubkey
 * @returns {Promise<Object | null>} Detailed validator info
 */
async function getValidatorDetail(votePubkey) {
  try {
    const data = await makeRequest(`/validators/${votePubkey}.json`);

    if (!data) {
      return null;
    }

    return normalizeValidator(data);
  } catch (error) {
    console.error('[ValidatorsApp] getValidatorDetail error:', error.message);
    return null;
  }
}

/**
 * Get Ping Thing latency data
 * @returns {Promise<Object | null>} Ping Thing data from multiple regions
 */
async function getPingThing() {
  try {
    const data = await makeRequest('/ping-thing/mainnet.json');
    return data;
  } catch (error) {
    console.error('[ValidatorsApp] getPingThing error:', error.message);
    return null;
  }
}

/**
 * Get cached validators if available and not expired
 * @returns {Array<Object> | null}
 */
function getCachedValidators() {
  if (!validatorsCache || !cacheTimestamp) {
    return null;
  }

  const now = Date.now();
  if (now - cacheTimestamp > CACHE_TTL_MS) {
    return null;
  }

  return validatorsCache;
}

/**
 * Detect commission changes between current and cached validators
 * @param {Array<Object>} currentValidators - Current validator list
 * @param {Array<Object>} cachedValidators - Previously cached validator list
 * @returns {Array<{votePubkey: string, name: string, oldCommission: number, newCommission: number, changeType: 'increase' | 'decrease'}>}
 */
function detectCommissionChanges(currentValidators, cachedValidators) {
  if (!cachedValidators || !Array.isArray(cachedValidators)) {
    return [];
  }

  const changes = [];
  const cachedMap = new Map();

  // Build map of cached validators by vote pubkey
  for (const validator of cachedValidators) {
    cachedMap.set(validator.vote_pubkey, validator);
  }

  // Compare with current validators
  for (const current of currentValidators) {
    const cached = cachedMap.get(current.vote_pubkey);
    
    if (cached && cached.commission !== current.commission) {
      const changeType = current.commission > cached.commission ? 'increase' : 'decrease';
      changes.push({
        votePubkey: current.vote_pubkey,
        name: current.name,
        oldCommission: cached.commission,
        newCommission: current.commission,
        changeType,
      });
    }
  }

  return changes;
}

/**
 * Get delinquent validators from cache or fresh fetch
 * @returns {Promise<Array<Object>>}
 */
async function getDelinquentValidators() {
  // Try cache first for delinquency data (1 min TTL for this)
  const cached = getCachedValidators();
  if (cached) {
    const delinquent = cached.filter(v => v.is_delinquent);
    // Only use cache if it's less than 1 minute old for delinquency data
    if (cacheTimestamp && (Date.now() - cacheTimestamp < 60000)) {
      return delinquent;
    }
  }

  // Fetch fresh data
  const validators = await getValidators(1000);
  return validators.filter(v => v.is_delinquent);
}

/**
 * Get top validators by stake
 * @param {number} count - Number of validators to return
 * @returns {Promise<Array<Object>>}
 */
async function getTopValidatorsByStake(count = 10) {
  const validators = await getValidators(1000);
  
  return validators
    .sort((a, b) => b.stake_sol - a.stake_sol)
    .slice(0, count);
}

/**
 * Get validators by data center
 * @returns {Promise<Map<string, Array<Object>>>}
 */
async function getValidatorsByDataCenter() {
  const validators = await getValidators(1000);
  const byDc = new Map();

  for (const validator of validators) {
    const dc = validator.data_center || 'Unknown';
    if (!byDc.has(dc)) {
      byDc.set(dc, []);
    }
    byDc.get(dc).push(validator);
  }

  return byDc;
}

/**
 * Check if Validators.app API is configured
 * @returns {boolean}
 */
function isConfigured() {
  return !!config.validatorsApp.apiKey;
}

/**
 * Get rate limiter status
 * @returns {{current: number, max: number, remaining: number, queueLength: number}}
 */
function getRateLimitStatus() {
  return {
    current: rateLimiter.getCurrentCount(),
    max: rateLimiter.maxRequests,
    remaining: rateLimiter.getRemaining(),
    queueLength: rateLimiter.queue.length,
  };
}

module.exports = {
  getValidators,
  getValidatorDetail,
  getPingThing,
  getCachedValidators,
  detectCommissionChanges,
  getDelinquentValidators,
  getTopValidatorsByStake,
  getValidatorsByDataCenter,
  isConfigured,
  getRateLimitStatus,
  // Export for testing
  RateLimiter,
  normalizeValidator,
};
