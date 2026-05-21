const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  createAssignment,
  submitAssignment,
  getAssignment,
  getSubmission,
  getAssignmentSubmissions,
  getAssignmentsByCourse,
  getAssignmentResults
} = require("../controllers/assignmentController");

// Get assignments by course
router.get("/course/:courseId", auth, getAssignmentsByCourse);

// Create assignment (instructor only)
router.post("/create/:courseId", auth, roleMiddleware("instructor"), createAssignment);

// Get assignment details
router.get("/:assignmentId", auth, getAssignment);

// Submit assignment
router.post("/submit/:assignmentId", auth, submitAssignment);

// Get assignment results for course
router.get("/results/:courseId", auth, getAssignmentResults);

// Get student submission
router.get("/:assignmentId/submission", auth, getSubmission);

// Get all submissions for assignment (instructor only)
router.get("/:assignmentId/submissions", auth, roleMiddleware("instructor"), getAssignmentSubmissions);

module.exports = router;
