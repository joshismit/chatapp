/**
 * Authentication Middleware
 * Validates JWT tokens and attaches user to request
 */

const { AuthToken, User } = require("../models");

const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header or query params
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : req.query.token || req.body.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    // Validate token exists and is not expired
    const authToken = await AuthToken.findOne({
      token: token.trim(),
      expiresAt: { $gt: new Date() },
    });

    if (!authToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Get user associated with token
    const user = await User.findOne({ userId: authToken.userId });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found for this token",
      });
    }

    // Attach user info to request for use in route handlers
    req.user = user;
    req.authToken = authToken;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = { authenticateToken };

