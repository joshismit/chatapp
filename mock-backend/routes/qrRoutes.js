/**
 * QR Code Routes
 * Routes for QR code generation, scanning, and verification
 */

const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
  validateRequired,
  validateQRToken,
} = require("../middleware/validator");
const { asyncHandler } = require("../middleware/errorHandler");
const {
  generateQRCode,
  checkQRStatus,
  scanQRCode,
  verifyQRCode,
} = require("../controllers/qrController");

// Generate QR code for desktop login
router.post("/generate", asyncHandler(generateQRCode));

// Check QR code status (polling endpoint for desktop)
router.get("/status/:qrToken", validateQRToken, asyncHandler(checkQRStatus));

// Scan QR code (mobile endpoint - requires authentication)
router.post(
  "/scan",
  authenticateToken,
  validateRequired(["qrToken"]),
  validateQRToken,
  asyncHandler(scanQRCode)
);

// Verify QR code (mobile endpoint - requires authentication)
router.post(
  "/verify",
  authenticateToken,
  validateRequired(["qrToken"]),
  validateQRToken,
  asyncHandler(verifyQRCode)
);

module.exports = router;

