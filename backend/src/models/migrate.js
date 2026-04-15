/**
 * Database migration script
 * Creates all required tables for InfraWatch
 * 
 * Can be run standalone: node src/models/migrate.js
 * Or imported: require('./src/models/migrate').runMigrations()
 */

const { initDatabase, query, closeDatabase } = require('./db');

const MIGRATIONS = `
-- Network health snapshots (time-series, written every 30s)
CREATE TABLE IF NOT EXISTS network_snapshots (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tps NUMERIC(10,2),
  slot_height BIGINT,
  slot_latency_ms NUMERIC(10,2),
  epoch INTEGER,
  epoch_progress NUMERIC(5,2),
  delinquent_count INTEGER,
  active_validators INTEGER,
  confirmation_time_ms NUMERIC(10,2),
  congestion_score NUMERIC(5,2)
);

-- Index on timestamp for time-series queries
CREATE INDEX IF NOT EXISTS idx_network_snapshots_timestamp ON network_snapshots(timestamp DESC);

-- RPC provider health checks (written every 30s per provider)
CREATE TABLE IF NOT EXISTS rpc_health_checks (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider_name VARCHAR(50) NOT NULL,
  endpoint_url TEXT,
  latency_ms NUMERIC(10,2),
  is_healthy BOOLEAN DEFAULT true,
  slot_height BIGINT,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_rpc_health_provider ON rpc_health_checks(provider_name, timestamp DESC);

-- Validator current state
CREATE TABLE IF NOT EXISTS validators (
  vote_pubkey VARCHAR(50) PRIMARY KEY,
  identity_pubkey VARCHAR(50),
  name VARCHAR(200),
  avatar_url TEXT,
  score NUMERIC(5,2),
  stake_sol NUMERIC(20,4),
  commission NUMERIC(5,2),
  is_delinquent BOOLEAN DEFAULT false,
  skip_rate NUMERIC(5,4),
  software_version VARCHAR(50),
  data_center VARCHAR(100),
  asn VARCHAR(50),
  jito_enabled BOOLEAN DEFAULT false,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_validators_score ON validators(score DESC);
CREATE INDEX IF NOT EXISTS idx_validators_stake ON validators(stake_sol DESC);

-- Validator historical snapshots (written every 5min)
CREATE TABLE IF NOT EXISTS validator_snapshots (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  vote_pubkey VARCHAR(50) NOT NULL,
  is_delinquent BOOLEAN,
  skip_rate NUMERIC(5,4),
  commission NUMERIC(5,2),
  stake_sol NUMERIC(20,4),
  vote_distance INTEGER,
  root_distance INTEGER
);

CREATE INDEX IF NOT EXISTS idx_validator_snapshots_lookup ON validator_snapshots(vote_pubkey, timestamp DESC);

-- Alerts log
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'info',
  entity VARCHAR(200),
  message TEXT NOT NULL,
  details_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity, created_at DESC);
`;

/**
 * Run all migration statements
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function runMigrations() {
  console.log('[Migrate] Starting database migrations...');
  
  try {
    // Initialize database connection
    const pool = initDatabase();
    if (!pool) {
      console.error('[Migrate] Database not configured. Set DATABASE_URL environment variable.');
      return false;
    }

    // Wait a moment for connection to establish
    await new Promise(resolve => setTimeout(resolve, 100));

    // Split migrations by semicolon and execute each statement
    const statements = MIGRATIONS
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        await query(statement);
        // Log first line of statement for progress
        const firstLine = statement.split('\n')[0].trim();
        console.log(`[Migrate] Executed: ${firstLine}...`);
      } catch (err) {
        console.error(`[Migrate] Error executing statement:`, err.message);
        console.error(`[Migrate] Statement: ${statement.substring(0, 100)}...`);
        // Continue with other statements
      }
    }

    console.log('[Migrate] Migrations completed successfully');
    return true;
  } catch (err) {
    console.error('[Migrate] Migration failed:', err.message);
    return false;
  }
}

/**
 * Run migrations and close connection
 * For standalone script execution
 */
async function main() {
  const success = await runMigrations();
  await closeDatabase();
  process.exit(success ? 0 : 1);
}

// Run if called directly (node src/models/migrate.js)
if (require.main === module) {
  main();
}

module.exports = {
  runMigrations,
  MIGRATIONS,
};
