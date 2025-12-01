/**
 * Utility Helper Functions
 */

const crypto = require("crypto");
const constants = require("../config/constants");

/**
 * Generate a random token
 * @param {number} length - Length of random bytes
 * @returns {string} Generated token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Generate QR token
 * @returns {string} QR token
 */
const generateQRToken = () => {
  return `qr_${Date.now()}_${generateToken(16)}`;
};

/**
 * Generate auth token
 * @returns {string} Auth token
 */
const generateAuthToken = () => {
  return `auth_${Date.now()}_${generateToken(32)}`;
};

/**
 * Generate test token
 * @returns {string} Test token
 */
const generateTestToken = () => {
  return `test_token_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 15)}`;
};

/**
 * Generate 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Normalize phone number (remove spaces)
 * @param {string} phoneNumber - Phone number to normalize
 * @returns {string} Normalized phone number
 */
const normalizePhoneNumber = (phoneNumber) => {
  return phoneNumber.replace(/\s/g, "");
};

/**
 * Validate phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if valid
 */
const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(normalizePhoneNumber(phoneNumber));
};

/**
 * Generate user ID
 * @param {string} phoneNumber - Optional phone number
 * @returns {string} User ID
 */
const generateUserId = (phoneNumber = null) => {
  if (phoneNumber) {
    return `user_${Date.now()}_${generateToken(8)}`;
  }
  return `user_${Date.now()}`;
};

module.exports = {
  generateToken,
  generateQRToken,
  generateAuthToken,
  generateTestToken,
  generateOTP,
  normalizePhoneNumber,
  validatePhoneNumber,
  generateUserId,
};

