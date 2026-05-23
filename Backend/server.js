const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
if (process.env.GEMINI_API_KEY) {
  process.env.GOOGLE_API_KEY = process.env.GEMINI_API_KEY;
}

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("MONGODB_URI:", process.env.MONGODB_URI);

// ✅ Middlewares (MUST BE FIRST)
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const progressRoutes = require("./routes/progressRoutes");
const doubtRoutes = require("./routes/doubtRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", userRoutes);

// ✅ Health Route
app.get("/", (req, res) => {
  res.send("Learnix Backend Running 🚀");
});

// ✅ MongoDB Connection
if (!MONGO_URI) {
  console.log("Missing MONGO_URI environment variable. Deployment cannot proceed.");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
.then(() => {
  console.log("MongoDB Connected ✅");

  // ✅ Start server AFTER DB connects
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
  });
})
.catch(err => {
  console.log("MongoDB connection error:", err);
  process.exit(1);
});