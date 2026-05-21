const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  answers: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      answer: String,
      isCorrect: Boolean,
      marksObtained: Number
    }
  ],
  totalMarks: Number,
  scorePercentage: Number,
  submittedAt: { type: Date, default: Date.now },
  feedback: String
});

module.exports = mongoose.model("Submission", submissionSchema);
