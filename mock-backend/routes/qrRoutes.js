/**
 * QR Code Routes
 * Routes for QR code generation, scanning, and verification
 */

const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
  generateQRCode,
  checkQRStatus,
  scanQRCode,
  verifyQRCode,
} = require("../controllers/qrController");

// Generate QR code for desktop login
router.post("/generate", generateQRCode);

// Check QR code status (polling endpoint for desktop)
router.get("/status/:qrToken", checkQRStatus);

// Scan QR code (mobile endpoint - requires authentication)
router.post("/scan", authenticateToken, scanQRCode);

// Verify QR code (mobile endpoint - requires authentication)
router.post("/verify", authenticateToken, verifyQRCode);

module.exports = router;

