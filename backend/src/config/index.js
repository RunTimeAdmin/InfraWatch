/**
 * Central configuration module
 * Loads environment variables with sensible defaults
 */

const path = require('path');

// Try to load .env file, but don't fail if it doesn't exist
try {
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });
} catch (err) {
  console.log('No .env file found, using defaults and environment variables');
}

// Helper to parse integers with fallback
const parseIntOrDefault = (value, defaultValue) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Construct Helius RPC URL from API key if provided
const heliusApiKey = process.env.HELIUS_API_KEY || '';
const heliusRpcUrl = heliusApiKey
  ? `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`
  : process.env.HELIUS_RPC_URL || '';

const config = {
  // Server configuration
  port: parseIntOrDefault(process.env.PORT, 3001),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Solana configuration
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    heliusApiKey,
    heliusRpcUrl,
  },

  // Validators.app API configuration
  validatorsApp: {
    apiKey: process.env.VALIDATORS_APP_API_KEY || '',
    baseUrl: process.env.VALIDATORS_APP_BASE_URL || 'https://www.validators.app/api/v1',
  },

  // Bags FM API configuration
  bags: {
    apiKey: process.env.BAGS_API_KEY || '',
    baseUrl: process.env.BAGS_API_BASE_URL || 'https://public-api-v2.bags.fm/api/v1',
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // Polling intervals (in milliseconds)
  polling: {
    critical: parseIntOrDefault(process.env.CRITICAL_POLL_INTERVAL, 30000),   // 30 seconds
    routine: parseIntOrDefault(process.env.ROUTINE_POLL_INTERVAL, 300000),    // 5 minutes
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
};

module.exports = config;
