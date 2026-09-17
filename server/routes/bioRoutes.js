const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getMyBioProfile, upsertBioProfile, getPublicBioProfile } = require("../controllers/bioController");

const router = express.Router();

router.get("/me", requireAuth, getMyBioProfile);
router.post("/save", requireAuth, upsertBioProfile);
router.get("/:username", getPublicBioProfile);

module.exports = router;
