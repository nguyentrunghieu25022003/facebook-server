const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../../../models/user.model");
const BlackList = require("../../../models/black-list.model");
const { createAccessToken, createRefreshToken } = require("../../../middlewares/jwt");

module.exports.handleSignUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth, gender } = req.body;
    const existingUser = await User.findOne({ where: { Email: email } });
    if (existingUser) {
      return res.status(400).send("Email already in use!");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      Username: `${firstName} ${lastName}`,
      Email: email,
      PasswordHash: hashedPassword,
      Gender: gender,
      DateOfBirth: dateOfBirth,
      ProfilePictureURL: "default",
      Bio: "default",
      PrivacySettings: "public",
    });
    res.status(200).json({ message: "Success !" });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { Email: email }});
    if (!user) {
      return res.status(404).send("Email not found!");
    }
    const passwordIsValid = await bcrypt.compare(password, user.PasswordHash);
    if (!passwordIsValid) {
      return res.status(401).send("Password is incorrect!");
    }
    const accessToken = createAccessToken(email);
    const refreshToken = createRefreshToken(email);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 15 * 60 * 1000),
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      path: "/"
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      path: "/"
    });
    res.status(200).json({
      message: "Success !",
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: user,
    });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleLogout = async (req, res) => {
  try {
    const { userId } = req.params;
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await BlackList.create({
      UserID: userId,
      Token: refreshToken,
      Expiration: expirationDate,
    });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Logged out successfully!" });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleCheckToken = async (req, res) => {
  try {
    const accessToken = req.cookies.accessToken;
    const authHeader = req.headers["authorization"];
    const refreshToken = authHeader && authHeader.split(" ")[1];
    const tokenInBlacklist = await BlackList.findOne({
      where: { Token: refreshToken }
    });

    if (tokenInBlacklist) {
      res.clearCookie("refreshToken", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
      });

      res.clearCookie("accessToken", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
      });

      return res.status(403).json({ message: "Refresh token is invalid or expired, please log in again." });
    }

    if (!accessToken) {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decodedRefresh) => {
        if (err) {
          return res.status(403).json({ message: "Invalid refresh token, please log in again." });
        }

        const newAccessToken = createAccessToken(decodedRefresh.email);
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          expires: new Date(Date.now() + 15 * 60 * 1000),
          secure: process.env.NODE_ENV === "production",
          sameSite: "None",
          path: "/"
        });

        return res.status(200).json({ message: "Token is valid", accessToken: newAccessToken });
      });
    } else {
      return res.status(200).json({ message: "Token is valid" });
    }
  } catch (err) {
    res.status(500).send("Message: " + err.message);
  }
};

module.exports.handleUploadCoverPhoto = async (req, res) => {
  try {
    const UserID = parseInt(req.params.userId);
    const FileURL = req.file ? req.file.filename : null;
    const ImageURL = FileURL ? `/uploads/${FileURL}` : null;
    await User.update(
      { CoverPhotoURL: ImageURL },
      {
        where: { UserID: UserID },
      }
    );
    res.status(200).json({ message: "Uploaded cover photo successfully !"});
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleUploadAvatar = async (req, res) => {
  try {
    const UserID = parseInt(req.params.userId);
    const FileURL = req.file ? req.file.filename : null;
    const ImageURL = FileURL ? `/uploads/${FileURL}` : null;
    await User.update(
      { ProfilePictureURL: ImageURL },
      {
        where: { UserID: UserID },
      }
    );
    res.status(200).json({ message: "Uploaded avatar successfully !"});
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};