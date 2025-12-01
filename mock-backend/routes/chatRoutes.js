/**
 * Chat Routes
 * Routes for conversations, messages, and chat functionality
 */

const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { validateRequired } = require("../middleware/validator");
const { asyncHandler } = require("../middleware/errorHandler");

// Conversation routes
const {
  getOrCreateConversation,
  getUserConversations,
  getConversationById,
} = require("../controllers/conversationController");

// Message routes
const {
  sendMessage,
  getMessages,
  updateMessageStatus,
  markConversationAsRead,
} = require("../controllers/messageController");

// Status routes
const {
  updateOnlineStatus,
  getUserStatus,
  setTypingIndicator,
  getTypingIndicators,
} = require("../controllers/statusController");

// All routes require authentication
router.use(authenticateToken);

// ============================================
// CONVERSATION ROUTES
// ============================================

// Get or create conversation with another user
router.post(
  "/conversations",
  validateRequired(["otherUserId"]),
  asyncHandler(getOrCreateConversation)
);

// Get all conversations for current user
router.get("/conversations", asyncHandler(getUserConversations));

// Get single conversation by ID
router.get("/conversations/:conversationId", asyncHandler(getConversationById));

// ============================================
// MESSAGE ROUTES
// ============================================

// Send a message
router.post(
  "/messages",
  validateRequired(["conversationId", "text"]),
  asyncHandler(sendMessage)
);

// Get messages for a conversation
router.get("/conversations/:conversationId/messages", asyncHandler(getMessages));

// Update message status (delivered, read)
router.put(
  "/messages/:messageId/status",
  validateRequired(["status"]),
  asyncHandler(updateMessageStatus)
);

// Mark conversation as read
router.post(
  "/conversations/:conversationId/read",
  asyncHandler(markConversationAsRead)
);

// ============================================
// STATUS ROUTES
// ============================================

// Update user online status
router.put("/status/online", asyncHandler(updateOnlineStatus));

// Get user status
router.get("/users/:userId/status", asyncHandler(getUserStatus));

// Set typing indicator
router.post(
  "/typing",
  validateRequired(["conversationId", "isTyping"]),
  asyncHandler(setTypingIndicator)
);

// Get typing indicators for a conversation
router.get(
  "/conversations/:conversationId/typing",
  asyncHandler(getTypingIndicators)
);

module.exports = router;

