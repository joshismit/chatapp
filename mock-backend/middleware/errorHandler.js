/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error("Error Details:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Default error response
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal server error";
  let errorCode = err.errorCode || "INTERNAL_ERROR";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    errorCode = "VALIDATION_ERROR";
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    message = `${field} already exists`;
    errorCode = "DUPLICATE_ENTRY";
  }

  // Mongoose cast error (invalid ObjectId or similar)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path || "resource"} ID`;
    errorCode = "INVALID_ID";
  }

  // Mongoose connection error
  if (err.name === "MongoServerError" || err.name === "MongooseError") {
    statusCode = 503;
    message = "Database connection error";
    errorCode = "DATABASE_ERROR";
  }

  // JWT errors (if using JWT in future)
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    errorCode = "INVALID_TOKEN";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    errorCode = "TOKEN_EXPIRED";
  }

  // Response object
  const errorResponse = {
    success: false,
    message,
    error: errorCode,
  };

  // Include stack trace in development mode
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      name: err.name,
      code: err.code,
    };
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: "NOT_FOUND",
  });
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
};
