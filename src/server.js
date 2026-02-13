const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const { sequelize } = require("./models");
const dropRoutes = require("./routes/dropRoutes");
const initSocket = require("./socket");
const startExpirationJob = require("./jobs/expirationJob");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use("/api/drops", dropRoutes);

initSocket(server);
startExpirationJob();

sequelize.sync().then(() => {
  console.log("Database synced");
  server.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`),
  );
});
