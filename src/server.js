const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const { sequelize } = require("./models");
const dropRoutes = require("./routes/dropRoutes");
const initSocket = require("./socket");
const startExpirationJob = require("./jobs/expirationJob");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/drops", dropRoutes);

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

// Initialize Socket.IO and background jobs
initSocket(server);
startExpirationJob();

// Database sync and server start
sequelize.sync().then(() => {
  console.log("Database synced");
  server.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`),
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});
