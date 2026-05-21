const User = require("../models/user");
const Course = require("../models/Course");

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select("-password -otp -otpExpiry")
      .populate("enrolledCourses", "title thumbnail category")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, profilePicture } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(bio && { bio }),
        ...(profilePicture && { profilePicture })
      },
      { new: true }
    ).select("-password -otp -otpExpiry");

    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get enrolled courses
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate({
        path: "enrolledCourses",
        populate: { path: "instructor", select: "name" }
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.enrolledCourses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get instructor courses (for instructors)
exports.getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const courses = await Course.find({ instructor: instructorId })
      .populate("instructor", "name email")
      .select("title description category students reviews");

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
