const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  createCourse,
  getCourses,
  getCourseDetail,
  enrollCourse,
  addReview,
  getCourseReviews
} = require("../controllers/courseController");

// Multer setup for file uploads with validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// File filter for video files only
const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'), false);
  }
};

// File filter for image files only
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const uploadVideo = multer({
  storage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for thumbnails
  }
});

// UPLOAD VIDEO
router.post("/upload-video", authMiddleware, roleMiddleware("instructor"), uploadVideo.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const videoUrl = `${baseUrl}/uploads/${req.file.filename}`;
  res.json({
    videoUrl,
    filename: req.file.filename,
    size: req.file.size,
    message: "Video uploaded successfully"
  });
});

// UPLOAD THUMBNAIL
router.post("/upload-thumbnail", authMiddleware, roleMiddleware("instructor"), uploadImage.single("thumbnail"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No thumbnail uploaded" });
  }

  const thumbnailPath = `/uploads/${req.file.filename}`;
  console.log("Thumbnail uploaded:", thumbnailPath);

  res.json({
    thumbnail: thumbnailPath,
    filename: req.file.filename,
    size: req.file.size,
    message: "Thumbnail uploaded successfully"
  });
});

// UPLOAD VIDEO AND ADD LESSON (Combined endpoint)
router.post("/upload-lesson/:courseId", authMiddleware, roleMiddleware("instructor"), uploadVideo.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Lesson title is required" });
    }

    const Course = require("../models/Course");
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if instructor owns the course
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only add lessons to your own courses" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const videoUrl = `${baseUrl}/uploads/${req.file.filename}`;

    course.lessons.push({
      title,
      videoUrl
    });

    await course.save();

    res.json({
      message: "Lesson uploaded and added successfully",
      course,
      lesson: {
        title,
        videoUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (err) {
    console.error("Upload lesson error:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE A LESSON / VIDEO FROM A COURSE
router.delete(
  "/:courseId/lesson/:lessonId",
  authMiddleware,
  roleMiddleware("instructor"),
  async (req, res) => {
    try {
      const Course = require("../models/Course");
      const course = await Course.findById(req.params.courseId);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (course.instructor.toString() !== req.user.id) {
        return res.status(403).json({ message: "You can only remove lessons from your own courses" });
      }

      const lesson = course.lessons.id(req.params.lessonId);

      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const videoUrl = lesson.videoUrl;
      lesson.remove();
      await course.save();

      if (videoUrl && videoUrl.includes("/uploads/")) {
        const fileName = path.basename(videoUrl);
        const filePath = path.join(__dirname, "..", "uploads", fileName);
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr && unlinkErr.code !== "ENOENT") {
            console.error("Failed to delete lesson video file:", unlinkErr);
          }
        });
      }

      res.json({ message: "Lesson deleted successfully", course });
    } catch (err) {
      console.error("Delete lesson error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// TEST
router.get("/test", (req, res) => {
  res.send("Course route working ✅");
});

// DELETE COURSE (must come before generic GET /)
router.delete(
  "/:courseId",
  authMiddleware,
  roleMiddleware("instructor"),
  async (req, res) => {
    try {
      const Course = require("../models/Course");

      const course = await Course.findById(req.params.courseId);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if instructor owns the course
      if (course.instructor.toString() !== req.user.id) {
        return res.status(403).json({ message: "You can only delete your own courses" });
      }

      await Course.findByIdAndDelete(req.params.courseId);

      res.json({ message: "Course deleted successfully ✅" });
    } catch (err) {
      console.error("Delete course error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// CREATE COURSE
router.post(
  "/create",
  authMiddleware,
  roleMiddleware("instructor"),
  async (req, res) => {
    try {
      const Course = require("../models/Course");

      const { title, description, thumbnail } = req.body;

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const recordThumbnail = thumbnail
        ? (thumbnail.startsWith("http") ? thumbnail : `${baseUrl}${thumbnail}`)
        : "https://via.placeholder.com/300x200?text=Course";

      console.log("Creating course with thumbnail:", recordThumbnail);

      const course = new Course({
        title,
        description,
        thumbnail: recordThumbnail,
        instructor: req.user.id
      });

      await course.save();

      res.json({ message: "Course created successfully ✅", course });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ENROLL IN COURSE
router.post(
  "/enroll/:courseId",
  authMiddleware,
  async (req, res) => {
    try {
      const Course = require("../models/Course");
      const User = require("../models/user");

      const course = await Course.findById(req.params.courseId);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (course.students.includes(req.user.id)) {
        return res.json({ message: "Already enrolled" });
      }

      course.students.push(req.user.id);
      await course.save();

      // Add to user's enrolled courses
      await User.findByIdAndUpdate(req.user.id, {
        $push: { enrolledCourses: req.params.courseId }
      });

      res.json({ message: "Enrolled successfully ✅" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET MY COURSES
router.get(
  "/my-courses",
  authMiddleware,
  async (req, res) => {
    try {
      const Course = require("../models/Course");
      const mongoose = require("mongoose");

      // Convert user ID to ObjectId format for proper querying
      const userId = new mongoose.Types.ObjectId(req.user.id);

      const courses = await Course.find({ students: userId }).populate("instructor", "name");

      res.json(courses);
    } catch (err) {
      console.error("My-courses error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ADD LESSON
router.post(
  "/add-lesson/:courseId",
  authMiddleware,
  roleMiddleware("instructor"),
  async (req, res) => {
    try {
      const Course = require("../models/Course");

      const { title, videoUrl } = req.body;

      const course = await Course.findById(req.params.courseId);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      course.lessons.push({ title, videoUrl });
      await course.save();

      res.json({ message: "Lesson added ✅", course });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ============ CONTROLLER-BASED ROUTES (must come after inline routes) ============

// Get all courses with search and filter
router.get("/", getCourses);

// Get course details
router.get("/:courseId/details", getCourseDetail);

// Add review and rating
router.post("/:courseId/review", authMiddleware, addReview);

// Get course reviews
router.get("/:courseId/reviews", getCourseReviews);

module.exports = router;