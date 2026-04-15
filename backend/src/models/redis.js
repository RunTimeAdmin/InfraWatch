/**
 * Redis connection module using ioredis
 * Lazy initialization - call initRedis() to connect
 */

const Redis = require('ioredis');
const config = require('../config');

let redis = null;
let isConnected = false;

/**
 * Initialize the Redis client
 * @returns {Redis|null} The ioredis client instance or null if not configured
 */
function initRedis() {
  if (redis) {
    return redis;
  }

  if (!config.redis.url) {
    console.warn('[Redis] REDIS_URL not configured, caching features will be unavailable');
    return null;
  }

  try {
    redis = new Redis(config.redis.url, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true, // Don't connect immediately
    });

    redis.on('connect', () => {
      isConnected = true;
      console.log('[Redis] Connected successfully');
    });

    redis.on('ready', () => {
      isConnected = true;
    });

    redis.on('close', () => {
      isConnected = false;
    });

    redis.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message);
    });

    redis.on('close', () => {
      console.log('[Redis] Connection closed');
    });

    // Attempt connection
    redis.connect().catch((err) => {
      console.error('[Redis] Initial connection failed:', err.message);
    });

    return redis;
  } catch (err) {
    console.error('[Redis] Failed to create Redis client:', err.message);
    return null;
  }
}

/**
 * Get a value from cache and parse as JSON
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Parsed value or null if not found/error
 */
async function getCache(key) {
  if (!redis || !isConnected) {
    return null;
  }

  try {
    const value = await redis.get(key);
    if (value === null) {
      return null;
    }
    return JSON.parse(value);
  } catch (err) {
    console.error(`[Redis] getCache error for key "${key}":`, err.message);
    return null;
  }
}

/**
 * Set a value in cache with JSON serialization and TTL
 * @param {string} key - Cache key
 * @param {any} data - Data to cache (will be JSON.stringify'd)
 * @param {number} ttlSeconds - Time to live in seconds
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function setCache(key, data, ttlSeconds) {
  if (!redis || !isConnected) {
    return false;
  }

  try {
    const value = JSON.stringify(data);
    await redis.setex(key, ttlSeconds, value);
    return true;
  } catch (err) {
    console.error(`[Redis] setCache error for key "${key}":`, err.message);
    return false;
  }
}

/**
 * Delete a key from cache
 * @param {string} key - Cache key to delete
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function deleteCache(key) {
  if (!redis || !isConnected) {
    return false;
  }

  try {
    await redis.del(key);
    return true;
  } catch (err) {
    console.error(`[Redis] deleteCache error for key "${key}":`, err.message);
    return false;
  }
}

/**
 * Get the Redis client instance
 * @returns {Redis|null} The ioredis client or null if not initialized
 */
function getRedis() {
  return redis;
}

/**
 * Close the Redis connection
 * @returns {Promise<void>}
 */
async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log('[Redis] Connection closed');
  }
}

module.exports = {
  initRedis,
  getCache,
  setCache,
  deleteCache,
  getRedis,
  closeRedis,
};
