/**
 * InfraWatch Backend Server
 * Main entry point for the Solana infrastructure monitoring dashboard
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Load configuration (handles dotenv internally)
const config = require('./src/config');

// Import middleware
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

// Import WebSocket setup
const { setupWebSocket } = require('./src/websocket');

// Import routes
const routes = require('./src/routes');

// Import data layer for initialization
const { initDatabase } = require('./src/models/db');
const { initRedis } = require('./src/models/redis');

// Import pollers
const { startCriticalPoller } = require('./src/jobs/criticalPoller');
const { startRoutinePoller } = require('./src/jobs/routinePoller');

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io available globally for other modules
app.set('io', io);

// Apply middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (before API routes)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// Mount API routes
app.use('/api', routes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Setup WebSocket handlers
setupWebSocket(io);

// Start server
server.listen(config.port, async () => {
  console.log(`[Server] InfraWatch backend running on port ${config.port}`);
  console.log(`[Server] Environment: ${config.nodeEnv}`);
  console.log(`[Server] Health check: http://localhost:${config.port}/api/health`);

  // Initialize data stores (graceful — don't crash if unavailable)
  try {
    await initDatabase();
    console.log('[Server] Database initialized');
  } catch (e) {
    console.warn('[DB] Not available:', e.message);
  }

  try {
    await initRedis();
    console.log('[Server] Redis initialized');
  } catch (e) {
    console.warn('[Redis] Not available:', e.message);
  }

  // Start pollers
  startCriticalPoller(io);
  startRoutinePoller(io);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('[Server] HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('[Server] HTTP server closed');
    process.exit(0);
  });
});

// Export io for use by other modules
module.exports = { io };
