/**
 * Auth Routes
 * Routes for authentication and token management
 */

const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { validateRequired } = require("../middleware/validator");
const { asyncHandler } = require("../middleware/errorHandler");
const {
  legacyLogin,
  generateToken,
  verifyToken,
  logout,
} = require("../controllers/authController");

// Legacy login endpoint (token-based - kept for backward compatibility)
router.post(
  "/login",
  validateRequired(["token"]),
  asyncHandler(legacyLogin)
);

// Generate test token endpoint - For development/testing
router.post("/generate-token", asyncHandler(generateToken));

// Verify token endpoint - Check if token is valid (requires authentication)
router.get("/verify", authenticateToken, asyncHandler(verifyToken));

// Logout endpoint (requires authentication)
router.post("/logout", authenticateToken, asyncHandler(logout));

module.exports = router;

