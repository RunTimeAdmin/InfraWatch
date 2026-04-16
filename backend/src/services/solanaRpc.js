/**
 * Solana RPC Data Collection Service
 * Uses @solana/web3.js Connection class to fetch network metrics
 */

const { Connection } = require('@solana/web3.js');
const config = require('../config');

// Initialize connection to Solana RPC
const connection = new Connection(config.solana.rpcUrl, 'confirmed');

// Module-level variables for slot tracking
let lastSlot = null;
let lastSlotTimestamp = null;

/**
 * Get network health status
 * @returns {Promise<{status: 'UP' | 'DOWN', error?: string}>}
 */
async function getNetworkHealth() {
  try {
    // Try getHealth RPC method
    const health = await connection.getHealth();
    return {
      status: health === 'ok' ? 'UP' : 'DOWN',
    };
  } catch (error) {
    console.error('[SolanaRpc] getNetworkHealth error:', error.message);
    return {
      status: 'DOWN',
      error: error.message,
    };
  }
}

/**
 * Get current TPS from recent performance samples
 * @returns {Promise<{tps: number, samplePeriod: number, numTransactions: number}>}
 */
async function getCurrentTps() {
  try {
    const samples = await connection.getRecentPerformanceSamples(1);
    
    if (!samples || samples.length === 0) {
      return {
        tps: 0,
        samplePeriod: 0,
        numTransactions: 0,
      };
    }

    const sample = samples[0];
    const tps = sample.numTransactions / sample.samplePeriodSecs;

    return {
      tps: Math.round(tps * 100) / 100,
      samplePeriod: sample.samplePeriodSecs,
      numTransactions: sample.numTransactions,
    };
  } catch (error) {
    console.error('[SolanaRpc] getCurrentTps error:', error.message);
    return {
      tps: 0,
      samplePeriod: 0,
      numTransactions: 0,
    };
  }
}

/**
 * Get slot information and calculate slot progression/latency
 * @returns {Promise<{currentSlot: number, slotsPerSecond: number, estimatedLatencyMs: number}>}
 */
async function getSlotInfo() {
  try {
    const currentSlot = await connection.getSlot();
    const currentTimestamp = Date.now();

    let slotsPerSecond = 0;
    let estimatedLatencyMs = 0;

    if (lastSlot !== null && lastSlotTimestamp !== null) {
      const slotDelta = currentSlot - lastSlot;
      const timeDeltaMs = currentTimestamp - lastSlotTimestamp;
      
      if (timeDeltaMs > 0) {
        slotsPerSecond = (slotDelta * 1000) / timeDeltaMs;
        
        // Target: 2.5 slots per second (400ms per slot)
        const targetSlotsPerSecond = 2.5;
        const ratio = slotsPerSecond / targetSlotsPerSecond;
        
        // If ratio < 1, we're behind target, calculate latency
        if (ratio < 1) {
          // Estimated latency based on how far behind we are
          estimatedLatencyMs = Math.round((1 - ratio) * 1000);
        }
      }
    }

    // Update last known values
    lastSlot = currentSlot;
    lastSlotTimestamp = currentTimestamp;

    return {
      currentSlot,
      slotsPerSecond: Math.round(slotsPerSecond * 100) / 100,
      estimatedLatencyMs,
    };
  } catch (error) {
    console.error('[SolanaRpc] getSlotInfo error:', error.message);
    return {
      currentSlot: 0,
      slotsPerSecond: 0,
      estimatedLatencyMs: 0,
    };
  }
}

/**
 * Get epoch information
 * @returns {Promise<{epoch: number, slotIndex: number, slotsInEpoch: number, progress: number, slotsRemaining: number, etaMs: number}>}
 */
async function getEpochInfo() {
  try {
    const epochInfo = await connection.getEpochInfo();
    
    const slotsInEpoch = epochInfo.slotsInEpoch;
    const slotIndex = epochInfo.slotIndex;
    const slotsRemaining = slotsInEpoch - slotIndex;
    const progress = (slotIndex / slotsInEpoch) * 100;
    
    // Estimate time remaining (assuming ~400ms per slot)
    const avgSlotTimeMs = 400;
    const etaMs = slotsRemaining * avgSlotTimeMs;

    return {
      epoch: epochInfo.epoch,
      slotIndex,
      slotsInEpoch,
      progress: Math.round(progress * 100) / 100,
      slotsRemaining,
      etaMs,
    };
  } catch (error) {
    console.error('[SolanaRpc] getEpochInfo error:', error.message);
    return {
      epoch: 0,
      slotIndex: 0,
      slotsInEpoch: 0,
      progress: 0,
      slotsRemaining: 0,
      etaMs: 0,
    };
  }
}

/**
 * Get delinquent validators
 * @returns {Promise<{delinquentCount: number, totalCount: number, delinquentPubkeys: string[]}>}
 */
async function getDelinquentValidators() {
  try {
    const voteAccounts = await connection.getVoteAccounts();
    
    const delinquentPubkeys = voteAccounts.delinquent.map(v => v.votePubkey);
    const delinquentCount = delinquentPubkeys.length;
    const totalCount = voteAccounts.current.length + delinquentCount;

    return {
      delinquentCount,
      totalCount,
      delinquentPubkeys,
    };
  } catch (error) {
    console.error('[SolanaRpc] getDelinquentValidators error:', error.message);
    return {
      delinquentCount: 0,
      totalCount: 0,
      delinquentPubkeys: [],
    };
  }
}

/**
 * Get average confirmation time from recent performance samples
 * @returns {Promise<{avgConfirmationMs: number, sampleCount: number}>}
 */
async function getConfirmationTime() {
  try {
    // Get ~1 hour of data (60 samples at ~1 sample per minute)
    const samples = await connection.getRecentPerformanceSamples(60);
    
    if (!samples || samples.length === 0) {
      return {
        avgConfirmationMs: 0,
        sampleCount: 0,
      };
    }

    // Calculate average slot time from performance samples
    // Each sample has numSlots and samplePeriodSecs
    // avgSlotTime = samplePeriodSecs / numSlots (in seconds per slot)
    // Confirmation time ≈ avgSlotTime * 32 (for finalized confirmation, ~32 slots)
    let totalSlotTime = 0;
    let validSamples = 0;
    for (const sample of samples) {
      if (sample.numSlots > 0) {
        totalSlotTime += (sample.samplePeriodSecs / sample.numSlots);
        validSamples++;
      }
    }

    if (validSamples === 0) {
      return { avgConfirmationMs: 0, sampleCount: 0 };
    }

    const avgSlotTimeSecs = totalSlotTime / validSamples;
    // Optimistic confirmation typically takes ~32 slots
    const avgConfirmationMs = Math.round(avgSlotTimeSecs * 32 * 1000);

    return {
      avgConfirmationMs,
      sampleCount: validSamples,
    };
  } catch (error) {
    console.error('[SolanaRpc] getConfirmationTime error:', error.message);
    return {
      avgConfirmationMs: 0,
      sampleCount: 0,
    };
  }
}

/**
 * Calculate network congestion score (0-100)
 * @param {number} tps - Current transactions per second
 * @param {number} priorityFee90th - 90th percentile priority fee in microlamports
 * @param {number} slotLatencyMs - Estimated slot latency in milliseconds
 * @returns {number} Congestion score 0-100 (0 = no congestion, 100 = severe congestion)
 */
function calculateCongestionScore(tps, priorityFee90th, slotLatencyMs) {
  // TPS component (40%): 0 when TPS > 3000, 100 when TPS < 500, linear between
  let tpsScore = 0;
  if (tps <= 500) {
    tpsScore = 100;
  } else if (tps >= 3000) {
    tpsScore = 0;
  } else {
    tpsScore = ((3000 - tps) / (3000 - 500)) * 100;
  }

  // Priority fee component (30%): 0 when < 1000, 100 when > 100000, log scale
  let feeScore = 0;
  if (priorityFee90th >= 100000) {
    feeScore = 100;
  } else if (priorityFee90th <= 1000) {
    feeScore = 0;
  } else {
    // Log scale between 1000 and 100000
    const logMin = Math.log10(1000);
    const logMax = Math.log10(100000);
    const logValue = Math.log10(priorityFee90th);
    feeScore = ((logValue - logMin) / (logMax - logMin)) * 100;
  }

  // Slot latency component (30%): 0 when < 450ms, 100 when > 1000ms, linear
  let latencyScore = 0;
  if (slotLatencyMs >= 1000) {
    latencyScore = 100;
  } else if (slotLatencyMs <= 450) {
    latencyScore = 0;
  } else {
    latencyScore = ((slotLatencyMs - 450) / (1000 - 450)) * 100;
  }

  // Weighted average
  const weightedScore = (tpsScore * 0.4) + (feeScore * 0.3) + (latencyScore * 0.3);
  
  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(weightedScore)));
}

/**
 * Collect complete network snapshot
 * @param {Object} priorityFeeData - Optional priority fee data from Helius
 * @returns {Promise<Object>} Complete network snapshot
 */
async function collectNetworkSnapshot(priorityFeeData = null) {
  try {
    const [
      health,
      tps,
      slotInfo,
      epochInfo,
      delinquentValidators,
      confirmationTime,
    ] = await Promise.all([
      getNetworkHealth(),
      getCurrentTps(),
      getSlotInfo(),
      getEpochInfo(),
      getDelinquentValidators(),
      getConfirmationTime(),
    ]);

    // Calculate congestion score — use priority fee data if available, otherwise TPS + latency only
    let congestionScore = 0;
    if (priorityFeeData && priorityFeeData.percentile90 !== undefined) {
      congestionScore = calculateCongestionScore(
        tps.tps,
        priorityFeeData.percentile90,
        slotInfo.estimatedLatencyMs
      );
    } else {
      // Fallback: calculate from TPS and slot latency only (no priority fee component)
      const tpsScore = tps.tps > 3000 ? 0 : tps.tps < 500 ? 100 : ((3000 - tps.tps) / 2500) * 100;
      const latencyScore = slotInfo.estimatedLatencyMs < 450 ? 0 : slotInfo.estimatedLatencyMs > 1000 ? 100 : ((slotInfo.estimatedLatencyMs - 450) / 550) * 100;
      congestionScore = Math.round(Math.max(0, Math.min(100, tpsScore * 0.6 + latencyScore * 0.4)));
    }

    const snapshot = {
      timestamp: new Date().toISOString(),
      health: health.status,
      tps: tps.tps,
      slot: slotInfo.currentSlot,
      slotLatencyMs: slotInfo.estimatedLatencyMs,
      epoch: epochInfo.epoch,
      epochProgress: epochInfo.progress,
      epochEtaMs: epochInfo.etaMs,
      delinquentValidators: delinquentValidators.delinquentCount,
      totalValidators: delinquentValidators.totalCount,
      avgConfirmationMs: confirmationTime.avgConfirmationMs,
      congestionScore,
      priorityFeeLow: priorityFeeData?.low || null,
      priorityFeeMedium: priorityFeeData?.medium || null,
      priorityFeeHigh: priorityFeeData?.high || null,
      priorityFeeVeryHigh: priorityFeeData?.veryHigh || null,
      priorityFee90th: priorityFeeData?.percentile90 || null,
    };

    return snapshot;
  } catch (error) {
    console.error('[SolanaRpc] collectNetworkSnapshot error:', error.message);
    throw error;
  }
}

module.exports = {
  getNetworkHealth,
  getCurrentTps,
  getSlotInfo,
  getEpochInfo,
  getDelinquentValidators,
  getConfirmationTime,
  calculateCongestionScore,
  collectNetworkSnapshot,
};
