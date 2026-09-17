const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES, COOKIE_SECURE, COOKIE_SAME_SITE } = require("../config/env");

const parseDuration = (value) => {
  const match = String(value).match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return Number(match[1]) * units[match[2]];
};
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const generateAccessToken = (user) => jwt.sign({ id: String(user._id || user.id), email: user.email, name: user.name, tokenVersion: user.tokenVersion || 0 }, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
const generateRefreshToken = (user) => jwt.sign({ id: String(user._id || user.id), type: "refresh", jti: crypto.randomUUID() }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });

const authCookieOptions = (maxAge) => ({
  httpOnly: true,
  sameSite: COOKIE_SAME_SITE,
  secure: COOKIE_SECURE,
  maxAge,
});

const issueSession = async (res, user, req) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await RefreshToken.create({ user: user._id, tokenHash: hashToken(refreshToken), expiresAt: new Date(Date.now() + parseDuration(REFRESH_TOKEN_EXPIRES)), userAgent: req?.get("user-agent") || "", ipAddress: req?.ip || "" });
  res.cookie("accessToken", accessToken, authCookieOptions(parseDuration(ACCESS_TOKEN_EXPIRES)));
  res.cookie("refreshToken", refreshToken, authCookieOptions(parseDuration(REFRESH_TOKEN_EXPIRES)));
  return { accessToken, refreshToken };
};
const revokeRefreshToken = (token) => RefreshToken.findOneAndUpdate({ tokenHash: hashToken(token), revokedAt: null }, { revokedAt: new Date() });
const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", authCookieOptions(0));
  res.clearCookie("refreshToken", authCookieOptions(0));
};
module.exports = { generateAccessToken, generateRefreshToken, issueSession, revokeRefreshToken, hashToken, clearAuthCookies };
