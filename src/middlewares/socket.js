const socket = require("socket.io");
const corsHelper = require("../helper/cors");
const { getMinutesAgo } = require("../helper/getMinutesAgo");

const initSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: corsHelper.options,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Authorization", "Content-Type"],
    }
  });

  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("User connected...", socket.id);

    socket.emit("me", socket.id);

    socket.on("joinRoom", ({ callerUserId }) => {
      const roomName = `user_${callerUserId}`;
      onlineUsers.set(callerUserId, socket.id);
      socket.join(roomName);
    });

    socket.on("typing", (data) => {
      socket.to(`user_${data.receiverId}`).emit("typing", data);
    });

    socket.on("sendMessage", (message) => {
      io.to(`user_${message.ReceiverID}`).emit("newMessage", message);
      socket.emit("newMessage", message);
    });

    socket.on("callUser", (data) => {
      io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
    })
  
    socket.on("answerCall", (data) => {
      io.to(data.to).emit("callAccepted", data.signal)
    })
    
    socket.on("disconnect", () => {
      console.log("User disconnected...");
    });
  });

  return io;
};

module.exports = initSocket;