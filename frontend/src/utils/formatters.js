/**
 * Format a number with comma separators and appropriate decimal places
 * @param {number} n - Number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number
 */
export function formatNumber(n, decimals = 0) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format TPS (transactions per second)
 * @param {number} tps - TPS value
 * @returns {string} Formatted TPS string
 */
export function formatTps(tps) {
  if (tps === null || tps === undefined || isNaN(tps)) return '— TPS';
  return `${formatNumber(Math.round(tps))} TPS`;
}

/**
 * Format latency in milliseconds
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted latency string
 */
export function formatLatency(ms) {
  if (ms === null || ms === undefined || isNaN(ms)) return '—';
  return `${Math.round(ms)}ms`;
}

/**
 * Convert lamports to SOL and format
 * @param {number} lamports - Amount in lamports
 * @param {number} decimals - Decimal places (default: 4)
 * @returns {string} Formatted SOL amount
 */
export function formatSol(lamports, decimals = 4) {
  if (lamports === null || lamports === undefined || isNaN(lamports)) return '— SOL';
  const sol = lamports / 1_000_000_000;
  return `${sol.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })} SOL`;
}

/**
 * Format a percentage value
 * @param {number} value - Percentage value (e.g., 0.942 for 94.2%)
 * @param {number} decimals - Decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '—%';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a timestamp as relative time (e.g., "2m ago")
 * @param {string|number|Date} timestamp - Timestamp to format
 * @returns {string} Relative time string
 */
export function formatTimeAgo(timestamp) {
  if (!timestamp) return '—';
  
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

/**
 * Format epoch ETA from remaining slots
 * @param {number} slotsRemaining - Number of slots remaining
 * @returns {string} Formatted ETA string
 */
export function formatEpochEta(slotsRemaining) {
  if (slotsRemaining === null || slotsRemaining === undefined || isNaN(slotsRemaining)) {
    return '—';
  }
  
  // Assuming ~400ms per slot on average
  const msRemaining = slotsRemaining * 400;
  const hours = Math.floor(msRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `~${hours}h ${minutes}m`;
  }
  return `~${minutes}m`;
}

/**
 * Format a date to a readable string
 * @param {string|number|Date} timestamp - Timestamp to format
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp) {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format a datetime to a readable string
 * @param {string|number|Date} timestamp - Timestamp to format
 * @returns {string} Formatted datetime string
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * Format a large number in compact notation (e.g., 1.2M, 3.4K)
 * @param {number} n - Number to format
 * @returns {string} Compact formatted number
 */
export function formatCompact(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return n.toLocaleString('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  });
}
