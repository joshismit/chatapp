/**
 * Auth Controller
 * Handles authentication and token management
 */

const { User, AuthToken, TypingIndicator } = require("../models");
const constants = require("../config/constants");
const {
  generateTestToken,
  generateUserId,
  generateAuthToken,
} = require("../utils/helpers");

/**
 * Legacy login endpoint (token-based - kept for backward compatibility)
 */
const legacyLogin = async (req, res) => {
  try {
    const { token, userId } = req.body;

    // Validate token is not empty
    if (!token || typeof token !== "string" || token.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Token is required and cannot be empty",
      });
    }

    // Check if token is already associated with a user in AuthToken
    let existingAuthToken = await AuthToken.findOne({
      token: token.trim(),
      expiresAt: { $gt: new Date() },
    });

    let user;

    if (existingAuthToken) {
      // Token exists and is valid, get the associated user
      user = await User.findOne({ userId: existingAuthToken.userId });

      if (!user) {
        // User was deleted but token exists, create new user
        user = await User.create({
          userId: existingAuthToken.userId,
          displayName: `User ${existingAuthToken.userId}`,
          isOnline: true,
          lastSeen: new Date(),
        });
      } else {
        // Update user online status
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();
      }
    } else {
      // New token - create or get user
      const targetUserId = userId || generateUserId();
      user = await User.findOne({ userId: targetUserId });

      if (!user) {
        // Create new user
        user = await User.create({
          userId: targetUserId,
          displayName: `User ${targetUserId}`,
          isOnline: true,
          lastSeen: new Date(),
        });
      } else {
        // Update existing user online status
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();
      }

      // Create new auth token record
      existingAuthToken = await AuthToken.create({
        token: token.trim(),
        userId: user.userId,
        type: constants.TOKEN_TYPES.JWT,
        expiresAt: new Date(Date.now() + constants.TOKEN_EXPIRATION),
        usedAt: new Date(),
      });
    }

    // Successful login - return token so frontend can store and use it
    res.status(200).json({
      success: true,
      userId: user.userId,
      token: token.trim(),
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Generate test token endpoint - For development/testing
 */
const generateToken = async (req, res) => {
  try {
    const { userId } = req.body;

    // Generate a unique token
    const token = generateTestToken();

    // Create or get user
    const targetUserId = userId || generateUserId();
    let user = await User.findOne({ userId: targetUserId });

    if (!user) {
      user = await User.create({
        userId: targetUserId,
        displayName: `User ${targetUserId}`,
        isOnline: true,
        lastSeen: new Date(),
      });
    }

    // Create auth token record
    await AuthToken.create({
      token: token,
      userId: user.userId,
      type: constants.TOKEN_TYPES.JWT,
      expiresAt: new Date(Date.now() + constants.TOKEN_EXPIRATION),
      usedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      token: token,
      userId: user.userId,
      expiresAt: new Date(Date.now() + constants.TOKEN_EXPIRATION),
      message:
        "Token generated successfully. Use this token to login at /api/login",
    });
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate token",
    });
  }
};

/**
 * Verify token endpoint - Check if token is valid
 */
const verifyToken = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      userId: req.user.userId,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "Token verification failed",
    });
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    const userId = req.user.userId;
    const token = req.token;

    // Update user online status
    const user = await User.findOne({ userId });
    if (user) {
      user.isOnline = false;
      user.lastSeen = new Date();
      await user.save();
    }

    // Delete/invalidate the token
    if (token) {
      await AuthToken.findOneAndDelete({ token });
    }

    // Clear typing indicators
    await TypingIndicator.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to logout",
      error: "SERVER_ERROR",
    });
  }
};

module.exports = {
  legacyLogin,
  generateToken,
  verifyToken,
  logout,
};
