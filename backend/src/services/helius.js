/**
 * Helius Enhanced RPC Service
 * Provides priority fee estimates and enhanced TPS data via Helius API
 */

const axios = require('axios');
const config = require('../config');

/**
 * Get priority fee estimates from Helius
 * @returns {Promise<{low: number, medium: number, high: number, veryHigh: number, percentile90: number} | null>}
 */
async function getPriorityFeeEstimate() {
  // Check if Helius API key is configured
  if (!config.solana.heliusApiKey || !config.solana.heliusRpcUrl) {
    console.log('[Helius] No API key configured, skipping priority fee fetch');
    return null;
  }

  try {
    const response = await axios.post(
      config.solana.heliusRpcUrl,
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'getPriorityFeeEstimate',
        params: [
          {
            // Optional: specify account keys to consider
            // accountKeys: [],
            options: {
              includeAllPriorityFeeLevels: true,
            },
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.data.error) {
      console.error('[Helius] RPC error:', response.data.error);
      return null;
    }

    const result = response.data.result;
    
    if (!result || !result.priorityFeeLevels) {
      console.log('[Helius] No priority fee data in response');
      return null;
    }

    const levels = result.priorityFeeLevels;

    return {
      low: levels.min || 0,
      medium: levels.medium || 0,
      high: levels.high || 0,
      veryHigh: levels.veryHigh || 0,
      percentile90: levels.high || 0, // Use high as proxy for 90th percentile
    };
  } catch (error) {
    console.error('[Helius] getPriorityFeeEstimate error:', error.message);
    return null;
  }
}

/**
 * Get enhanced TPS data from Helius
 * Note: Helius doesn't have a specific enhanced TPS endpoint,
 * but this function can be extended if they add one.
 * @returns {Promise<{tps: number, source: string} | null>}
 */
async function getEnhancedTps() {
  // Check if Helius API key is configured
  if (!config.solana.heliusApiKey || !config.solana.heliusRpcUrl) {
    console.log('[Helius] No API key configured, skipping enhanced TPS fetch');
    return null;
  }

  try {
    // Helius doesn't have a specific enhanced TPS endpoint yet
    // Fall back to standard getRecentPerformanceSamples
    const response = await axios.post(
      config.solana.heliusRpcUrl,
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'getRecentPerformanceSamples',
        params: [1],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.data.error) {
      console.error('[Helius] RPC error:', response.data.error);
      return null;
    }

    const result = response.data.result;
    
    if (!result || result.length === 0) {
      return null;
    }

    const sample = result[0];
    const tps = sample.numTransactions / sample.samplePeriodSecs;

    return {
      tps: Math.round(tps * 100) / 100,
      source: 'helius',
      samplePeriod: sample.samplePeriodSecs,
      numTransactions: sample.numTransactions,
    };
  } catch (error) {
    console.error('[Helius] getEnhancedTps error:', error.message);
    return null;
  }
}

/**
 * Get account info via Helius (useful for enhanced data)
 * @param {string} pubkey - Account public key
 * @returns {Promise<Object | null>}
 */
async function getAccountInfo(pubkey) {
  if (!config.solana.heliusApiKey || !config.solana.heliusRpcUrl) {
    return null;
  }

  try {
    const response = await axios.post(
      config.solana.heliusRpcUrl,
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [
          pubkey,
          {
            encoding: 'jsonParsed',
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (response.data.error) {
      console.error('[Helius] RPC error:', response.data.error);
      return null;
    }

    return response.data.result;
  } catch (error) {
    console.error('[Helius] getAccountInfo error:', error.message);
    return null;
  }
}

/**
 * Check if Helius is properly configured
 * @returns {boolean}
 */
function isConfigured() {
  return !!(config.solana.heliusApiKey && config.solana.heliusRpcUrl);
}

module.exports = {
  getPriorityFeeEstimate,
  getEnhancedTps,
  getAccountInfo,
  isConfigured,
};
