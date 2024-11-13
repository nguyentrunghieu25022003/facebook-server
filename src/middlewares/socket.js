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
    console.log("User connected...");
    
    socket.on("joinRoom", ({ callerUserId }) => {
      const roomName = `user_${callerUserId}`;
      onlineUsers.set(callerUserId, socket.id);
      io.emit("friend:status", { userId: callerUserId, userStatus: "Online" });
      socket.join(roomName);
    });

    socket.on("user:action", ({ userId, userStatus }) => {
      io.emit("friend:status", { userId, userStatus });
    });

    socket.on("typing", (data) => {
      socket.to(`user_${data.receiverId}`).emit("typing", data);
    });

    socket.on("sendMessage", (message) => {
      io.to(`user_${message.ReceiverID}`).emit("newMessage", message);
      socket.emit("newMessage", message);
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
      const userId = [...onlineUsers].find(([key, value]) => value === socket.id)?.[0];
      if (userId) {
        const lastSeen = Date.now();
        onlineUsers.delete(userId);
        io.emit("friend:status", { userId: userId, userStatus: `Accessed ${getMinutesAgo(lastSeen)} minutes ago` });
      }
    });
  });

  return io;
};

module.exports = initSocket;