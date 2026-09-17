const express = require("express");
const rateLimit = require("express-rate-limit");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const { validate } = require("../middleware/validate");
const { publicTestimonialSchema, statusSchema, booleanSchema } = require("../utils/validation");
const {
  submitTestimonial,
  getInbox,
  moderateReview,
} = require("../controllers/testimonialController");

const router = express.Router();
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many submissions. Please try again later." },
});
const {
  getSpaceTestimonials,
  updateTestimonialStatus,
  updateTestimonialFeatured,
  updateTestimonialLiked,
  deleteTestimonial,
} = require("../controllers/testimonialController");

router.post("/submit/:slug", submissionLimiter, upload.single("avatar"), validate(publicTestimonialSchema), submitTestimonial);
router.get("/inbox", requireAuth, getInbox);
router.patch("/:testimonialId/status", requireAuth, validate(statusSchema), updateTestimonialStatus);
router.patch("/:testimonialId/featured", requireAuth, validate(booleanSchema), updateTestimonialFeatured);
router.patch("/:testimonialId/liked", requireAuth, validate(booleanSchema), updateTestimonialLiked);
router.patch("/:id/moderate", requireAuth, moderateReview);
router.delete("/:testimonialId", requireAuth, deleteTestimonial);

module.exports = router;
