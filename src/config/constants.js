/**
 * Application-wide constants
 */
module.exports = {
  // Socket.IO
  DROPS_ROOM: "drops",
  ALLOWED_ORIGINS: ["http://localhost:5173", "http://localhost:3000"],

  // Reservation
  RESERVATION_DURATION_MS: 60000, // 1 minute

  // Job intervals
  EXPIRATION_CHECK_INTERVAL_MS: 5000, // 5 seconds

  // Pagination
  TOP_BUYERS_LIMIT: 3,
};
