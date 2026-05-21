const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Learnix OTP Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2 style="color: #333;">Learnix OTP Verification</h2>
          <p style="color: #666;">Your OTP code is:</p>
          <h1 style="color: #007bff; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
          <p style="color: #999; font-size: 12px;">This code is valid for 5 minutes only.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error("Error sending OTP:", err);
    return false;
  }
};

module.exports = { generateOTP, sendOTPEmail };
