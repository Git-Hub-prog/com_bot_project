const express = require("express");
const rateLimit = require("express-rate-limit");
const { upload } = require("../middleware/upload");
const { submitTestimonial } = require("../controllers/testimonialController");
const { getWallReviews } = require("../controllers/spaceController");
const { validate } = require("../middleware/validate");
const { publicTestimonialSchema } = require("../utils/validation");

const router = express.Router();
const submissionLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { success: false, message: "Too many submissions. Please try again later." },
});

router.post("/spaces/:spaceSlug/testimonials", submissionLimiter, upload.single("avatar"), validate(publicTestimonialSchema), submitTestimonial);
router.get("/spaces/:spaceSlug/testimonials/approved", getWallReviews);

module.exports = router;