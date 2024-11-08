const { Op } = require("sequelize");
const { Message } = require("../../../models/index.model");

module.exports.getMessages = async (req, res) => {
  try {
    const currentUserId = parseInt(req.params.userId);
    const friendId = parseInt(req.params.friendId);

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { [Op.and]: [{ SenderID: currentUserId }, { ReceiverID: friendId }] },
          { [Op.and]: [{ SenderID: friendId }, { ReceiverID: currentUserId }] },
        ],
      },
      order: [["CreatedAt", "ASC"]],
    });

    res.status(200).json({ senderId: currentUserId, receiverId: friendId, messages: messages });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.getUnreadMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.findAll({
      where: {
        ReceiverID: userId,
        IsRead: false
      },
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    const { Content } = req.body;
    let ImageURL = null;
    let AudioURL = null;

    if (req.files["ImageURL"]) {
      const imageFile = req.files["ImageURL"][0];
      ImageURL = `/uploads/${imageFile.filename}`;
    }
    if (req.files["AudioURL"]) {
      const audioFile = req.files["AudioURL"][0];
      AudioURL = `/uploads/${audioFile.filename}`;
    }

    const newMessage = await Message.create({
      SenderID: parseInt(senderId),
      ReceiverID: parseInt(receiverId),
      Content: Content,
      ImageURL: ImageURL,
      AudioURL: AudioURL,
      MessageType: "text",
      CreatedAt: Date.now(),
      IsRead: false
    });

    const io = req.app.get("socketio");
    io.to(`user_${receiverId}`).emit("newMessage", newMessage);

    res.status(200).json({ message: "Message sent successfully", newMessage: newMessage });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.readMessage = async (req, res) => {
  try {
    const senderId = parseInt(req.params.senderId);
    const receiverId = parseInt(req.params.receiverId);
    const messageId = parseInt(req.params.messageId);

    const message = await Message.findOne({ where: { MessageID: messageId } });
    
    if(message.SenderID === senderId || message.IsRead === 1) {
      return res.status(403).send("Not read message");
    }

    await Message.update({ IsRead: true }, {
      where: {
        SenderID: receiverId,
        ReceiverID: senderId,
        IsRead: false
      }
    });

    const io = req.app.get("socketio");
    io.to(`user_${senderId}`).emit("messageRead", { senderId, receiverId });
    io.to(`user_${receiverId}`).emit("messageRead", { senderId, receiverId });
    res.status(200).json({ message: "Messages marked as read" });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

