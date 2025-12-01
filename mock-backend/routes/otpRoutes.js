/**
 * OTP Routes
 * Routes for OTP generation and verification
 */

const express = require("express");
const router = express.Router();
const { generateOTPForPhone, verifyOTP } = require("../controllers/otpController");

// Generate OTP for mobile login
router.post("/generate", generateOTPForPhone);

// Verify OTP for mobile login
router.post("/verify", verifyOTP);

module.exports = router;

