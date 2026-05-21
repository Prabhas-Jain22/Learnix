const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: { type: String, required: true },
  description: String,
  dueDate: Date,
  questions: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      questionText: String,
      type: { type: String, enum: ["mcq", "text"], default: "mcq" },
      options: [String], // for MCQ
      correctAnswer: String, // for MCQ
      marks: { type: Number, default: 1 }
    }
  ],
  totalMarks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Assignment", assignmentSchema);
