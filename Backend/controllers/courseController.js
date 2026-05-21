const Course = require("../models/Course");
const User = require("../models/user");

// Create Course (Instructor only)
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const course = new Course({
      title,
      description,
      category: category || "General",
      instructor: req.user.id
    });

    await course.save();
    await course.populate("instructor", "name");

    res.json({ message: "Course created", course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all courses with search and filter
exports.getCourses = async (req, res) => {
  try {
    const { search, category } = req.query;

    let query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    const courses = await Course.find(query)
      .populate("instructor", "name email")
      .select("title description category thumbnail instructor averageRating students");

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get course details
exports.getCourseDetail = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate("instructor", "name email bio")
      .populate("reviews.userId", "name profilePicture")
      .populate("lessons");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Enroll in course
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if already enrolled
    if (course.students.includes(userId)) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    course.students.push(userId);
    await course.save();

    // Add to user's enrolled courses
    await User.findByIdAndUpdate(userId, {
      $push: { enrolledCourses: courseId }
    });

    res.json({ message: "Successfully enrolled in course", course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add review and rating
exports.addReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user already reviewed
    const existingReview = course.reviews.find(
      (r) => r.userId.toString() === userId
    );

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      course.reviews.push({ userId, rating, comment });
    }

    // Calculate average rating
    const totalRating = course.reviews.reduce((sum, r) => sum + r.rating, 0);
    course.averageRating = (totalRating / course.reviews.length).toFixed(1);

    await course.save();
    await course.populate("reviews.userId", "name profilePicture");

    res.json({ message: "Review added", course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get reviews for a course
exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate("reviews.userId", "name profilePicture");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({
      reviews: course.reviews,
      averageRating: course.averageRating,
      totalReviews: course.reviews.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};