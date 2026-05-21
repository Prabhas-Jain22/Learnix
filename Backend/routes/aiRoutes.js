const express = require("express");
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const AIChat = require("../models/AIChat");

const router = express.Router();
const errorLogPath = path.join(__dirname, "..", "logs", "ai-error.log");
if (!fs.existsSync(path.dirname(errorLogPath))) {
  fs.mkdirSync(path.dirname(errorLogPath), { recursive: true });
}

const buildAssistantPrompt = (message, courseId) => {
  let prompt = `You are an educational AI study assistant for a learning management system. Answer the student's question clearly, with examples and explanations when helpful. Keep the tone friendly, supportive, and concise. The student asked: "${message}".`;
  if (courseId) {
    prompt += ` The student is asking this question in the context of course ID ${courseId}. Respond as if you are helping a student inside that course.`;
  }
  return prompt;
};

router.post("/chat", authMiddleware, roleMiddleware("student"), async (req, res) => {
  const userId = req.user.id;
  const { message, courseId } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ message: "Please provide a valid message." });
  }

  try {
    const prompt = buildAssistantPrompt(message.trim(), courseId);
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.error("Gemini API key missing");
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in backend environment" });
    }

    console.log("Incoming AI chat request:", req.body);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const modelResponse = await model.generateContent(prompt);

    console.log("Model response raw:", JSON.stringify(modelResponse, null, 2));
    const reply = modelResponse?.response?.text?.() || "Sorry, I could not generate a response. Please try again.";

    const savedChat = await AIChat.create({
      userId,
      courseId: courseId || null,
      question: message.trim(),
      answer: reply.trim(),
    });

    res.json({ reply, chatId: savedChat._id });
  } catch (error) {
    const errText = `AI chat error: ${error?.message || String(error)}\n${error?.stack || ""}`;
    console.error(errText);
    fs.appendFileSync(errorLogPath, `${new Date().toISOString()} - ${errText}\n\n`);
    res.status(500).json({
      error: error?.message || String(error) || "Failed to generate AI answer. Please try again later.",
      stack: error?.stack ? error.stack.split("\n").slice(0, 3) : undefined,
    });
  }
});

router.get("/history", authMiddleware, roleMiddleware("student"), async (req, res) => {
  const userId = req.user.id;
  const courseId = req.query.courseId;

  try {
    const query = { userId };
    if (courseId) {
      query.courseId = courseId;
    }

    const history = await AIChat.find(query)
      .sort({ createdAt: 1 })
      .lean()
      .select("question answer courseId createdAt");

    res.json({ history });
  } catch (error) {
    console.error("AI history error:", error);
    res.status(500).json({ message: "Unable to load AI chat history." });
  }
});

module.exports = router;
