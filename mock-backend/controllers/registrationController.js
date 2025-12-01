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
  hashPassword,
  validatePassword,
} = require("../utils/helpers");

/**
 * Validate email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate OTP for registration
 * Now requires: firstName, lastName, email, phoneNumber, password, confirmPassword
 */
const generateRegistrationOTP = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;

    // Validate all required fields
    if (!firstName || firstName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "First name is required (minimum 2 characters)",
        error: "VALIDATION_ERROR",
      });
    }

    if (!lastName || lastName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Last name is required (minimum 2 characters)",
        error: "VALIDATION_ERROR",
      });
    }

    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
        error: "VALIDATION_ERROR",
      });
    }

    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Valid phone number is required",
        error: "VALIDATION_ERROR",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
        error: "VALIDATION_ERROR",
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
        error: "INVALID_PASSWORD",
      });
    }

    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please confirm your password",
        error: "VALIDATION_ERROR",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
        error: "PASSWORD_MISMATCH",
      });
    }

    // Both phone and email are required for registration
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

    // Normalize identifiers
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists (by email or phone)
    const existingUserByEmail = await User.findOne({
      email: normalizedEmail,
      isRegistered: true,
    });

    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists. Please login instead.",
        error: "USER_EXISTS",
        action: "login",
      });
    }

    const existingUserByPhone = await User.findOne({
      phoneNumber: normalizedPhone,
      isRegistered: true,
    });

    if (existingUserByPhone) {
      return res.status(400).json({
        success: false,
        message: "User with this phone number already exists. Please login instead.",
        error: "USER_EXISTS",
        action: "login",
      });
    }

    // Hash password before storing
    const passwordHash = await hashPassword(password);

    // Generate 6-digit OTP
    const otp = generateOTP();

    // Invalidate any existing unused OTPs for this email/phone
    await OTP.updateMany(
      {
        $or: [
          { email: normalizedEmail, isUsed: false, type: "registration" },
          { phoneNumber: normalizedPhone, isUsed: false, type: "registration" },
        ],
      },
      { isUsed: true }
    );

    // Create new OTP with registration data (expires in 5 minutes)
    const otpRecord = await OTP.create({
      email: normalizedEmail,
      phoneNumber: normalizedPhone,
      otp: otp,
      type: "registration",
      expiresAt: new Date(Date.now() + constants.OTP_EXPIRATION),
      isUsed: false,
      attempts: 0,
      registrationData: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        passwordHash: passwordHash,
        phoneNumber: normalizedPhone,
        email: normalizedEmail,
      },
    });

    // In production, send OTP via SMS/Email service
    console.log(
      `📱 Registration OTP for Email: ${normalizedEmail}, Phone: ${normalizedPhone}, OTP: ${otp}`
    );

    res.status(200).json({
      success: true,
      message: "OTP generated successfully for registration",
      // Remove otp field in production - only for development
      otp: process.env.NODE_ENV === "production" ? undefined : otp,
      expiresIn: constants.OTP_EXPIRATION / 1000, // seconds
      method: "email", // Always use email for registration now
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
    const { email, otp } = req.body;

    // Email and OTP are required
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
        error: "VALIDATION_ERROR",
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
        error: "VALIDATION_ERROR",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find valid OTP with registration data
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
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

    // Check if registration data exists
    if (!otpRecord.registrationData) {
      return res.status(400).json({
        success: false,
        message: "Registration data not found. Please start registration again.",
        error: "INVALID_REGISTRATION",
      });
    }

    const { firstName, lastName, passwordHash, phoneNumber: regPhone, email: regEmail } = otpRecord.registrationData;

    // OTP is valid - mark as used
    otpRecord.isUsed = true;
    otpRecord.verifiedAt = new Date();
    await otpRecord.save();

    // Check if user already exists (double check)
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail, isRegistered: true },
        { phoneNumber: regPhone, isRegistered: true },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please login instead.",
        error: "USER_EXISTS",
        action: "login",
      });
    }

    // Create display name from first and last name
    const displayName = `${firstName} ${lastName}`.trim();

    // Create new user
    const userId = generateUserId(normalizedEmail);

    const userData = {
      userId: userId,
      firstName: firstName,
      lastName: lastName,
      displayName: displayName,
      email: normalizedEmail,
      phoneNumber: regPhone,
      password: passwordHash,
      isOnline: false, // User is not logged in yet
      lastSeen: new Date(),
      isRegistered: true,
      registrationMethod: "email", // Both email and phone are required now
    };

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      userId: user.userId,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
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

