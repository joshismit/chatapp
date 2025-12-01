/**
 * Main Server File
 * Express application entry point
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { requestLogger, errorLogger } = require("./middleware/logger");
const { sanitizeBody } = require("./middleware/validator");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging (in development)
if (process.env.NODE_ENV !== "production") {
  app.use(requestLogger);
}

// Sanitize request body
app.use(sanitizeBody);

// Health check at root level
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Mock backend server is running" });
});

// Routes
app.use("/api", routes);

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Error logging middleware
app.use(errorLogger);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`\n📝 Registration:`);
  console.log(
    `   Check availability: GET http://localhost:${PORT}/api/register/check-availability`
  );
  console.log(
    `   Generate OTP: POST http://localhost:${PORT}/api/register/generate-otp`
  );
  console.log(
    `   Verify OTP: POST http://localhost:${PORT}/api/register/verify-otp`
  );
  console.log(`\n📱 Login (OTP - Phone/Email):`);
  console.log(
    `   Generate OTP: POST http://localhost:${PORT}/api/otp/generate`
  );
  console.log(`   Verify OTP: POST http://localhost:${PORT}/api/otp/verify`);
  console.log(`\n🖥️  Desktop Login (QR Code):`);
  console.log(`   Generate QR: POST http://localhost:${PORT}/api/qr/generate`);
  console.log(
    `   Check Status: GET http://localhost:${PORT}/api/qr/status/:qrToken`
  );
  console.log(`   Scan QR: POST http://localhost:${PORT}/api/qr/scan`);
  console.log(`   Verify QR: POST http://localhost:${PORT}/api/qr/verify`);
  console.log(`\n🔐 Other Endpoints:`);
  console.log(`   Login: POST http://localhost:${PORT}/api/login`);
  console.log(
    `   Generate token: POST http://localhost:${PORT}/api/auth/generate-token`
  );
  console.log(`   Verify token: GET http://localhost:${PORT}/api/auth/verify`);
  console.log(`   Logout: POST http://localhost:${PORT}/api/auth/logout`);
  console.log(`\n💬 Chat Endpoints:`);
  console.log(`   Get/Create conversation: POST http://localhost:${PORT}/api/chat/conversations`);
  console.log(`   Get all conversations: GET http://localhost:${PORT}/api/chat/conversations`);
  console.log(`   Get conversation: GET http://localhost:${PORT}/api/chat/conversations/:id`);
  console.log(`   Send message: POST http://localhost:${PORT}/api/chat/messages`);
  console.log(`   Get messages: GET http://localhost:${PORT}/api/chat/conversations/:id/messages`);
  console.log(`   Update message status: PUT http://localhost:${PORT}/api/chat/messages/:id/status`);
  console.log(`   Mark as read: POST http://localhost:${PORT}/api/chat/conversations/:id/read`);
  console.log(`   Update online status: PUT http://localhost:${PORT}/api/chat/status/online`);
  console.log(`   Get user status: GET http://localhost:${PORT}/api/chat/users/:id/status`);
  console.log(`   Set typing: POST http://localhost:${PORT}/api/chat/typing`);
  console.log(`   Get typing: GET http://localhost:${PORT}/api/chat/conversations/:id/typing`);
  console.log(`\n📡 SSE Endpoints:`);
  console.log(`   SSE connection: GET http://localhost:${PORT}/api/sse?conversationId=xxx&token=xxx`);
  console.log(`\n🛠️  Utility Endpoints:`);
  console.log(
    `   Seed dummy data: POST http://localhost:${PORT}/api/seed/dummy-data`
  );
  console.log(`   Health check: GET http://localhost:${PORT}/health`);
  console.log(`\n🗄️  MongoDB: Connected to chatapp_db`);
});

module.exports = app;
