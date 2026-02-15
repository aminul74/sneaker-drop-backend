const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const { sequelize } = require("./models");
const dropRoutes = require("./routes/drop.routes");
const {
  errorHandler,
  notFound,
} = require("./middleware/error-handler.middleware");

// Environment detection
const isVercel = process.env.VERCEL === "1";
const isLocal = !isVercel && process.env.NODE_ENV !== "production";

const app = express();

// Only create HTTP server for local development with WebSocket
let server;
if (isLocal) {
  server = http.createServer(app);
}

// Middlewares
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Routes
app.use("/api/drops", dropRoutes);

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    await sequelize.sync();
    console.log("Database synced");

    // Initialize features based on environment
    if (isLocal) {
      const initSocket = require("./socket");
      const startExpirationJob = require("./jobs/expirationJob");

      initSocket(server);
      startExpirationJob();

      const port = process.env.PORT || 3000;
      server.listen(port, () => {
        console.log(`Server running locally on port ${port}`);
      });

      // Handle unhandled promise rejections (local)
      process.on("unhandledRejection", (err) => {
        console.error("Unhandled Rejection:", err.message);
        server.close(() => process.exit(1));
      });
    } else if (isVercel) {
      console.log("Server running on Vercel (serverless)");
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    if (isLocal) {
      process.exit(1);
    }
  }
}

// Start server for local development
if (isLocal) {
  startServer();
} else {
  // Initialize database for Vercel
  sequelize.sync().catch((err) => {
    console.error("Database sync failed:", err);
  });
}

// Export for Vercel serverless
module.exports = app;
