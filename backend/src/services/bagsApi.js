/**
 * Bags FM API Service
 * Provides integration with Bags FM public API for token launch data and trading
 */

const axios = require('axios');
const config = require('../config');

/**
 * Get token launch feed from Bags FM
 * @returns {Promise<Array<{name: string, symbol: string, description: string, image: string, tokenMint: string, status: string, twitter: string, website: string, dbcPoolKey: string, dbcConfigKey: string}> | null>}
 */
async function getTokenLaunchFeed() {
  // Check if Bags API key is configured
  if (!config.bags.apiKey) {
    console.log('[BagsAPI] No API key configured, skipping token launch feed fetch');
    return null;
  }

  try {
    const response = await axios.get(
      `${config.bags.baseUrl}/token-launch/feed`,
      {
        headers: {
          'x-api-key': config.bags.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (!response.data.success) {
      console.error('[BagsAPI] API error:', response.data);
      return null;
    }

    return response.data.response;
  } catch (error) {
    console.error('[BagsAPI] getTokenLaunchFeed error:', error.message);
    return null;
  }
}

/**
 * Get Bags pools from Bags FM
 * @param {boolean} onlyMigrated - Filter to only migrated pools
 * @returns {Promise<Array<{tokenMint: string, dbcConfigKey: string, dbcPoolKey: string, dammV2PoolKey: string}> | null>}
 */
async function getBagsPools(onlyMigrated = false) {
  // Check if Bags API key is configured
  if (!config.bags.apiKey) {
    console.log('[BagsAPI] No API key configured, skipping pools fetch');
    return null;
  }

  try {
    const response = await axios.get(
      `${config.bags.baseUrl}/solana/bags/pools`,
      {
        params: {
          onlyMigrated: onlyMigrated,
        },
        headers: {
          'x-api-key': config.bags.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (!response.data.success) {
      console.error('[BagsAPI] API error:', response.data);
      return null;
    }

    return response.data.response;
  } catch (error) {
    console.error('[BagsAPI] getBagsPools error:', error.message);
    return null;
  }
}

/**
 * Get token lifetime fees from Bags FM
 * @param {string} tokenMint - Token mint address
 * @returns {Promise<string | null>} - Lifetime fees in lamports as string
 */
async function getTokenLifetimeFees(tokenMint) {
  // Check if Bags API key is configured
  if (!config.bags.apiKey) {
    console.log('[BagsAPI] No API key configured, skipping lifetime fees fetch');
    return null;
  }

  if (!tokenMint) {
    console.log('[BagsAPI] No tokenMint provided for lifetime fees fetch');
    return null;
  }

  try {
    const response = await axios.get(
      `${config.bags.baseUrl}/token-launch/lifetime-fees`,
      {
        params: {
          tokenMint: tokenMint,
        },
        headers: {
          'x-api-key': config.bags.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (!response.data.success) {
      console.error('[BagsAPI] API error:', response.data);
      return null;
    }

    return response.data.response;
  } catch (error) {
    console.error('[BagsAPI] getTokenLifetimeFees error:', error.message);
    return null;
  }
}

/**
 * Get trade quote from Bags FM
 * @param {Object} params - Quote parameters
 * @param {string} params.inputMint - Input token mint address
 * @param {string} params.outputMint - Output token mint address
 * @param {string} params.amount - Amount in lamports/base units
 * @param {string} params.slippageMode - Slippage mode (e.g., 'auto')
 * @param {number} [params.slippageBps] - Slippage in basis points (optional)
 * @returns {Promise<Object | null>} - Trade quote response
 */
async function getTradeQuote({ inputMint, outputMint, amount, slippageMode, slippageBps }) {
  // Check if Bags API key is configured
  if (!config.bags.apiKey) {
    console.log('[BagsAPI] No API key configured, skipping trade quote fetch');
    return null;
  }

  if (!inputMint || !outputMint || !amount) {
    console.log('[BagsAPI] Missing required parameters for trade quote');
    return null;
  }

  try {
    const params = {
      inputMint: inputMint,
      outputMint: outputMint,
      amount: amount,
      slippageMode: slippageMode || 'auto',
    };

    if (slippageBps !== undefined) {
      params.slippageBps = slippageBps;
    }

    const response = await axios.get(
      `${config.bags.baseUrl}/trade/quote`,
      {
        params: params,
        headers: {
          'x-api-key': config.bags.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (!response.data.success) {
      console.error('[BagsAPI] API error:', response.data);
      return null;
    }

    return response.data.response;
  } catch (error) {
    console.error('[BagsAPI] getTradeQuote error:', error.message);
    return null;
  }
}

/**
 * Check if Bags API is properly configured
 * @returns {boolean}
 */
function isConfigured() {
  return !!(config.bags.apiKey);
}

module.exports = {
  getTokenLaunchFeed,
  getBagsPools,
  getTokenLifetimeFees,
  getTradeQuote,
  isConfigured,
};
