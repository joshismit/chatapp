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
const { legacyLogin } = require("../controllers/authController");

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Mock backend server is running" });
});

// Legacy login endpoint (for backward compatibility) - at /api/login
router.post("/login", legacyLogin);

// Mount route modules
router.use("/otp", otpRoutes);
router.use("/qr", qrRoutes);
router.use("/auth", authRoutes);
router.use("/", userRoutes); // User routes at root level

module.exports = router;

