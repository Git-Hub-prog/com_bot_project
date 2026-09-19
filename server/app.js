const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { CLIENT_URL } = require("./config/env");

const authRoutes = require("./routes/authRoutes");
const spaceRoutes = require("./routes/spaceRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const publicTestimonialRoutes = require("./routes/publicTestimonialRoutes");
const linkRoutes = require("./routes/linkRoutes");
const bioRoutes = require("./routes/bioRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please wait a minute and try again." },
});

const createLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many creation requests. Please slow down." },
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "data:", "https:"],
      },
    },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: process.env.NODE_ENV === "production" ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  })
);
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/spaces", spaceRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/public", publicTestimonialRoutes);
app.use("/api/links", createLimiter, linkRoutes);
app.use("/api/bio", bioRoutes);

app.get("/r/:shortCode", (req, res) => {
  const { shortCode } = req.params;
  const { links } = require("./data/mockData");
  const link = links.find((entry) => entry.shortCode === shortCode || entry.vanity === shortCode);

  if (!link) {
    return res.status(404).json({ success: false, message: "Short link not found" });
  }

  link.clicks = (link.clicks || 0) + 1;
  return res.redirect(302, link.destination);
});

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  const path = require("path");
  app.use(express.static(path.join(__dirname, "../client/dist")));

  // API 404 handler
  app.use("/api", notFound);

  // Catch-all route to serve the React app
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
  });
} else {
  app.use(notFound);
}

app.use(errorHandler);

module.exports = app;