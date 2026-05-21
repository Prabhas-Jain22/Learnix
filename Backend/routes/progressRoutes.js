const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  updateProgress,
  updateVideoProgress,
  getProgress,
  getAllProgress
} = require("../controllers/progressController");

// All routes require authentication
router.post("/update", auth, updateProgress);
router.post("/video-progress", auth, updateVideoProgress);
router.get("/:courseId", auth, getProgress);
router.get("/", auth, getAllProgress);

module.exports = router;
