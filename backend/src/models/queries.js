/**
 * Data Access Layer (DAL) for InfraWatch
 * Provides reusable query functions for all database operations
 * All functions use parameterized queries to prevent SQL injection
 */

const { query } = require('./db');

// ============================================================================
// Network Snapshots
// ============================================================================

/**
 * Insert a network snapshot
 * @param {Object} data - Network snapshot data
 * @param {number} data.tps - Transactions per second
 * @param {number} data.slot_height - Current slot height
 * @param {number} data.slot_latency_ms - Slot latency in milliseconds
 * @param {number} data.epoch - Current epoch
 * @param {number} data.epoch_progress - Epoch progress percentage (0-100)
 * @param {number} data.delinquent_count - Number of delinquent validators
 * @param {number} data.active_validators - Number of active validators
 * @param {number} data.confirmation_time_ms - Average confirmation time
 * @param {number} data.congestion_score - Network congestion score (0-100)
 * @returns {Promise<Object>} Inserted row
 */
async function insertNetworkSnapshot(data) {
  const sql = `
    INSERT INTO network_snapshots 
      (tps, slot_height, slot_latency_ms, epoch, epoch_progress, 
       delinquent_count, active_validators, confirmation_time_ms, congestion_score)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;
  const params = [
    data.tps,
    data.slot_height,
    data.slot_latency_ms,
    data.epoch,
    data.epoch_progress,
    data.delinquent_count,
    data.active_validators,
    data.confirmation_time_ms,
    data.congestion_score,
  ];
  const result = await query(sql, params);
  return result.rows[0];
}

/**
 * Get the most recent network snapshot
 * @returns {Promise<Object|null>} Latest snapshot or null
 */
async function getLatestNetworkSnapshot() {
  const sql = `
    SELECT * FROM network_snapshots
    ORDER BY timestamp DESC
    LIMIT 1
  `;
  const result = await query(sql);
  return result.rows[0] || null;
}

/**
 * Get network snapshots for a time range
 * @param {string} range - Time range ('1h', '24h', '7d')
 * @returns {Promise<Array>} Array of snapshots
 */
async function getNetworkHistory(range) {
  const rangeMap = {
    '1h': '1 hour',
    '24h': '24 hours',
    '7d': '7 days',
  };
  const interval = rangeMap[range] || '1 hour';

  const sql = `
    SELECT * FROM network_snapshots
    WHERE timestamp >= NOW() - INTERVAL '${interval}'
    ORDER BY timestamp ASC
  `;
  const result = await query(sql);
  return result.rows;
}

// ============================================================================
// RPC Health Checks
// ============================================================================

/**
 * Insert an RPC health check
 * @param {Object} data - RPC health check data
 * @param {string} data.provider_name - Provider name (e.g., 'Helius', 'QuickNode')
 * @param {string} data.endpoint_url - RPC endpoint URL
 * @param {number} data.latency_ms - Response latency in milliseconds
 * @param {boolean} data.is_healthy - Whether the provider is healthy
 * @param {number} data.slot_height - Current slot height reported by provider
 * @param {string} data.error_message - Error message if unhealthy
 * @returns {Promise<Object>} Inserted row
 */
async function insertRpcHealthCheck(data) {
  const sql = `
    INSERT INTO rpc_health_checks 
      (provider_name, endpoint_url, latency_ms, is_healthy, slot_height, error_message)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const params = [
    data.provider_name,
    data.endpoint_url,
    data.latency_ms,
    data.is_healthy,
    data.slot_height,
    data.error_message,
  ];
  const result = await query(sql, params);
  return result.rows[0];
}

/**
 * Get the latest health check for each RPC provider
 * @returns {Promise<Array>} Array of latest health checks per provider
 */
async function getRpcLatestByProvider() {
  const sql = `
    SELECT DISTINCT ON (provider_name) *
    FROM rpc_health_checks
    ORDER BY provider_name, timestamp DESC
  `;
  const result = await query(sql);
  return result.rows;
}

/**
 * Get RPC health history for a specific provider
 * @param {string} provider - Provider name
 * @param {string} range - Time range ('1h', '24h', '7d')
 * @returns {Promise<Array>} Array of health checks
 */
async function getRpcHistoryByProvider(provider, range) {
  const rangeMap = {
    '1h': '1 hour',
    '24h': '24 hours',
    '7d': '7 days',
  };
  const interval = rangeMap[range] || '1 hour';

  const sql = `
    SELECT * FROM rpc_health_checks
    WHERE provider_name = $1
      AND timestamp >= NOW() - INTERVAL '${interval}'
    ORDER BY timestamp ASC
  `;
  const result = await query(sql, [provider]);
  return result.rows;
}

// ============================================================================
// Validators
// ============================================================================

/**
 * Upsert a validator (insert or update on conflict)
 * @param {Object} data - Validator data
 * @param {string} data.vote_pubkey - Validator vote pubkey (primary key)
 * @param {string} data.identity_pubkey - Validator identity pubkey
 * @param {string} data.name - Validator name
 * @param {string} data.avatar_url - Avatar URL
 * @param {number} data.score - Validator score (0-100)
 * @param {number} data.stake_sol - Stake in SOL
 * @param {number} data.commission - Commission percentage
 * @param {boolean} data.is_delinquent - Whether validator is delinquent
 * @param {number} data.skip_rate - Skip rate (0-1)
 * @param {string} data.software_version - Solana software version
 * @param {string} data.data_center - Data center location
 * @param {string} data.asn - Autonomous System Number
 * @param {boolean} data.jito_enabled - Whether Jito is enabled
 * @returns {Promise<Object>} Upserted row
 */
async function upsertValidator(data) {
  const sql = `
    INSERT INTO validators 
      (vote_pubkey, identity_pubkey, name, avatar_url, score, stake_sol, 
       commission, is_delinquent, skip_rate, software_version, data_center, 
       asn, jito_enabled, last_updated)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
    ON CONFLICT (vote_pubkey) DO UPDATE SET
      identity_pubkey = EXCLUDED.identity_pubkey,
      name = EXCLUDED.name,
      avatar_url = EXCLUDED.avatar_url,
      score = EXCLUDED.score,
      stake_sol = EXCLUDED.stake_sol,
      commission = EXCLUDED.commission,
      is_delinquent = EXCLUDED.is_delinquent,
      skip_rate = EXCLUDED.skip_rate,
      software_version = EXCLUDED.software_version,
      data_center = EXCLUDED.data_center,
      asn = EXCLUDED.asn,
      jito_enabled = EXCLUDED.jito_enabled,
      last_updated = NOW()
    RETURNING *
  `;
  const params = [
    data.vote_pubkey,
    data.identity_pubkey,
    data.name,
    data.avatar_url,
    data.score,
    data.stake_sol,
    data.commission,
    data.is_delinquent,
    data.skip_rate,
    data.software_version,
    data.data_center,
    data.asn,
    data.jito_enabled,
  ];
  const result = await query(sql, params);
  return result.rows[0];
}

/**
 * Get top validators ordered by score
 * @param {number} limit - Number of validators to return (default: 100)
 * @returns {Promise<Array>} Array of validators
 */
async function getTopValidators(limit = 100) {
  const sql = `
    SELECT * FROM validators
    ORDER BY score DESC NULLS LAST
    LIMIT $1
  `;
  const result = await query(sql, [limit]);
  return result.rows;
}

/**
 * Get a validator by vote pubkey
 * @param {string} votePubkey - Validator vote pubkey
 * @returns {Promise<Object|null>} Validator or null if not found
 */
async function getValidatorByPubkey(votePubkey) {
  const sql = `
    SELECT * FROM validators
    WHERE vote_pubkey = $1
  `;
  const result = await query(sql, [votePubkey]);
  return result.rows[0] || null;
}

/**
 * Get validators by stake (descending)
 * @param {number} limit - Number of validators to return
 * @returns {Promise<Array>} Array of validators
 */
async function getValidatorsByStake(limit = 100) {
  const sql = `
    SELECT * FROM validators
    ORDER BY stake_sol DESC NULLS LAST
    LIMIT $1
  `;
  const result = await query(sql, [limit]);
  return result.rows;
}

// ============================================================================
// Validator Snapshots
// ============================================================================

/**
 * Insert a validator snapshot
 * @param {Object} data - Validator snapshot data
 * @param {string} data.vote_pubkey - Validator vote pubkey
 * @param {boolean} data.is_delinquent - Whether validator was delinquent
 * @param {number} data.skip_rate - Skip rate at time of snapshot
 * @param {number} data.commission - Commission at time of snapshot
 * @param {number} data.stake_sol - Stake at time of snapshot
 * @param {number} data.vote_distance - Vote distance
 * @param {number} data.root_distance - Root distance
 * @returns {Promise<Object>} Inserted row
 */
async function insertValidatorSnapshot(data) {
  const sql = `
    INSERT INTO validator_snapshots 
      (vote_pubkey, is_delinquent, skip_rate, commission, stake_sol, vote_distance, root_distance)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const params = [
    data.vote_pubkey,
    data.is_delinquent,
    data.skip_rate,
    data.commission,
    data.stake_sol,
    data.vote_distance,
    data.root_distance,
  ];
  const result = await query(sql, params);
  return result.rows[0];
}

/**
 * Get validator history for a specific pubkey
 * @param {string} votePubkey - Validator vote pubkey
 * @param {string} range - Time range ('1h', '24h', '7d')
 * @returns {Promise<Array>} Array of snapshots
 */
async function getValidatorHistory(votePubkey, range) {
  const rangeMap = {
    '1h': '1 hour',
    '24h': '24 hours',
    '7d': '7 days',
  };
  const interval = rangeMap[range] || '24 hours';

  const sql = `
    SELECT * FROM validator_snapshots
    WHERE vote_pubkey = $1
      AND timestamp >= NOW() - INTERVAL '${interval}'
    ORDER BY timestamp ASC
  `;
  const result = await query(sql, [votePubkey]);
  return result.rows;
}

// ============================================================================
// Alerts
// ============================================================================

/**
 * Insert an alert
 * @param {Object} data - Alert data
 * @param {string} data.type - Alert type (e.g., 'congestion', 'delinquent')
 * @param {string} data.severity - Severity level ('critical', 'warning', 'info')
 * @param {string} data.entity - Entity related to the alert (e.g., validator pubkey)
 * @param {string} data.message - Alert message
 * @param {Object} data.details_json - Additional details as JSON object
 * @returns {Promise<Object>} Inserted row
 */
async function insertAlert(data) {
  const sql = `
    INSERT INTO alerts 
      (type, severity, entity, message, details_json)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const params = [
    data.type,
    data.severity,
    data.entity,
    data.message,
    data.details_json ? JSON.stringify(data.details_json) : null,
  ];
  const result = await query(sql, params);
  return result.rows[0];
}

/**
 * Get recent alerts
 * @param {number} limit - Number of alerts to return (default: 50)
 * @param {string} severity - Filter by severity (optional)
 * @returns {Promise<Array>} Array of alerts
 */
async function getRecentAlerts(limit = 50, severity = null) {
  let sql;
  let params;

  if (severity) {
    sql = `
      SELECT * FROM alerts
      WHERE severity = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    params = [severity, limit];
  } else {
    sql = `
      SELECT * FROM alerts
      ORDER BY created_at DESC
      LIMIT $1
    `;
    params = [limit];
  }

  const result = await query(sql, params);
  return result.rows;
}

/**
 * Mark an alert as resolved
 * @param {number} alertId - Alert ID
 * @returns {Promise<Object|null>} Updated alert or null
 */
async function resolveAlert(alertId) {
  const sql = `
    UPDATE alerts
    SET resolved_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await query(sql, [alertId]);
  return result.rows[0] || null;
}

/**
 * Get active (unresolved) alerts
 * @param {number} limit - Number of alerts to return
 * @returns {Promise<Array>} Array of active alerts
 */
async function getActiveAlerts(limit = 50) {
  const sql = `
    SELECT * FROM alerts
    WHERE resolved_at IS NULL
    ORDER BY 
      CASE severity
        WHEN 'critical' THEN 1
        WHEN 'warning' THEN 2
        WHEN 'info' THEN 3
        ELSE 4
      END,
      created_at DESC
    LIMIT $1
  `;
  const result = await query(sql, [limit]);
  return result.rows;
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // Network snapshots
  insertNetworkSnapshot,
  getLatestNetworkSnapshot,
  getNetworkHistory,

  // RPC health checks
  insertRpcHealthCheck,
  getRpcLatestByProvider,
  getRpcHistoryByProvider,

  // Validators
  upsertValidator,
  getTopValidators,
  getValidatorByPubkey,
  getValidatorsByStake,

  // Validator snapshots
  insertValidatorSnapshot,
  getValidatorHistory,

  // Alerts
  insertAlert,
  getRecentAlerts,
  resolveAlert,
  getActiveAlerts,
};
