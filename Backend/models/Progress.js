const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  completedLessons: [
    {
      lessonId: mongoose.Schema.Types.ObjectId,
      completedAt: { type: Date, default: Date.now }
    }
  ],
  lastWatchedTime: { type: Number, default: 0 }, // in seconds
  lastWatchedLesson: mongoose.Schema.Types.ObjectId,
  progressPercentage: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Progress", progressSchema);
