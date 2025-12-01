/**
 * SSE Controller
 * Handles Server-Sent Events connections for real-time updates
 */

const sseService = require("../services/sseService");
const { Conversation } = require("../models");

/**
 * Establish SSE connection for a conversation
 */
const connectSSE = async (req, res) => {
  try {
    const { conversationId } = req.query;
    const userId = req.user.userId;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
        error: "VALIDATION_ERROR",
      });
    }

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
        error: "NOT_FOUND",
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
        error: "FORBIDDEN",
      });
    }

    // Add client to SSE service
    const client = sseService.addClient(conversationId, userId, res);

    // Send heartbeat every 30 seconds to keep connection alive
    const heartbeatInterval = setInterval(() => {
      try {
        if (client && client.res && !res.destroyed) {
          sseService.sendHeartbeat(client);
        } else {
          clearInterval(heartbeatInterval);
        }
      } catch (error) {
        clearInterval(heartbeatInterval);
      }
    }, 30000);

    // Clean up on client disconnect
    res.on('close', () => {
      clearInterval(heartbeatInterval);
      sseService.removeClient(conversationId, userId, client);
      console.log(`SSE connection closed for user ${userId} in conversation ${conversationId}`);
    });

    res.on('error', (error) => {
      clearInterval(heartbeatInterval);
      sseService.removeClient(conversationId, userId, client);
      console.error(`SSE connection error for user ${userId}:`, error);
    });

    console.log(`SSE connection established for user ${userId} in conversation ${conversationId}`);
  } catch (error) {
    console.error("SSE connection error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Failed to establish SSE connection",
        error: "SERVER_ERROR",
      });
    }
  }
};

module.exports = {
  connectSSE,
};

