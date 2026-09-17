const express = require("express");
const rateLimit = require("express-rate-limit");
const { validate } = require("../middleware/validate");
const { signupSchema, loginSchema, forgotPasswordSchema, verifyEmailSchema, resetPasswordSchema } = require("../utils/validation");
const { requireAuth } = require("../middleware/auth");
const {
  signup,
  login,
  getCurrentUser,
  verifyEmail,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();
const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts. Please try again later." },
});

router.post("/signup", strictAuthLimiter, validate(signupSchema), signup);
router.post("/login", strictAuthLimiter, validate(loginSchema), login);
router.get("/me", requireAuth, getCurrentUser);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/forgot-password", strictAuthLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

module.exports = router;
