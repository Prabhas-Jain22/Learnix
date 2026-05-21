const Progress = require("../models/Progress");
const Course = require("../models/Course");

// Update progress
exports.updateProgress = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    const userId = req.user.id;

    let progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
      progress = new Progress({ userId, courseId, completedLessons: [] });
    }

    // Check if lesson already completed
    const isCompleted = progress.completedLessons.some(
      (lesson) => lesson.lessonId.toString() === lessonId
    );

    if (!isCompleted) {
      progress.completedLessons.push({ lessonId });
    }

    // Calculate progress percentage
    const course = await Course.findById(courseId);
    const totalLessons = course.lessons.length;
    const completedCount = progress.completedLessons.length;
    progress.progressPercentage = Math.round((completedCount / totalLessons) * 100);

    progress.updatedAt = new Date();
    await progress.save();

    res.json({ message: "Progress updated", progress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update video watch time
exports.updateVideoProgress = async (req, res) => {
  try {
    const { courseId, lessonId, watchedTime } = req.body;
    const userId = req.user.id;

    let progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
      progress = new Progress({ userId, courseId });
    }

    progress.lastWatchedLesson = lessonId;
    progress.lastWatchedTime = watchedTime;
    progress.updatedAt = new Date();
    await progress.save();

    res.json({ message: "Video progress saved", progress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get progress for a course
exports.getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
      return res.json({
        userId,
        courseId,
        completedLessons: [],
        progressPercentage: 0,
        lastWatchedTime: 0
      });
    }

    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all progress for student
exports.getAllProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const allProgress = await Progress.find({ userId }).populate("courseId", "title");
    res.json(allProgress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
