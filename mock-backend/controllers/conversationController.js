/**
 * Conversation Controller
 * Handles chat sessions/conversations
 */

const { Conversation, User, Message } = require("../models");
const { generateConversationId } = require("../utils/helpers");

/**
 * Get or create conversation between two users
 */
const getOrCreateConversation = async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const currentUserId = req.user.userId;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: "Other user ID is required",
        error: "VALIDATION_ERROR",
      });
    }

    if (otherUserId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Cannot create conversation with yourself",
        error: "INVALID_REQUEST",
      });
    }

    // Check if other user exists
    const otherUser = await User.findOne({ userId: otherUserId, isRegistered: true });
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "USER_NOT_FOUND",
      });
    }

    // Generate conversation ID (consistent for same two users)
    const conversationId = generateConversationId(currentUserId, otherUserId);

    // Find existing conversation
    let conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        conversationId,
        participants: [
          {
            userId: currentUserId,
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
          {
            userId: otherUserId,
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
        ],
        type: "direct",
        createdBy: currentUserId,
        lastMessage: null,
        unreadCount: new Map(),
        isActive: true,
      });
    }

    // Get participant info
    const participants = await Promise.all(
      conversation.participants.map(async (participant) => {
        const user = await User.findOne({ userId: participant.userId });
        return {
          userId: user.userId,
          displayName: user.displayName,
          avatar: user.avatar,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen,
          isArchived: participant.isArchived,
          isMuted: participant.isMuted,
        };
      })
    );

    res.status(200).json({
      success: true,
      conversation: {
        conversationId: conversation.conversationId,
        type: conversation.type,
        participants,
        lastMessage: conversation.lastMessage,
        unreadCount: conversation.unreadCount.get(currentUserId) || 0,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
      message: "Conversation retrieved successfully",
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get conversation",
      error: "SERVER_ERROR",
    });
  }
};

/**
 * Get all conversations for current user
 */
const getUserConversations = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    // Find all conversations where user is a participant
    const conversations = await Conversation.find({
      "participants.userId": currentUserId,
      isActive: true,
    })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    // Enrich conversations with participant info
    const enrichedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        // Get other participant (not current user)
        const otherParticipant = conversation.participants.find(
          (p) => p.userId !== currentUserId
        );
        const otherUser = otherParticipant
          ? await User.findOne({ userId: otherParticipant.userId })
          : null;

        return {
          conversationId: conversation.conversationId,
          type: conversation.type,
          otherUser: otherUser
            ? {
                userId: otherUser.userId,
                displayName: otherUser.displayName,
                avatar: otherUser.avatar,
                isOnline: otherUser.isOnline,
                lastSeen: otherUser.lastSeen,
              }
            : null,
          lastMessage: conversation.lastMessage,
          unreadCount: conversation.unreadCount.get(currentUserId) || 0,
          isArchived: otherParticipant?.isArchived || false,
          isMuted: otherParticipant?.isMuted || false,
          updatedAt: conversation.updatedAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      conversations: enrichedConversations,
      total: enrichedConversations.length,
      message: "Conversations retrieved successfully",
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get conversations",
      error: "SERVER_ERROR",
    });
  }
};

/**
 * Get single conversation by ID
 */
const getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.userId;

    const conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
        error: "NOT_FOUND",
      });
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.userId === currentUserId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
        error: "FORBIDDEN",
      });
    }

    // Get participant info
    const participants = await Promise.all(
      conversation.participants.map(async (participant) => {
        const user = await User.findOne({ userId: participant.userId });
        return {
          userId: user.userId,
          displayName: user.displayName,
          avatar: user.avatar,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen,
          isArchived: participant.isArchived,
          isMuted: participant.isMuted,
        };
      })
    );

    res.status(200).json({
      success: true,
      conversation: {
        conversationId: conversation.conversationId,
        type: conversation.type,
        participants,
        lastMessage: conversation.lastMessage,
        unreadCount: conversation.unreadCount.get(currentUserId) || 0,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
      message: "Conversation retrieved successfully",
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get conversation",
      error: "SERVER_ERROR",
    });
  }
};

module.exports = {
  getOrCreateConversation,
  getUserConversations,
  getConversationById,
};

