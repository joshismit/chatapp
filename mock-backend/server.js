/**
 * Main Server File
 * Express application entry point
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", routes);

// Health check at root level
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Mock backend server is running" });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`\n📱 Mobile Login (OTP):`);
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
  console.log(
    `   Seed dummy data: POST http://localhost:${PORT}/api/seed/dummy-data`
  );
  console.log(`   Health check: GET http://localhost:${PORT}/health`);
  console.log(`\n🗄️  MongoDB: Connected to chatapp_db`);
});

module.exports = app;
