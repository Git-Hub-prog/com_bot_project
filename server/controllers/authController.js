const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const { sendEmail } = require("../utils/mail");
const { JWT_REFRESH_SECRET } = require("../config/env");
const { issueSession, revokeRefreshToken, hashToken, clearAuthCookies } = require("../utils/token");

const publicUser = (user) => ({ id: String(user._id), name: user.name, email: user.email });
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !emailPattern.test(String(email).trim()) || !passwordPattern.test(String(password))) {
      return res.status(400).json({ success: false, message: "Provide a valid email and a password with at least 8 characters, including uppercase, lowercase, and a number" });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ success: false, message: "An account already exists for this email" });
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), emailVerificationToken: hashToken(verificationToken), emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) });
    await sendEmail({ to: user.email, subject: "Verify your TestimonialHub email", text: `This is a simulated verification email. Verify with token: ${verificationToken}` });
    await issueSession(res, user, req);
    return res.status(201).json({ success: true, message: "Account created successfully. Verification email simulated.", verification: { simulated: true, expiresIn: "24h", token: process.env.NODE_ENV === "production" ? undefined : verificationToken }, user: publicUser(user) });
  } catch (error) { return next(error); }
};

const login = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!emailPattern.test(email) || !password) return res.status(400).json({ success: false, message: "A valid email and password are required" });
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ success: false, message: "Invalid email or password" });
    if (!user.isVerified) return res.status(403).json({ success: false, message: "Please verify your email before logging in", code: "EMAIL_NOT_VERIFIED" });
    await issueSession(res, user, req);
    return res.json({ success: true, message: "Login successful", user: publicUser(user) });
  } catch (error) { return next(error); }
};

const getCurrentUser = async (req, res, next) => {
  try { const user = await User.findById(req.user.id); return user ? res.json({ success: true, user: publicUser(user) }) : res.status(404).json({ success: false, message: "User not found" }); } catch (error) { return next(error); }
};

const verifyEmail = async (req, res, next) => {
  try {
    const token = String(req.body.token || "");
    const user = await User.findOne({ emailVerificationToken: hashToken(token), emailVerificationExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ success: false, message: "Verification token is invalid or expired" });
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    return res.json({ success: true, message: "Email verified successfully", user: publicUser(user) });
  } catch (error) { return next(error); }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: "Refresh token required" });
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    if (decoded.type !== "refresh" || !decoded.jti) return res.status(401).json({ success: false, message: "Refresh session is invalid or expired" });
    const tokenHash = hashToken(token);
    const session = await RefreshToken.findOneAndUpdate(
      { tokenHash, user: decoded.id, revokedAt: null, expiresAt: { $gt: new Date() } },
      { revokedAt: new Date() },
      { new: true }
    );
    if (!session) {
      const knownSession = await RefreshToken.findOne({ tokenHash, user: decoded.id });
      if (knownSession?.revokedAt) {
        await RefreshToken.updateMany({ user: decoded.id, revokedAt: null }, { revokedAt: new Date() });
      }
      clearAuthCookies(res);
      return res.status(401).json({ success: false, message: "Refresh token reuse detected; all sessions were revoked" });
    }
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });
    await issueSession(res, user, req);
    return res.json({ success: true, user: publicUser(user) });
  } catch (error) { clearAuthCookies(res); return res.status(401).json({ success: false, message: "Refresh session is invalid or expired" }); }
};

const logout = async (req, res, next) => {
  try { if (req.cookies?.refreshToken) await revokeRefreshToken(req.cookies.refreshToken); clearAuthCookies(res); return res.json({ success: true, message: "Logged out successfully" }); } catch (error) { return next(error); }
};

const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: String(req.body.email || "").trim().toLowerCase() });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = hashToken(token);
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${encodeURIComponent(token)}`;
      await sendEmail({ to: user.email, subject: "Reset your TestimonialHub password", text: `Reset your password using this link: ${resetUrl}` });
      if (process.env.NODE_ENV !== "production") console.log(`[password reset development URL] ${resetUrl}`);
    }
    return res.json({ success: true, message: "If an account exists, a password reset link has been generated." });
  } catch (error) { return next(error); }
};

const resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ resetPasswordToken: hashToken(String(req.body.token || "")), resetPasswordExpires: { $gt: new Date() } });
    if (!user || !passwordPattern.test(String(req.body.password || ""))) return res.status(400).json({ success: false, message: "Invalid token or password" });
    user.passwordHash = await bcrypt.hash(req.body.password, 12);
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    await RefreshToken.updateMany({ user: user._id, revokedAt: null }, { revokedAt: new Date() });
    clearAuthCookies(res);
    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) { return next(error); }
};

module.exports = { signup, login, getCurrentUser, verifyEmail, refresh, logout, forgotPassword, resetPassword };
