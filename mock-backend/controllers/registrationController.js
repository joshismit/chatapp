/**
 * Registration Controller
 * Handles user registration for both phone and website (email)
 */

const { OTP, User, AuthToken } = require("../models");
const constants = require("../config/constants");
const {
  generateOTP,
  normalizePhoneNumber,
  validatePhoneNumber,
  generateUserId,
  generateAuthToken,
} = require("../utils/helpers");

/**
 * Validate email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate OTP for registration (phone or email)
 */
const generateRegistrationOTP = async (req, res) => {
  try {
    const { phoneNumber, email } = req.body;

    // Must provide either phone or email
    if (!phoneNumber && !email) {
      return res.status(400).json({
        success: false,
        message: "Phone number or email is required",
        error: "VALIDATION_ERROR",
      });
    }

    // Cannot provide both
    if (phoneNumber && email) {
      return res.status(400).json({
        success: false,
        message: "Provide either phone number or email, not both",
        error: "VALIDATION_ERROR",
      });
    }

    let normalizedIdentifier;
    let identifierField;

    if (phoneNumber) {
      // Validate phone number format
      if (!validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format",
          error: "INVALID_PHONE_NUMBER",
        });
      }

      normalizedIdentifier = normalizePhoneNumber(phoneNumber);
      identifierField = "phoneNumber";

      // Check if user already exists
      const existingUser = await User.findOne({
        phoneNumber: normalizedIdentifier,
        isRegistered: true,
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this phone number already exists. Please login instead.",
          error: "USER_EXISTS",
          action: "login",
        });
      }
    } else if (email) {
      // Validate email format
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
          error: "INVALID_EMAIL",
        });
      }

      normalizedIdentifier = email.toLowerCase().trim();
      identifierField = "email";

      // Check if user already exists
      const existingUser = await User.findOne({
        email: normalizedIdentifier,
        isRegistered: true,
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists. Please login instead.",
          error: "USER_EXISTS",
          action: "login",
        });
      }
    }

    // Generate 6-digit OTP
    const otp = generateOTP();

    // Invalidate any existing unused OTPs for this identifier
    const updateQuery = {
      [identifierField]: normalizedIdentifier,
      isUsed: false,
      type: "registration",
    };
    await OTP.updateMany(updateQuery, { isUsed: true });

    // Create new OTP (expires in 5 minutes)
    const otpRecord = await OTP.create({
      [identifierField]: normalizedIdentifier,
      otp: otp,
      type: "registration",
      expiresAt: new Date(Date.now() + constants.OTP_EXPIRATION),
      isUsed: false,
      attempts: 0,
    });

    // In production, send OTP via SMS/Email service
    console.log(
      `📱 Registration OTP for ${identifierField === "phoneNumber" ? "Phone" : "Email"} ${normalizedIdentifier}: ${otp}`
    );

    res.status(200).json({
      success: true,
      message: "OTP generated successfully for registration",
      // Remove otp field in production - only for development
      otp: process.env.NODE_ENV === "production" ? undefined : otp,
      expiresIn: constants.OTP_EXPIRATION / 1000, // seconds
      method: identifierField === "phoneNumber" ? "phone" : "email",
    });
  } catch (error) {
    console.error("Registration OTP generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate registration OTP",
      error: "SERVER_ERROR",
    });
  }
};

/**
 * Verify OTP and complete registration
 */
const verifyRegistrationOTP = async (req, res) => {
  try {
    const { phoneNumber, email, otp, displayName } = req.body;

    // Must provide either phone or email
    if (!phoneNumber && !email) {
      return res.status(400).json({
        success: false,
        message: "Phone number or email is required",
        error: "VALIDATION_ERROR",
      });
    }

    // Cannot provide both
    if (phoneNumber && email) {
      return res.status(400).json({
        success: false,
        message: "Provide either phone number or email, not both",
        error: "VALIDATION_ERROR",
      });
    }

    // Display name is required for registration
    if (!displayName || displayName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Display name is required (minimum 2 characters)",
        error: "VALIDATION_ERROR",
      });
    }

    let normalizedIdentifier;
    let identifierField;

    if (phoneNumber) {
      normalizedIdentifier = normalizePhoneNumber(phoneNumber);
      identifierField = "phoneNumber";
    } else {
      normalizedIdentifier = email.toLowerCase().trim();
      identifierField = "email";
    }

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      [identifierField]: normalizedIdentifier,
      isUsed: false,
      expiresAt: { $gt: new Date() },
      type: "registration",
    }).sort({ createdAt: -1 }); // Get the most recent OTP

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
        error: "INVALID_OTP",
      });
    }

    // Check attempts
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum verification attempts exceeded. Please request a new OTP",
        error: "MAX_ATTEMPTS_EXCEEDED",
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
        remainingAttempts: otpRecord.maxAttempts - otpRecord.attempts,
        error: "INVALID_OTP",
      });
    }

    // OTP is valid - mark as used
    otpRecord.isUsed = true;
    otpRecord.verifiedAt = new Date();
    await otpRecord.save();

    // Check if user already exists (double check)
    const existingUser = await User.findOne({
      [identifierField]: normalizedIdentifier,
      isRegistered: true,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please login instead.",
        error: "USER_EXISTS",
        action: "login",
      });
    }

    // Create new user
    const userId = generateUserId(normalizedIdentifier);
    const registrationMethod = identifierField === "phoneNumber" ? "phone" : "email";

    const userData = {
      userId: userId,
      displayName: displayName.trim(),
      isOnline: false, // User is not logged in yet
      lastSeen: new Date(),
      isRegistered: true,
      registrationMethod: registrationMethod,
    };

    if (identifierField === "phoneNumber") {
      userData.phoneNumber = normalizedIdentifier;
    } else {
      userData.email = normalizedIdentifier;
    }

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      userId: user.userId,
      user: {
        userId: user.userId,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        isRegistered: user.isRegistered,
        registrationMethod: user.registrationMethod,
      },
      message: "Registration successful. Please login to continue.",
      action: "login", // Indicates user needs to login
    });
  } catch (error) {
    console.error("Registration verification error:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User with this information already exists",
        error: "DUPLICATE_USER",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to complete registration",
      error: "SERVER_ERROR",
    });
  }
};

/**
 * Check if phone/email is available for registration
 */
const checkAvailability = async (req, res) => {
  try {
    const { phoneNumber, email } = req.query;

    if (!phoneNumber && !email) {
      return res.status(400).json({
        success: false,
        message: "Phone number or email is required",
        error: "VALIDATION_ERROR",
      });
    }

    let query = {};
    if (phoneNumber) {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      if (!validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format",
          error: "INVALID_PHONE_NUMBER",
        });
      }
      query.phoneNumber = normalizedPhone;
    } else {
      const normalizedEmail = email.toLowerCase().trim();
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
          error: "INVALID_EMAIL",
        });
      }
      query.email = normalizedEmail;
    }

    const existingUser = await User.findOne({
      ...query,
      isRegistered: true,
    });

    res.status(200).json({
      success: true,
      available: !existingUser,
      message: existingUser
        ? "Phone number/email is already registered"
        : "Phone number/email is available",
    });
  } catch (error) {
    console.error("Availability check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check availability",
      error: "SERVER_ERROR",
    });
  }
};

module.exports = {
  generateRegistrationOTP,
  verifyRegistrationOTP,
  checkAvailability,
};

