const jwt = require("jsonwebtoken");

const createAccessToken = (userEmail) => {
  const accessTokenSecret = process.env.JWT_ACCESS_SECRET || "access_fallback_secret";
  return jwt.sign({ userEmail }, accessTokenSecret, { expiresIn: "15m" });
};

const createRefreshToken = (userEmail) => {
  const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || "refresh_fallback_secret";
  return jwt.sign({ userEmail }, refreshTokenSecret, { expiresIn: "30d" });
};

module.exports = { createAccessToken, createRefreshToken };