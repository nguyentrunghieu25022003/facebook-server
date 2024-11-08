const socket = require("socket.io");
const corsHelper = require("../helper/cors");

const initSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: corsHelper.options,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Authorization", "Content-Type"],
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected...");
    
    socket.on("joinRoom", ({ callerUserId }) => {
      const roomName = `user_${callerUserId}`;
      socket.join(roomName);
      console.log(`User ${callerUserId} joined room ${roomName}`);
    });

    socket.on("typing", (data) => {
      socket.to(`user_${data.receiverId}`).emit("typing", data);
    });

    socket.on("sendMessage", (message) => {
      socket.to(`user_${message.ReceiverID}`).emit("newMessage", message);
      socket.emit("newMessage", message);
    });

    socket.on("readStatus", (data) => {
      const { userId } = data;
      const roomName = `user_${userId}`;
      console.log(`User ${userId} read status ${roomName}`);
      socket.to(roomName).emit("readStatus", data);
    });

    socket.on("user:call", ({ fromUserId, toUserId, offer }) => {
      const roomName = `user_${toUserId}`;
      io.to(roomName).emit("incoming:call", { fromUserId, offer });
    });
  
    socket.on("call:accepted", ({ fromUserId, toUserId, answer }) => {
      const roomName = `user_${fromUserId}`;
      io.to(roomName).emit("call:accepted", { fromUserId, answer });
    });
  
    socket.on("peer:nego:needed", ({ fromUserId, toUserId, offer }) => {
      const roomName = `user_${toUserId}`;
      io.to(roomName).emit("peer:nego:needed", { fromUserId, offer });
    });
  
    socket.on("peer:nego:done", ({ fromUserId, toUserId, answer }) => {
      const roomName = `user_${fromUserId}`;
      io.to(roomName).emit("peer:nego:final", { fromUserId, answer });
    });
    
    socket.on("disconnect", () => {
      console.log("User disconnected...");
    });
  });

  return io;
};

module.exports = initSocket;