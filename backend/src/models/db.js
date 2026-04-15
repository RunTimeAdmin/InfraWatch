/**
 * Database connection module using node-postgres Pool
 * Lazy initialization - call initDatabase() to connect
 */

const { Pool } = require('pg');
const config = require('../config');

let pool = null;

/**
 * Initialize the database pool
 * @returns {Pool} The pg Pool instance
 */
function initDatabase() {
  if (pool) {
    return pool;
  }

  if (!config.database.url) {
    console.warn('[DB] DATABASE_URL not configured, database features will be unavailable');
    return null;
  }

  pool = new Pool({
    connectionString: config.database.url,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000, // Return error after 5 seconds if connection not established
  });

  // Handle pool errors for existing clients
  pool.on('error', (err, client) => {
    console.error('[DB] Unexpected pool error:', err.message);
  });

  // Test the connection
  pool.query('SELECT NOW()', (err, result) => {
    if (err) {
      console.error('[DB] Failed to connect to database:', err.message);
    } else {
      console.log('[DB] Database connected successfully');
    }
  });

  return pool;
}

/**
 * Execute a query using a client from the pool
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function query(text, params) {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }

  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (err) {
    console.error('[DB] Query error:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Get the pool instance (for transactions or advanced usage)
 * @returns {Pool|null} The pg Pool instance or null if not initialized
 */
function getPool() {
  return pool;
}

/**
 * Close the database pool
 * @returns {Promise<void>}
 */
async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[DB] Database pool closed');
  }
}

module.exports = {
  initDatabase,
  query,
  getPool,
  closeDatabase,
};
