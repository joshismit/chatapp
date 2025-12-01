/**
 * Authentication Middleware
 * Validates tokens and attaches user to request
 */

const { AuthToken, User } = require("../models");

/**
 * Extract token from request
 * Checks Authorization header, query params, and body
 */
const extractToken = (req) => {
  // Priority 1: Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  // Priority 2: Query parameter
  if (req.query.token) {
    return req.query.token.trim();
  }

  // Priority 3: Request body
  if (req.body.token) {
    return req.body.token.trim();
  }

  return null;
};

/**
 * Validate token format
 * Basic validation to ensure token is not empty and has minimum length
 */
const validateTokenFormat = (token) => {
  if (!token || typeof token !== "string") {
    return false;
  }
  // Token should be at least 10 characters
  if (token.length < 10) {
    return false;
  }
  return true;
};

/**
 * Main authentication middleware
 * Validates token and attaches user to request
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Extract token from request
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
        error: "NO_TOKEN",
      });
    }

    // Validate token format
    if (!validateTokenFormat(token)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
        error: "INVALID_TOKEN_FORMAT",
      });
    }

    // Find token in database
    const authToken = await AuthToken.findOne({
      token: token,
      expiresAt: { $gt: new Date() },
    });

    if (!authToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
        error: "INVALID_TOKEN",
      });
    }

    // Get user associated with token
    const user = await User.findOne({ userId: authToken.userId });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found for this token",
        error: "USER_NOT_FOUND",
      });
    }

    // Ensure user is registered (for protected routes)
    if (!user.isRegistered) {
      return res.status(403).json({
        success: false,
        message: "User registration incomplete. Please complete registration first.",
        error: "REGISTRATION_INCOMPLETE",
      });
    }

    // Attach user and token info to request
    req.user = user;
    req.authToken = authToken;
    req.token = token; // Store token for potential use

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: "AUTH_ERROR",
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't fail if missing
 * Useful for endpoints that work with or without authentication
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (token && validateTokenFormat(token)) {
      const authToken = await AuthToken.findOne({
        token: token,
        expiresAt: { $gt: new Date() },
      });

      if (authToken) {
        const user = await User.findOne({ userId: authToken.userId });
        if (user) {
          req.user = user;
          req.authToken = authToken;
          req.token = token;
        }
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors, just continue
    console.warn("Optional authentication warning:", error.message);
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  extractToken,
  validateTokenFormat,
};
