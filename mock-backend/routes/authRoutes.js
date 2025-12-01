/**
 * Auth Routes
 * Routes for authentication and token management
 */

const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
  legacyLogin,
  generateToken,
  verifyToken,
} = require("../controllers/authController");

// Legacy login endpoint (token-based - kept for backward compatibility)
router.post("/login", legacyLogin);

// Generate test token endpoint - For development/testing
router.post("/generate-token", generateToken);

// Verify token endpoint - Check if token is valid (requires authentication)
router.get("/verify", authenticateToken, verifyToken);

module.exports = router;

