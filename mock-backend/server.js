const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Mock backend server is running" });
});

// Login endpoint
app.post("/api/login", (req, res) => {
  const { token } = req.body;

  // Validate token is not empty
  if (!token || typeof token !== "string" || token.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Token is required and cannot be empty",
    });
  }

  // Mock successful login
  res.status(200).json({
    success: true,
    userId: "12345",
    message: "Logged in via QR",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock backend server running on http://localhost:${PORT}`);
  console.log(`📡 Login endpoint: POST http://localhost:${PORT}/api/login`);
  console.log(`💚 Health check: GET http://localhost:${PORT}/health`);
});
