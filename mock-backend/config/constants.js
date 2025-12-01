/**
 * Application Constants
 */

module.exports = {
  // Token expiration times (in milliseconds)
  TOKEN_EXPIRATION: 7 * 24 * 60 * 60 * 1000, // 7 days
  QR_CODE_EXPIRATION: 5 * 60 * 1000, // 5 minutes
  OTP_EXPIRATION: 5 * 60 * 1000, // 5 minutes

  // OTP settings
  OTP_LENGTH: 6,
  OTP_MAX_ATTEMPTS: 3,

  // QR Code statuses
  QR_STATUS: {
    PENDING: "pending",
    SCANNED: "scanned",
    VERIFIED: "verified",
    EXPIRED: "expired",
  },

  // Auth token types
  TOKEN_TYPES: {
    QR: "qr",
    JWT: "jwt",
    REFRESH: "refresh",
  },

  // Message types
  MESSAGE_TYPES: {
    TEXT: "text",
    IMAGE: "image",
    VIDEO: "video",
    AUDIO: "audio",
    FILE: "file",
    LOCATION: "location",
  },

  // Message statuses
  MESSAGE_STATUS: {
    SENDING: "sending",
    SENT: "sent",
    DELIVERED: "delivered",
    READ: "read",
  },
};

