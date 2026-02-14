const socketIO = require("socket.io");
const { DROPS_ROOM, ALLOWED_ORIGINS } = require("./config/constants");

/**
 * Initialize Socket.IO server with CORS configuration
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.IO server instance
 */
function initSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: ALLOWED_ORIGINS,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Set up connection handlers
  io.on("connection", handleConnection);

  // Make io globally accessible for broadcasting from controllers
  global.io = io;

  console.log("Socket.IO server initialized");
  return io;
}

/**
 * Handle new socket connection
 * @param {Object} socket - Socket instance
 */
function handleConnection(socket) {
  console.log(`Client connected: ${socket.id}`);

  // Auto-join drops room for real-time updates
  socket.join(DROPS_ROOM);

  // Handle disconnection
  socket.on("disconnect", () => handleDisconnect(socket));
}

/**
 * Handle socket disconnection
 * @param {Object} socket - Socket instance
 */
function handleDisconnect(socket) {
  console.log(`Client disconnected: ${socket.id}`);
}

module.exports = initSocket;
