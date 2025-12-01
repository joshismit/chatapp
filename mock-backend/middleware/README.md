# Middleware Documentation

This directory contains all Express middleware used in the application.

## 📁 Middleware Files

### 1. `auth.js` - Authentication Middleware

Handles token-based authentication.

**Exports:**
- `authenticateToken` - Required authentication middleware
- `optionalAuth` - Optional authentication middleware
- `extractToken` - Token extraction utility
- `validateTokenFormat` - Token format validation

**Usage:**
```javascript
const { authenticateToken, optionalAuth } = require("../middleware/auth");

// Required authentication
router.get("/protected", authenticateToken, handler);

// Optional authentication
router.get("/public", optionalAuth, handler);
```

**Features:**
- Extracts token from Authorization header, query params, or body
- Validates token format
- Checks token expiration
- Attaches user and token to request object
- Provides detailed error messages

---

### 2. `errorHandler.js` - Error Handling Middleware

Centralized error handling for the application.

**Exports:**
- `errorHandler` - Main error handling middleware
- `asyncHandler` - Wrapper for async route handlers
- `notFoundHandler` - 404 handler

**Usage:**
```javascript
const { errorHandler, asyncHandler, notFoundHandler } = require("../middleware/errorHandler");

// Wrap async handlers
router.get("/route", asyncHandler(async (req, res) => {
  // async code
}));

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);
```

**Error Types Handled:**
- Mongoose validation errors
- Duplicate key errors
- Cast errors (invalid IDs)
- Database connection errors
- JWT errors (if using JWT)
- Generic errors

---

### 3. `validator.js` - Request Validation Middleware

Validates and sanitizes request data.

**Exports:**
- `validateRequired` - Validates required fields
- `validatePhoneNumber` - Validates phone number format
- `validateOTP` - Validates OTP format (6 digits)
- `validateQRToken` - Validates QR token format
- `sanitizeBody` - Sanitizes request body strings

**Usage:**
```javascript
const {
  validateRequired,
  validatePhoneNumber,
  validateOTP,
  sanitizeBody,
} = require("../middleware/validator");

// Validate required fields
router.post("/endpoint",
  validateRequired(["phoneNumber", "otp"]),
  validatePhoneNumber,
  validateOTP,
  handler
);
```

**Features:**
- Validates required fields
- Validates data formats
- Sanitizes string inputs (XSS prevention)
- Normalizes phone numbers
- Provides detailed validation errors

---

### 4. `logger.js` - Request Logging Middleware

Logs incoming requests and responses.

**Exports:**
- `requestLogger` - Logs requests and responses
- `errorLogger` - Logs errors before error handler

**Usage:**
```javascript
const { requestLogger, errorLogger } = require("../middleware/logger");

// Request logging (development only)
if (process.env.NODE_ENV !== "production") {
  app.use(requestLogger);
}

// Error logging (before error handler)
app.use(errorLogger);
```

**Features:**
- Logs request method, URL, and timestamp
- Logs response status and duration
- Color-coded status indicators
- Error logging with stack traces (development)

---

## 🔄 Middleware Order

The middleware should be applied in this order:

1. **CORS** - Enable cross-origin requests
2. **Body Parsers** - Parse JSON and URL-encoded bodies
3. **Request Logger** - Log requests (development)
4. **Sanitize Body** - Sanitize input data
5. **Routes** - Application routes
6. **404 Handler** - Handle not found routes
7. **Error Logger** - Log errors
8. **Error Handler** - Handle all errors

## 🔒 Security Features

- **Token Validation**: Validates token format and expiration
- **Input Sanitization**: Removes potentially dangerous characters
- **Request Validation**: Validates required fields and formats
- **Error Handling**: Prevents information leakage in production

## 📝 Best Practices

1. Always use `asyncHandler` for async route handlers
2. Use `validateRequired` for required fields
3. Use specific validators (phone, OTP, etc.) when applicable
4. Apply `authenticateToken` to protected routes
5. Use `optionalAuth` for routes that work with or without auth
6. Keep error handler as the last middleware

