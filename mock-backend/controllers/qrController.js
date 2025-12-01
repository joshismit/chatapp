/**
 * QR Code Controller
 * Handles QR code generation, scanning, and verification for desktop login
 */

const { QRCode, AuthToken } = require("../models");
const constants = require("../config/constants");
const { generateQRToken, generateAuthToken } = require("../utils/helpers");

/**
 * Generate QR code for desktop login
 */
const generateQRCode = async (req, res) => {
  try {
    // Generate unique QR token
    const qrToken = generateQRToken();

    // Create QR code document (expires in 5 minutes)
    const qrCode = await QRCode.create({
      qrToken: qrToken,
      userId: null, // Will be set when scanned
      expiresAt: new Date(Date.now() + constants.QR_CODE_EXPIRATION),
      isUsed: false,
      status: constants.QR_STATUS.PENDING,
    });

    res.status(200).json({
      success: true,
      qrToken: qrToken,
      expiresAt: qrCode.expiresAt,
      message: "QR code generated successfully",
    });
  } catch (error) {
    console.error("QR generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate QR code",
    });
  }
};

/**
 * Check QR code status (polling endpoint for desktop)
 */
const checkQRStatus = async (req, res) => {
  try {
    const { qrToken } = req.params;

    const qrCode = await QRCode.findOne({ qrToken });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: "QR code not found",
      });
    }

    // Check if expired
    if (new Date() > qrCode.expiresAt) {
      qrCode.status = constants.QR_STATUS.EXPIRED;
      await qrCode.save();
      return res.status(200).json({
        success: false,
        status: constants.QR_STATUS.EXPIRED,
        message: "QR code has expired",
      });
    }

    // Check if scanned
    if (
      qrCode.status === constants.QR_STATUS.SCANNED &&
      qrCode.scannedBy
    ) {
      return res.status(200).json({
        success: true,
        status: constants.QR_STATUS.SCANNED,
        scannedBy: qrCode.scannedBy,
        message: "QR code has been scanned",
      });
    }

    // Check if verified
    if (
      qrCode.status === constants.QR_STATUS.VERIFIED &&
      qrCode.userId
    ) {
      // Check if already used to prevent race conditions
      if (qrCode.isUsed) {
        return res.status(400).json({
          success: false,
          status: "used",
          message: "QR code has already been used",
        });
      }

      // Generate auth token for the user
      const authToken = generateAuthToken();

      await AuthToken.create({
        token: authToken,
        userId: qrCode.userId,
        type: constants.TOKEN_TYPES.QR,
        expiresAt: new Date(Date.now() + constants.TOKEN_EXPIRATION),
        usedAt: new Date(),
      });

      // Mark QR as used (atomic operation)
      qrCode.isUsed = true;
      await qrCode.save();

      return res.status(200).json({
        success: true,
        status: constants.QR_STATUS.VERIFIED,
        userId: qrCode.userId,
        token: authToken,
        message: "QR code verified successfully",
      });
    }

    // Still pending
    return res.status(200).json({
      success: true,
      status: constants.QR_STATUS.PENDING,
      message: "QR code is waiting to be scanned",
    });
  } catch (error) {
    console.error("QR status check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check QR code status",
    });
  }
};

/**
 * Scan QR code (mobile endpoint - user scans QR and confirms login)
 */
const scanQRCode = async (req, res) => {
  try {
    const { qrToken } = req.body;
    const userId = req.user.userId; // From authenticated user (mobile)

    if (!qrToken) {
      return res.status(400).json({
        success: false,
        message: "QR token is required",
      });
    }

    const qrCode = await QRCode.findOne({ qrToken });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: "QR code not found",
      });
    }

    // Check if expired
    if (new Date() > qrCode.expiresAt) {
      qrCode.status = constants.QR_STATUS.EXPIRED;
      await qrCode.save();
      return res.status(400).json({
        success: false,
        message: "QR code has expired",
      });
    }

    // Check if already used
    if (qrCode.isUsed) {
      return res.status(400).json({
        success: false,
        message: "QR code has already been used",
      });
    }

    // Update QR code with user info
    qrCode.userId = userId;
    qrCode.scannedBy = userId;
    qrCode.scannedAt = new Date();
    qrCode.status = constants.QR_STATUS.SCANNED;
    await qrCode.save();

    res.status(200).json({
      success: true,
      message: "QR code scanned successfully. Waiting for verification.",
    });
  } catch (error) {
    console.error("QR scan error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to scan QR code",
    });
  }
};

/**
 * Verify QR code (mobile endpoint - user confirms login after scanning)
 */
const verifyQRCode = async (req, res) => {
  try {
    const { qrToken } = req.body;
    const userId = req.user.userId; // From authenticated user (mobile)

    if (!qrToken) {
      return res.status(400).json({
        success: false,
        message: "QR token is required",
      });
    }

    const qrCode = await QRCode.findOne({ qrToken });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: "QR code not found",
      });
    }

    // Verify it's the same user who scanned
    if (qrCode.scannedBy !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: This QR code was scanned by a different user",
      });
    }

    // Check if expired
    if (new Date() > qrCode.expiresAt) {
      qrCode.status = constants.QR_STATUS.EXPIRED;
      await qrCode.save();
      return res.status(400).json({
        success: false,
        message: "QR code has expired",
      });
    }

    // Mark as verified
    qrCode.status = constants.QR_STATUS.VERIFIED;
    await qrCode.save();

    res.status(200).json({
      success: true,
      message: "QR code verified successfully. Desktop will receive the token.",
    });
  } catch (error) {
    console.error("QR verify error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify QR code",
    });
  }
};

module.exports = {
  generateQRCode,
  checkQRStatus,
  scanQRCode,
  verifyQRCode,
};

