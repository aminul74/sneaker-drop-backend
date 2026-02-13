const socketIO = require("socket.io");

function initSocket(server) {
  const io = socketIO(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("User connected");
  });

  global.io = io;
}

module.exports = initSocket;
