const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_ACCESS_SECRET } = require("../config/env");

const requireAuth = async (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select("name email isVerified tokenVersion");
    if (!user || (decoded.tokenVersion || 0) !== user.tokenVersion) {
      return res.status(401).json({ success: false, message: "Session is invalid or expired" });
    }
    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = {
  requireAuth,
  protect: requireAuth,
};
