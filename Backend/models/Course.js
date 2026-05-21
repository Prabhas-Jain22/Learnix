const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: { type: String, default: "General" },
  thumbnail: {
    type: String,
    default: "https://via.placeholder.com/300x200?text=Course"
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  lessons: [
    {
      title: String,
      videoUrl: String,
      description: String,
      duration: Number // in seconds
    }
  ],
  // Reviews & Ratings
  reviews: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  averageRating: { type: Number, default: 0 },
  // Assignments
  assignments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment"
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Course", courseSchema);