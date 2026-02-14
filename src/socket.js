const socketIO = require("socket.io");

function initSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join drops room on connection
    socket.join("drops");

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  global.io = io;
  return io;
}

module.exports = initSocket;
