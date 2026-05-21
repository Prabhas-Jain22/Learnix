const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Course = require("../models/Course");
const mongoose = require("mongoose");

// Create assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, questions } = req.body;
    const { courseId } = req.params;
    const instructorId = req.user.id;

    if (!courseId || !title || !questions || questions.length === 0) {
      return res.status(400).json({ message: "Invalid assignment data" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.instructor.toString() !== instructorId) {
      return res.status(403).json({ message: "Only the course instructor may create assignments for this course" });
    }

    // Generate IDs for questions and calculate total marks
    let totalMarks = 0;
    const formattedQuestions = questions.map((q) => ({
      _id: new mongoose.Types.ObjectId(),
      questionText: q.questionText,
      type: q.type || "mcq",
      options: q.options,
      correctAnswer: q.correctAnswer,
      marks: q.marks || 1
    }));

    totalMarks = formattedQuestions.reduce((sum, q) => sum + q.marks, 0);

    const assignment = new Assignment({
      courseId,
      instructorId,
      title,
      description,
      dueDate,
      questions: formattedQuestions,
      totalMarks
    });

    await assignment.save();
    course.assignments = course.assignments || [];
    course.assignments.push(assignment._id);
    await course.save();

    res.status(201).json({ message: "Assignment created", assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Submit assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { answers } = req.body;
    const studentId = req.user.id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!course.students.map((id) => id.toString()).includes(studentId)) {
      return res.status(403).json({ message: "You are not enrolled in this course" });
    }

    // Check answers and calculate score
    let totalMarks = 0;
    let marksObtained = 0;
    const evaluatedAnswers = [];

    answers.forEach((answer) => {
      const question = assignment.questions.find(
        (q) => q._id.toString() === answer.questionId
      );

      if (question) {
        totalMarks += question.marks;
        const isCorrect = answer.answer === question.correctAnswer;

        evaluatedAnswers.push({
          questionId: answer.questionId,
          answer: answer.answer,
          isCorrect,
          marksObtained: isCorrect ? question.marks : 0
        });

        if (isCorrect) {
          marksObtained += question.marks;
        }
      }
    });

    const scorePercentage = Math.round((marksObtained / totalMarks) * 100);

    const submission = new Submission({
      assignmentId,
      studentId,
      courseId: assignment.courseId,
      answers: evaluatedAnswers,
      totalMarks,
      scorePercentage
    });

    await submission.save();

    res.status(201).json({
      message: "Assignment submitted",
      submission,
      score: marksObtained,
      totalMarks,
      percentage: scorePercentage
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get assignment details
exports.getAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    const assignment = await Assignment.findById(assignmentId)
      .populate("courseId", "title instructor students")
      .populate("instructorId", "name");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const course = assignment.courseId;
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (requesterRole === "instructor") {
      if (course.instructor.toString() !== requesterId) {
        return res.status(403).json({ message: "Forbidden" });
      }
    } else {
      if (!course.students.map((id) => id.toString()).includes(requesterId)) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get student submission
exports.getSubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id;

    const submission = await Submission.findOne({
      assignmentId,
      studentId
    }).populate("assignmentId");

    if (!submission) {
      return res.json({ message: "No submission found", submission: null });
    }

    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all submissions for an assignment (instructor only)
exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = await Submission.find({ assignmentId })
      .populate("studentId", "name email")
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all assignments for a course
exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const isInstructor = requesterRole === "instructor" && course.instructor.toString() === requesterId;
    const isEnrolledStudent = course.students.map((id) => id.toString()).includes(requesterId);

    if (!isInstructor && !isEnrolledStudent) {
      return res.status(403).json({ message: "You are not enrolled in this course" });
    }

    const assignments = await Assignment.find({ courseId })
      .populate("instructorId", "name email")
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get results for course assignments
exports.getAssignmentResults = async (req, res) => {
  try {
    const { courseId } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const isInstructor = requesterRole === "instructor" && course.instructor.toString() === requesterId;
    const isEnrolledStudent = course.students.map((id) => id.toString()).includes(requesterId);

    if (!isInstructor && !isEnrolledStudent) {
      return res.status(403).json({ message: "You are not enrolled in this course" });
    }

    const results = await Submission.find({ courseId })
      .populate("studentId", "name email")
      .populate("assignmentId", "title")
      .sort({ submittedAt: -1 });

    if (isInstructor) {
      return res.json({ course: course.title, results });
    }

    const studentResults = results.filter((submission) => submission.studentId._id.toString() === requesterId);
    res.json({ course: course.title, results: studentResults });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
