const express = require("express");
const router = express.Router();

const controller = require("../controllers/message.controller");
const upload = require("../../../middlewares/multer");

router.get("/all-messages/:userId/:friendId", controller.getMessages);
router.get("/unread-messages/:userId", controller.getUnreadMessages);
router.post("/:senderId/send/:receiverId",
  upload.fields([
    { name: "ImageURL", maxCount: 1 },
    { name: "AudioURL", maxCount: 1 },
  ]),
  controller.sendMessage
);
router.patch("/:senderId/:receiverId/read/:messageId", controller.readMessage);

module.exports = router;