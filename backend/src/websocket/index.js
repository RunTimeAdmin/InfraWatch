/**
 * WebSocket setup module
 * Configures Socket.io for real-time communication
 */

let ioInstance = null;
let connectedCount = 0;

/**
 * Set up WebSocket handlers
 * @param {Object} io - Socket.io server instance
 */
function setupWebSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    connectedCount++;
    console.log(`[WebSocket] Client connected: ${socket.id} (total: ${connectedCount})`);

    // Handle client disconnect
    socket.on('disconnect', (reason) => {
      connectedCount--;
      console.log(`[WebSocket] Client disconnected: ${socket.id}, reason: ${reason} (total: ${connectedCount})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`[WebSocket] Socket error for ${socket.id}:`, error);
    });
  });

  console.log('[WebSocket] Socket.io setup complete');
}

/**
 * Get the Socket.io instance for broadcasting
 * @returns {Object|null} The Socket.io instance
 */
function getIO() {
  return ioInstance;
}

/**
 * Broadcast an event to all connected clients
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
function broadcast(event, data) {
  if (ioInstance) {
    ioInstance.emit(event, data);
  }
}

/**
 * Broadcast an event to a specific room
 * @param {string} room - Room name
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
function broadcastToRoom(room, event, data) {
  if (ioInstance) {
    ioInstance.to(room).emit(event, data);
  }
}

/**
 * Get the count of currently connected clients
 * @returns {number} Number of connected clients
 */
function getConnectedCount() {
  return connectedCount;
}

module.exports = {
  setupWebSocket,
  getIO,
  broadcast,
  broadcastToRoom,
  getConnectedCount,
};
