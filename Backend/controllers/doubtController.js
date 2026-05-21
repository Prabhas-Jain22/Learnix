const Doubt = require("../models/Doubt");
const User = require("../models/user");

// Create a doubt
exports.createDoubt = async (req, res) => {
  try {
    const { courseId, title, question } = req.body;
    const userId = req.user.id;

    if (!courseId || !title || !question) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const doubt = new Doubt({
      userId,
      courseId,
      title,
      question
    });

    await doubt.save();
    await doubt.populate("userId", "name email");

    res.status(201).json({ message: "Doubt created", doubt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all doubts for a course
exports.getDoubtsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const doubts = await Doubt.find({ courseId })
      .populate("userId", "name email profilePicture")
      .populate("replies.userId", "name email profilePicture role")
      .sort({ createdAt: -1 });

    res.json(doubts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reply to a doubt
exports.replyToDoubt = async (req, res) => {
  try {
    const { doubtId } = req.params;
    const { reply } = req.body;
    const userId = req.user.id;

    if (!reply) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    const doubt = await Doubt.findByIdAndUpdate(
      doubtId,
      {
        $push: {
          replies: { userId, reply }
        },
        updatedAt: new Date()
      },
      { new: true }
    ).populate("userId", "name email")
      .populate("replies.userId", "name email role");

    res.json({ message: "Reply added", doubt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all doubts by a student
exports.getMyDoubts = async (req, res) => {
  try {
    const userId = req.user.id;

    const doubts = await Doubt.find({ userId })
      .populate("courseId", "title")
      .populate("replies.userId", "name email role")
      .sort({ createdAt: -1 });

    res.json(doubts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark doubt as resolved
exports.resolveDoubt = async (req, res) => {
  try {
    const { doubtId } = req.params;

    const doubt = await Doubt.findByIdAndUpdate(
      doubtId,
      { status: "resolved", updatedAt: new Date() },
      { new: true }
    );

    res.json({ message: "Doubt resolved", doubt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
