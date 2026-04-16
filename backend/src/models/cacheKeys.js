/**
 * Redis cache key constants and helpers
 * Centralizes cache key naming conventions and TTL values
 */

module.exports = {
  // Cache key constants
  NETWORK_CURRENT: 'network:current',        // TTL: 60s
  RPC_LATEST: 'rpc:latest',                  // TTL: 60s
  EPOCH_INFO: 'epoch:info',                   // TTL: 120s
  VALIDATORS_TOP100: 'validators:top100',     // TTL: 300s
  VALIDATORS_TOTAL_COUNT: 'validators:totalCount', // TTL: 300s

  /**
   * Get cache key for a specific RPC provider
   * @param {string} name - Provider name
   * @returns {string} Cache key
   */
  RPC_PROVIDER: (name) => `rpc:${name}:latest`, // TTL: 60s

  /**
   * Get cache key for validator details
   * @param {string} votePubkey - Validator vote pubkey
   * @returns {string} Cache key
   */
  VALIDATOR_DETAIL: (votePubkey) => `validator:${votePubkey}`, // TTL: 300s

  /**
   * Get cache key for validator historical data
   * @param {string} votePubkey - Validator vote pubkey
   * @param {string} range - Time range (1h, 24h, 7d)
   * @returns {string} Cache key
   */
  VALIDATOR_HISTORY: (votePubkey, range) => `validator:${votePubkey}:history:${range}`, // TTL: 300s

  /**
   * Get cache key for network history
   * @param {string} range - Time range (1h, 24h, 7d)
   * @returns {string} Cache key
   */
  NETWORK_HISTORY: (range) => `network:history:${range}`, // TTL: 300s

  // TTL values in seconds
  TTL: {
    CRITICAL: 60,    // 1 min for frequently updated data
    ROUTINE: 300,    // 5 min for validator lists
    EPOCH: 120,      // 2 min for epoch info
    HISTORY: 300,    // 5 min for historical data
  },
};
