const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  getProfile,
  updateProfile,
  getEnrolledCourses,
  getInstructorCourses
} = require("../controllers/userController");

// Get profile
router.get("/profile", auth, getProfile);

// Update profile
router.put("/profile", auth, updateProfile);

// Get enrolled courses (students)
router.get("/courses/enrolled", auth, getEnrolledCourses);

// Get instructor courses (instructors)
router.get("/courses/instructor", auth, roleMiddleware("instructor"), getInstructorCourses);

module.exports = router;
