const express = require("express");
const router = express.Router();
const { register, login, sendOTP, verifyOTP } = require("../controllers/authController");

// OTP Authentication
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// Password Authentication
router.post("/register", register);
router.post("/login", login);

module.exports = router;
