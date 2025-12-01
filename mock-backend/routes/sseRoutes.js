/**
 * SSE Routes
 * Routes for Server-Sent Events
 */

const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const { connectSSE } = require("../controllers/sseController");

// SSE connection endpoint
// GET /api/sse?conversationId=xxx&token=xxx
router.get("/", authenticateToken, asyncHandler(connectSSE));

module.exports = router;
