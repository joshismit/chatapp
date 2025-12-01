/**
 * OTP Controller
 * Handles OTP generation and verification for mobile login
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
 * Generate OTP for phone number
 */
const generateOTPForPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();

    // Normalize phone number (remove spaces)
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Invalidate any existing unused OTPs for this phone number
    await OTP.updateMany(
      { phoneNumber: normalizedPhone, isUsed: false },
      { isUsed: true }
    );

    // Create new OTP (expires in 5 minutes)
    const otpRecord = await OTP.create({
      phoneNumber: normalizedPhone,
      otp: otp,
      expiresAt: new Date(Date.now() + constants.OTP_EXPIRATION),
      isUsed: false,
      attempts: 0,
    });

    // In production, send OTP via SMS service (Twilio, AWS SNS, etc.)
    // For now, we'll return it in development (remove in production!)
    console.log(`📱 OTP for ${phoneNumber}: ${otp}`);

    res.status(200).json({
      success: true,
      message: "OTP generated successfully",
      // Remove otp field in production - only for development
      otp: process.env.NODE_ENV === "production" ? undefined : otp,
      expiresIn: constants.OTP_EXPIRATION / 1000, // seconds
    });
  } catch (error) {
    console.error("OTP generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate OTP",
    });
  }
};

/**
 * Verify OTP and login user
 */
const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      phoneNumber: normalizedPhone,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 }); // Get the most recent OTP

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Check attempts
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum verification attempts exceeded. Please request a new OTP",
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
      });
    }

    // OTP is valid - mark as used
    otpRecord.isUsed = true;
    otpRecord.verifiedAt = new Date();
    await otpRecord.save();

    // Find or create user
    let user = await User.findOne({ phoneNumber: normalizedPhone });

    if (!user) {
      // Create new user
      const userId = generateUserId(normalizedPhone);
      user = await User.create({
        userId: userId,
        phoneNumber: normalizedPhone,
        displayName: `User ${normalizedPhone.slice(-4)}`, // Last 4 digits
        isOnline: true,
        lastSeen: new Date(),
      });
    } else {
      // Update user online status
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();
    }

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
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};

module.exports = {
  generateOTPForPhone,
  verifyOTP,
};

