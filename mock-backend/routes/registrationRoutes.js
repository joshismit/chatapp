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
  validateOTP,
} = require("../middleware/validator");
const { asyncHandler } = require("../middleware/errorHandler");

/**
 * Custom validator for registration OTP generation
 * Ensures either phoneNumber or email is provided
 */
const validateRegistrationInput = (req, res, next) => {
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
  validateRegistrationInput,
  validatePhoneNumber, // Only validates if phoneNumber is provided
  asyncHandler(generateRegistrationOTP)
);

// Verify OTP and complete registration
router.post(
  "/verify-otp",
  validateRegistrationInput,
  validateRequired(["otp"]),
  validatePhoneNumber, // Only validates if phoneNumber is provided
  validateOTP,
  validateRegistrationCompletion,
  asyncHandler(verifyRegistrationOTP)
);

module.exports = router;

