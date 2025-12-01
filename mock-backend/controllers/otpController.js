/**
 * OTP Controller
 * Handles OTP generation and verification for login (phone and email)
 * Only works for existing registered users
 */

const { OTP, User, AuthToken } = require("../models");
const constants = require("../config/constants");
const {
  generateOTP,
  normalizePhoneNumber,
  validatePhoneNumber,
  validateEmail,
  generateAuthToken,
} = require("../utils/helpers");

/**
 * Generate OTP for login (phone or email)
 */
const generateOTPForLogin = async (req, res) => {
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
    } else {
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
    }

    // Check if user exists and is registered
    const user = await User.findOne({
      [identifierField]: normalizedIdentifier,
      isRegistered: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
        error: "USER_NOT_FOUND",
        action: "register",
      });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();

    // Invalidate any existing unused OTPs for this identifier
    const updateQuery = {
      [identifierField]: normalizedIdentifier,
      isUsed: false,
      type: "login",
    };
    await OTP.updateMany(updateQuery, { isUsed: true });

    // Create new OTP (expires in 5 minutes)
    const otpRecord = await OTP.create({
      [identifierField]: normalizedIdentifier,
      otp: otp,
      type: "login",
      expiresAt: new Date(Date.now() + constants.OTP_EXPIRATION),
      isUsed: false,
      attempts: 0,
    });

    // In production, send OTP via SMS/Email service
    console.log(
      `📱 Login OTP for ${identifierField === "phoneNumber" ? "Phone" : "Email"} ${normalizedIdentifier}: ${otp}`
    );

    res.status(200).json({
      success: true,
      message: "OTP generated successfully",
      // Remove otp field in production - only for development
      otp: process.env.NODE_ENV === "production" ? undefined : otp,
      expiresIn: constants.OTP_EXPIRATION / 1000, // seconds
      method: identifierField === "phoneNumber" ? "phone" : "email",
    });
  } catch (error) {
    console.error("OTP generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate OTP",
      error: "SERVER_ERROR",
    });
  }
};

/**
 * Verify OTP and login user
 * Only works for existing registered users
 */
const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, email, otp } = req.body;

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
      type: "login",
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

    // Find user - must exist and be registered
    const user = await User.findOne({
      [identifierField]: normalizedIdentifier,
      isRegistered: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
        error: "USER_NOT_FOUND",
        action: "register",
      });
    }

    // Update user online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate auth token
    const authToken = generateAuthToken();

    await AuthToken.create({
      token: authToken,
      userId: user.userId,
      type: constants.TOKEN_TYPES.JWT,
      expiresAt: new Date(Date.now() + constants.TOKEN_EXPIRATION),
      usedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      userId: user.userId,
      token: authToken,
      user: {
        userId: user.userId,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        isOnline: user.isOnline,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: "SERVER_ERROR",
    });
  }
};

module.exports = {
  generateOTPForLogin,
  verifyOTP,
};
