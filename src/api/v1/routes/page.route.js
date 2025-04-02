const express = require("express");
const router = express.Router();

const controller = require("../controllers/page.controller");
const authenticate = require("../../../middlewares/authenticate");
const upload = require("../../../middlewares/multer");

router.get("/posts/:userId", controller.getAllDataHomepage);
router.post("/post/create", upload.single("FileURL"), authenticate, controller.handleCreatePost);
router.post("/like", authenticate, controller.handleLikePost);
router.post("/comment/like/:commentId", controller.handleLikeComment);
router.patch("/post/edit/:postId", authenticate, controller.handleEditPost);
router.delete("/post/delete/:postId", authenticate, controller.handleDeletePost);
router.post("/comment/create", upload.single("FileURL"), authenticate, controller.handleCommentPost);
router.delete("/comment/:commentId/delete", controller.handleDeleteComment);
router.patch("/comment/:commentId/edit", controller.handleEditComment);
router.post("/comment/filter", controller.handleFilterComments);
router.post("/comment/reply/:commentId/create", upload.single("FileURL"), authenticate, controller.handleReplyComment);
router.get("/profile/:userId", controller.handleGetProfile);
router.get("/friends/:userId", controller.handleGetFriendsList);
router.get("/:userId/all-post", controller.handleGetAllMyPost);
router.get("/friends/suggested/:userId", controller.handleGetFriendListSuggested);
router.get("/notifications/:userId", controller.handleGetNotifications);
router.get("/stories/:userId", controller.getAllStories);
router.get("/videos/all", controller.getAllVideos);
router.post("/search", controller.handleSearchUser);
router.get("/accepted/:friendShipId", controller.handleAcceptRequest);
router.get("/post/detail/:postId", authenticate, controller.getPostDetail);
router.get("/unfriend/all/:userId", controller.getFriendListUnfriended);
router.get("/request/:userId/:friendId", controller.handleRequestToUser);
router.post("/story/create", upload.single("FileURL"), authenticate, controller.handleCreateStory);

module.exports = router;