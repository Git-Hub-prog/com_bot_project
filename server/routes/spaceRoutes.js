const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const {
  getOwnerSpaces,
  getSpace,
  createSpace,
  updateSpace,
  deleteSpace,
  getEmbedSettings,
  updateEmbedSettings,
  getPublicSpace,
  getWallReviews,
} = require("../controllers/spaceController");
const { getSpaceTestimonials, getSpaceMetrics } = require("../controllers/testimonialController");
const { validate } = require("../middleware/validate");
const { spaceSchema, embedSettingsSchema } = require("../utils/validation");

const router = express.Router();

router.get("/mine", requireAuth, getOwnerSpaces);
router.post("/create", requireAuth, upload.single("logo"), validate(spaceSchema), createSpace);
router.get("/", requireAuth, getOwnerSpaces);
router.post("/", requireAuth, upload.single("logo"), validate(spaceSchema), createSpace);
router.get("/:spaceId", requireAuth, getSpace);
router.patch("/:id", requireAuth, upload.single("logo"), validate(spaceSchema.partial()), updateSpace);
router.delete("/:id", requireAuth, deleteSpace);
router.get("/:id/embed", requireAuth, getEmbedSettings);
router.patch("/:id/embed", requireAuth, validate(embedSettingsSchema), updateEmbedSettings);
router.get("/:spaceId/testimonials", requireAuth, getSpaceTestimonials);
router.get("/:spaceId/metrics", requireAuth, getSpaceMetrics);
router.get("/public/:slug", getPublicSpace);
router.get("/public/:slug/wall", getWallReviews);

module.exports = router;
