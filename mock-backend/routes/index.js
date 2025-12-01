/**
 * Main Routes Index
 * Combines all route modules
 */

const express = require("express");
const router = express.Router();
const otpRoutes = require("./otpRoutes");
const qrRoutes = require("./qrRoutes");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const registrationRoutes = require("./registrationRoutes");
const chatRoutes = require("./chatRoutes");
const sseRoutes = require("./sseRoutes");
const { legacyLogin } = require("../controllers/authController");
const { validateRequired } = require("../middleware/validator");
const { asyncHandler } = require("../middleware/errorHandler");

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Mock backend server is running" });
});

// Legacy login endpoint (for backward compatibility) - at /api/login
router.post(
  "/login",
  validateRequired(["token"]),
  asyncHandler(legacyLogin)
);

// Mount route modules
router.use("/register", registrationRoutes); // Registration routes
router.use("/otp", otpRoutes); // Login OTP routes
router.use("/qr", qrRoutes);
router.use("/auth", authRoutes);
router.use("/chat", chatRoutes); // Chat routes (conversations, messages, status)
router.use("/sse", sseRoutes); // SSE routes for real-time updates
router.use("/", userRoutes); // User routes at root level

module.exports = router;

