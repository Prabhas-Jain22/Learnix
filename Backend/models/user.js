const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["student", "instructor"],
    default: "student"
  },
  // OTP Authentication
  otp: String,
  otpExpiry: Date,
  isOtpVerified: { type: Boolean, default: false },
  // Profile
  profilePicture: { type: String, default: null },
  bio: { type: String, default: "" },
  // Student enrollment
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);