const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { listLinks, createLink, deleteLink } = require("../controllers/linkController");

const router = express.Router();

router.get("/", requireAuth, listLinks);
router.post("/create", requireAuth, createLink);
router.delete("/:id", requireAuth, deleteLink);

module.exports = router;
