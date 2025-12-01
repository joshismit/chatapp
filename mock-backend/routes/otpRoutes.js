/**
 * OTP Routes
 * Routes for OTP generation and verification (Login only - for existing users)
 */

const express = require("express");
const router = express.Router();
const { generateOTPForLogin, verifyOTP } = require("../controllers/otpController");
const {
  validateRequired,
  validatePhoneNumber,
  validateEmailFormat,
  validateOTP,
} = require("../middleware/validator");
const { asyncHandler } = require("../middleware/errorHandler");

/**
 * Custom validator for login OTP generation
 * Ensures either phoneNumber or email is provided
 */
const validateLoginInput = (req, res, next) => {
  const { phoneNumber, email } = req.body;

  if (!phoneNumber && !email) {
    return res.status(400).json({
      success: false,
      message: "Phone number or email is required",
      error: "VALIDATION_ERROR",
    });
  }

  if (phoneNumber && email) {
    return res.status(400).json({
      success: false,
      message: "Provide either phone number or email, not both",
      error: "VALIDATION_ERROR",
    });
  }

  next();
};

// Generate OTP for login (phone or email)
router.post(
  "/generate",
  validateLoginInput,
  validatePhoneNumber, // Only validates if phoneNumber is provided
  validateEmailFormat, // Only validates if email is provided
  asyncHandler(generateOTPForLogin)
);

// Verify OTP for login (phone or email)
router.post(
  "/verify",
  validateLoginInput,
  validateRequired(["otp"]),
  validatePhoneNumber, // Only validates if phoneNumber is provided
  validateEmailFormat, // Only validates if email is provided
  validateOTP,
  asyncHandler(verifyOTP)
);

module.exports = router;

