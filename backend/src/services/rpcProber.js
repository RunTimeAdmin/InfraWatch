/**
 * RPC Prober Service
 * Monitors health and latency of multiple Solana RPC providers
 */

const axios = require('axios');
const config = require('../config');

// RPC Provider Configuration
// Note: Some providers need user-supplied endpoints - these fall back to public endpoint as placeholder
const RPC_PROVIDERS = [
  {
    name: 'Solana Public',
    endpoint: 'https://api.mainnet-beta.solana.com',
    category: 'public',
  },
  {
    name: 'Helius',
    endpoint: config.solana.heliusRpcUrl || 'https://api.mainnet-beta.solana.com',
    category: 'premium',
    requiresKey: true,
  },
  {
    name: 'QuickNode',
    endpoint: process.env.QUICKNODE_RPC_URL || 'https://api.mainnet-beta.solana.com',
    category: 'premium',
    requiresKey: true,
    note: 'Set QUICKNODE_RPC_URL env var to use',
  },
  {
    name: 'Triton One',
    endpoint: process.env.TRITON_RPC_URL || 'https://api.mainnet-beta.solana.com',
    category: 'premium',
    requiresKey: true,
    note: 'Set TRITON_RPC_URL env var to use',
  },
  {
    name: 'Alchemy',
    endpoint: process.env.ALCHEMY_RPC_URL || 'https://api.mainnet-beta.solana.com',
    category: 'premium',
    requiresKey: true,
    note: 'Set ALCHEMY_RPC_URL env var to use',
  },
  {
    name: 'GenesysGo',
    endpoint: process.env.GENESYSGO_RPC_URL || 'https://api.mainnet-beta.solana.com',
    category: 'premium',
    requiresKey: true,
    note: 'Set GENESYSGO_RPC_URL env var to use',
  },
  {
    name: 'Syndica',
    endpoint: process.env.SYNDICA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    category: 'premium',
    requiresKey: true,
    note: 'Set SYNDICA_RPC_URL env var to use',
  },
  {
    name: 'Ankr',
    endpoint: 'https://rpc.ankr.com/solana',
    category: 'public',
  },
];

// Module-level cache for probe results
let latestProbeResults = [];
let probeHistory = new Map(); // providerName -> array of recent checks
const MAX_HISTORY_SIZE = 100; // Keep last 100 checks per provider

/**
 * Probe a single RPC provider
 * @param {Object} provider - Provider configuration
 * @returns {Promise<{providerName: string, endpoint: string, latencyMs: number, isHealthy: boolean, slotHeight: number, error?: string, timestamp: string}>}
 */
async function probeProvider(provider) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    const response = await axios.post(
      provider.endpoint,
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'getSlot',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );

    const latencyMs = Date.now() - startTime;

    if (response.data.error) {
      return {
        providerName: provider.name,
        endpoint: provider.endpoint,
        latencyMs: 0,
        isHealthy: false,
        slotHeight: 0,
        error: response.data.error.message || 'RPC error',
        timestamp,
      };
    }

    const slotHeight = response.data.result;

    return {
      providerName: provider.name,
      endpoint: provider.endpoint,
      latencyMs,
      isHealthy: true,
      slotHeight,
      timestamp,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    
    console.error(`[RpcProber] ${provider.name} probe error:`, error.message);
    
    return {
      providerName: provider.name,
      endpoint: provider.endpoint,
      latencyMs,
      isHealthy: false,
      slotHeight: 0,
      error: error.message,
      timestamp,
    };
  }
}

/**
 * Probe all configured providers concurrently
 * @returns {Promise<Array<Object>>} Array of probe results
 */
async function probeAllProviders() {
  const results = await Promise.allSettled(
    RPC_PROVIDERS.map(provider => probeProvider(provider))
  );

  const processedResults = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      // This shouldn't happen due to error handling in probeProvider, but just in case
      return {
        providerName: RPC_PROVIDERS[index].name,
        endpoint: RPC_PROVIDERS[index].endpoint,
        latencyMs: 0,
        isHealthy: false,
        slotHeight: 0,
        error: result.reason?.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  });

  // Update cache and history
  latestProbeResults = processedResults;
  
  for (const result of processedResults) {
    if (!probeHistory.has(result.providerName)) {
      probeHistory.set(result.providerName, []);
    }
    
    const history = probeHistory.get(result.providerName);
    history.push(result);
    
    // Trim history to max size
    if (history.length > MAX_HISTORY_SIZE) {
      history.shift();
    }
  }

  return processedResults;
}

/**
 * Calculate percentile from an array of numbers
 * @param {Array<number>} arr - Array of numbers
 * @param {number} p - Percentile (0-100)
 * @returns {number}
 */
function percentile(arr, p) {
  if (arr.length === 0) return 0;
  
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (upper >= sorted.length) return Math.round(sorted[lower]);
  
  const result = sorted[lower] * (1 - weight) + sorted[upper] * weight;
  return Math.round(result);
}

/**
 * Calculate rolling statistics for a provider
 * @param {string} providerName - Name of the provider
 * @param {Array<Object>} checks - Array of recent check results
 * @returns {Object} Statistics object
 */
function calculateRollingStats(providerName, checks) {
  if (!checks || checks.length === 0) {
    return {
      providerName,
      currentLatency: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      uptimePercent: 0,
      totalChecks: 0,
      healthyChecks: 0,
      lastIncident: null,
    };
  }

  const latencies = checks
    .filter(c => c.isHealthy && c.latencyMs > 0)
    .map(c => c.latencyMs);

  const totalChecks = checks.length;
  const healthyChecks = checks.filter(c => c.isHealthy).length;
  const uptimePercent = (healthyChecks / totalChecks) * 100;

  // Find last incident (most recent unhealthy check)
  const unhealthyChecks = checks.filter(c => !c.isHealthy);
  const lastIncident = unhealthyChecks.length > 0
    ? unhealthyChecks[unhealthyChecks.length - 1].timestamp
    : null;

  const currentLatency = Math.round(checks[checks.length - 1].latencyMs);

  return {
    providerName,
    currentLatency,
    p50: percentile(latencies, 50),
    p95: percentile(latencies, 95),
    p99: percentile(latencies, 99),
    uptimePercent: Math.round(uptimePercent * 100) / 100,
    totalChecks,
    healthyChecks,
    lastIncident,
  };
}

/**
 * Get statistics for all providers
 * @returns {Array<Object>} Array of provider statistics
 */
function getAllProviderStats() {
  const stats = [];
  
  for (const provider of RPC_PROVIDERS) {
    const checks = probeHistory.get(provider.name) || [];
    const providerStats = calculateRollingStats(provider.name, checks);
    
    stats.push({
      ...providerStats,
      category: provider.category,
      requiresKey: provider.requiresKey || false,
      note: provider.note || null,
    });
  }

  return stats;
}

/**
 * Get latest probe results
 * @returns {Array<Object>}
 */
function getProberResults() {
  return latestProbeResults;
}

/**
 * Get probe history for a specific provider
 * @param {string} providerName - Name of the provider
 * @returns {Array<Object>}
 */
function getProviderHistory(providerName) {
  return probeHistory.get(providerName) || [];
}

/**
 * Get the best performing provider based on recent stats
 * @returns {Object | null}
 */
function getBestProvider() {
  const stats = getAllProviderStats();
  
  // Filter to only healthy providers with data
  const healthyProviders = stats.filter(s => s.uptimePercent > 95 && s.totalChecks > 0);
  
  if (healthyProviders.length === 0) {
    return null;
  }

  // Sort by p95 latency (lower is better)
  return healthyProviders.sort((a, b) => a.p95 - b.p95)[0];
}

/**
 * Clear probe history (useful for testing)
 */
function clearHistory() {
  probeHistory.clear();
  latestProbeResults = [];
}

/**
 * Get provider configuration
 * @returns {Array<Object>}
 */
function getProviderConfig() {
  return RPC_PROVIDERS.map(p => ({
    name: p.name,
    category: p.category,
    requiresKey: p.requiresKey || false,
    note: p.note || null,
  }));
}

module.exports = {
  probeProvider,
  probeAllProviders,
  calculateRollingStats,
  getProberResults,
  getAllProviderStats,
  getProviderHistory,
  getBestProvider,
  clearHistory,
  getProviderConfig,
  RPC_PROVIDERS,
};
