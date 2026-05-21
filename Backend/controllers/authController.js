const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateOTP, sendOTPEmail } = require("../utils/otpUtils");

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
    }

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const otpSent = await sendOTPEmail(email, otp);
    if (!otpSent) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isOtpVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: process.env.JWT_EXPIRY || "1h" }
    );

    res.json({ token, role: user.role, message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register with password
exports.register = async (req, res) => {
  try { 
    const { email, name, password, role } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ message: "Email, name, and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email });
    if (user && user.password) {
      return res.status(400).json({ message: "Email is already registered. Please log in." });
    }

    if (!user) {
      user = new User({ email, name, password: hashedPassword, role });
    } else {
      user.name = name;
      user.password = hashedPassword;
      user.role = role;
    }

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: process.env.JWT_EXPIRY || "1h" }
    );

    res.json({ token, role: user.role, message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login with password
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.password) {
      return res.status(400).json({ message: "Please use OTP login for this account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: process.env.JWT_EXPIRY || "1h" }
    );

    res.json({ token, role: user.role, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};