/**
 * Request Logging Middleware
 * Logs incoming requests for debugging and monitoring
 */

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const statusColor =
      res.statusCode >= 500
        ? "🔴"
        : res.statusCode >= 400
        ? "🟡"
        : res.statusCode >= 300
        ? "🔵"
        : "🟢";

    console.log(
      `${statusColor} [${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

/**
 * Error logger (for use before error handler)
 */
const errorLogger = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
  next(err);
};

module.exports = {
  requestLogger,
  errorLogger,
};

