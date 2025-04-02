const express = require("express");
const router = express.Router();

const controller = require("../controllers/user.controller");
const upload = require("../../../middlewares/multer");

router.post("/auth/sign-up", controller.handleSignUp);
router.post("/auth/sign-in", controller.handleSignIn);
router.get("/auth/check-token", controller.handleCheckToken);
router.post("/auth/:userId/log-out", controller.handleLogout);
router.patch("/cover-photo/upload/:userId", upload.single("Cover-Photo"), controller.handleUploadCoverPhoto);
router.patch("/avatar/upload/:userId", upload.single("Avatar"), controller.handleUploadAvatar);

module.exports = router;