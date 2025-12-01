/**
 * Registration Routes
 * Routes for user registration (phone and email)
 */

const express = require("express");
const router = express.Router();
const {
  generateRegistrationOTP,
  verifyRegistrationOTP,
  checkAvailability,
} = require("../controllers/registrationController");
const {
  validateRequired,
  validatePhoneNumber,
  validateEmailFormat,
  validateOTP,
} = require("../middleware/validator");
const { asyncHandler } = require("../middleware/errorHandler");

/**
 * Custom validator for registration OTP generation
 * Ensures BOTH phoneNumber and email are provided (required for registration)
 */
const validateRegistrationInput = (req, res, next) => {
  const { phoneNumber, email } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required for registration",
      error: "VALIDATION_ERROR",
    });
  }

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required for registration",
      error: "VALIDATION_ERROR",
    });
  }

  next();
};

/**
 * Custom validator for registration completion
 * Ensures displayName is provided
 */
const validateRegistrationCompletion = (req, res, next) => {
  const { displayName } = req.body;

  if (!displayName || displayName.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Display name is required (minimum 2 characters)",
      error: "VALIDATION_ERROR",
    });
  }

  next();
};

// Check if phone/email is available for registration
router.get("/check-availability", asyncHandler(checkAvailability));

// Generate OTP for registration
router.post(
  "/generate-otp",
  validateRegistrationInput, // Requires both email and phone
  validatePhoneNumber, // Validates phone number format
  validateEmailFormat, // Validates email format
  asyncHandler(generateRegistrationOTP)
);

// Verify OTP and complete registration
// Note: Only email and OTP are needed for verification (phone is stored in OTP record)
router.post(
  "/verify-otp",
  validateRequired(["email", "otp"]), // Email and OTP are required for verification
  validateEmailFormat, // Validate email format
  validateOTP, // Validate OTP format
  asyncHandler(verifyRegistrationOTP)
);

module.exports = router;

