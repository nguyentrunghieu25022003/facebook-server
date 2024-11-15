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

    socket.emit("me", socket.id);
    
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

    socket.on("callUser", (data) => {
      io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
    })
  
    socket.on("answerCall", (data) => {
      io.to(data.to).emit("callAccepted", data.signal)
    })
    
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