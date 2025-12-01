/**
 * Request Validation Middleware
 * Validates request body, params, and query
 */

/**
 * Validate required fields in request body
 */
const validateRequired = (fields) => {
  return (req, res, next) => {
    const missingFields = [];

    for (const field of fields) {
      if (
        req.body[field] === undefined ||
        req.body[field] === null ||
        (typeof req.body[field] === "string" && req.body[field].trim() === "")
      ) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        error: "VALIDATION_ERROR",
        missingFields,
      });
    }

    next();
  };
};

/**
 * Validate phone number format
 */
const validatePhoneNumber = (req, res, next) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return next(); // Let required validator handle this
  }

  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const normalizedPhone = phoneNumber.replace(/\s/g, "");

  if (!phoneRegex.test(normalizedPhone)) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone number format",
      error: "INVALID_PHONE_NUMBER",
    });
  }

  // Normalize phone number in request body
  req.body.phoneNumber = normalizedPhone;
  next();
};

/**
 * Validate email format
 */
const validateEmailFormat = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(); // Let required validator handle this
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedEmail = email.toLowerCase().trim();

  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
      error: "INVALID_EMAIL",
    });
  }

  // Normalize email in request body
  req.body.email = normalizedEmail;
  next();
};

/**
 * Validate OTP format (6 digits)
 */
const validateOTP = (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return next(); // Let required validator handle this
  }

  const otpRegex = /^\d{6}$/;
  if (!otpRegex.test(otp)) {
    return res.status(400).json({
      success: false,
      message: "OTP must be 6 digits",
      error: "INVALID_OTP_FORMAT",
    });
  }

  next();
};

/**
 * Validate QR token format
 */
const validateQRToken = (req, res, next) => {
  const qrToken = req.params.qrToken || req.body.qrToken;

  if (!qrToken) {
    return next(); // Let required validator handle this
  }

  if (!qrToken.startsWith("qr_") || qrToken.length < 20) {
    return res.status(400).json({
      success: false,
      message: "Invalid QR token format",
      error: "INVALID_QR_TOKEN",
    });
  }

  next();
};

/**
 * Sanitize string inputs (basic XSS prevention)
 */
const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return str
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

/**
 * Sanitize request body strings
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }
  next();
};

module.exports = {
  validateRequired,
  validatePhoneNumber,
  validateEmailFormat,
  validateOTP,
  validateQRToken,
  sanitizeBody,
};

