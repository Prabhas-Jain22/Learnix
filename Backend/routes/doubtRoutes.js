const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createDoubt,
  getDoubtsByCourse,
  replyToDoubt,
  getMyDoubts,
  resolveDoubt
} = require("../controllers/doubtController");

// Create doubt
router.post("/", auth, createDoubt);

// Get doubts for a course
router.get("/course/:courseId", getDoubtsByCourse);

// Get my doubts
router.get("/my-doubts", auth, getMyDoubts);

// Reply to doubt
router.post("/:doubtId/reply", auth, replyToDoubt);

// Resolve doubt
router.put("/:doubtId/resolve", auth, resolveDoubt);

module.exports = router;
