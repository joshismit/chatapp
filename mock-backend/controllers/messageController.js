/**
 * Message Controller
 * Handles sending and receiving messages
 */

const { Message, Conversation, User } = require("../models");
const { generateMessageId } = require("../utils/helpers");
const constants = require("../config/constants");
const sseService = require("../services/sseService");

/**
 * Send a message
 */
const sendMessage = async (req, res) => {
  try {
    const { conversationId, text, type = "text", replyTo } = req.body;
    const senderId = req.user.userId;

    if (!conversationId || !text) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID and text are required",
        error: "VALIDATION_ERROR",
      });
    }

    // Validate conversation exists and user is participant
    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
        error: "NOT_FOUND",
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId === senderId
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
        error: "FORBIDDEN",
      });
    }

    // Generate message ID
    const messageId = generateMessageId();

    // Create message
    const message = await Message.create({
      messageId,
      conversationId,
      senderId,
      text: text.trim(),
      type,
      status: constants.MESSAGE_STATUS.SENT,
      replyTo: replyTo || null,
      deletedAt: null,
      reactions: [],
    });

    // Update conversation last message
    conversation.lastMessage = {
      messageId: message.messageId,
      text: message.text,
      senderId: message.senderId,
      timestamp: message.createdAt,
      status: message.status,
    };

    // Increment unread count for other participants
    conversation.participants.forEach((participant) => {
      if (participant.userId !== senderId) {
        const currentCount = conversation.unreadCount.get(participant.userId) || 0;
        conversation.unreadCount.set(participant.userId, currentCount + 1);
      }
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    // Get sender info
    const sender = await User.findOne({ userId: senderId });

    const messageResponse = {
      messageId: message.messageId,
      conversationId: message.conversationId,
      senderId: message.senderId,
      sender: {
        userId: sender.userId,
        displayName: sender.displayName,
        avatar: sender.avatar,
      },
      text: message.text,
      type: message.type,
      status: message.status,
      replyTo: message.replyTo,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };

    // Broadcast message via SSE to all participants (except sender)
    sseService.broadcastMessage(conversationId, {
      ...messageResponse,
      sender: messageResponse.sender,
    }, senderId);

    res.status(201).json({
      success: true,
      message: messageResponse,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: "SERVER_ERROR",
    });
  }
};

/**
 * Get messages for a conversation
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.userId;
    const { limit = 50, offset = 0, before } = req.query;

    // Validate conversation exists and user is participant
    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
        error: "NOT_FOUND",
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId === currentUserId
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
        error: "FORBIDDEN",
      });
    }

    // Build query
    const query = {
      conversationId,
      deletedAt: null,
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Get messages
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    // Reverse to get chronological order
    messages.reverse();

    // Enrich messages with sender info
    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => {
        const sender = await User.findOne({ userId: msg.senderId });
        return {
          messageId: msg.messageId,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          sender: {
            userId: sender.userId,
            displayName: sender.displayName,
            avatar: sender.avatar,
          },
          text: msg.text,
          type: msg.type,
          status: msg.status,
          replyTo: msg.replyTo,
          reactions: msg.reactions,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
        };
      })
    );

    // Mark messages as delivered for current user (if they're not the sender)
    const messagesToMark = messages.filter((msg) => msg.senderId !== currentUserId);
    if (messagesToMark.length > 0) {
      await Message.updateMany(
        {
          messageId: { $in: messagesToMark.map((m) => m.messageId) },
          status: { $in: [constants.MESSAGE_STATUS.SENT, constants.MESSAGE_STATUS.SENDING] },
        },
        { status: constants.MESSAGE_STATUS.DELIVERED }
      );
    }

    // Reset unread count for this conversation
    conversation.unreadCount.set(currentUserId, 0);
    await conversation.save();

    res.status(200).json({
      success: true,
      messages: enrichedMessages,
      total: enrichedMessages.length,
      hasMore: messages.length === parseInt(limit),
      message: "Messages retrieved successfully",
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get messages",
      error: "SERVER_ERROR",
    });
  }
};

/**
 * Update message status (delivered, read)
 */
const updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    const currentUserId = req.user.userId;

    if (!status || !["delivered", "read"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status (delivered or read) is required",
        error: "VALIDATION_ERROR",
      });
    }

    const message = await Message.findOne({ messageId });
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
        error: "NOT_FOUND",
      });
    }

    // Only recipient can update status
    if (message.senderId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Cannot update status of your own message",
        error: "INVALID_REQUEST",
      });
    }

    // Validate conversation participant
    const conversation = await Conversation.findOne({
      conversationId: message.conversationId,
    });
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

    // Update status
    const validStatuses = [constants.MESSAGE_STATUS.DELIVERED, constants.MESSAGE_STATUS.READ];
    if (status === "read" && message.status !== constants.MESSAGE_STATUS.READ) {
      message.status = constants.MESSAGE_STATUS.READ;
      await message.save();

      // Update conversation last read
      const participant = conversation.participants.find(
        (p) => p.userId === currentUserId
      );
      if (participant) {
        participant.lastReadMessageId = messageId;
        participant.lastReadAt = new Date();
        await conversation.save();
      }

      // Broadcast status update via SSE
      sseService.broadcastStatusUpdate(
        message.conversationId,
        messageId,
        constants.MESSAGE_STATUS.READ,
        currentUserId
      );
    } else if (status === "delivered" && message.status === constants.MESSAGE_STATUS.SENT) {
      message.status = constants.MESSAGE_STATUS.DELIVERED;
      await message.save();

      // Broadcast status update via SSE
      sseService.broadcastStatusUpdate(
        message.conversationId,
        messageId,
        constants.MESSAGE_STATUS.DELIVERED,
        currentUserId
      );
    }

    res.status(200).json({
      success: true,
      message: {
        messageId: message.messageId,
        status: message.status,
      },
      message: "Message status updated successfully",
    });
  } catch (error) {
    console.error("Update message status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update message status",
      error: "SERVER_ERROR",
    });
  }
};

/**
 * Mark conversation messages as read
 */
const markConversationAsRead = async (req, res) => {
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

    // Mark all unread messages as read
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: currentUserId },
        status: { $ne: constants.MESSAGE_STATUS.READ },
      },
      { status: constants.MESSAGE_STATUS.READ }
    );

    // Update last read
    const participant = conversation.participants.find(
      (p) => p.userId === currentUserId
    );
    if (participant && conversation.lastMessage) {
      participant.lastReadMessageId = conversation.lastMessage.messageId;
      participant.lastReadAt = new Date();
    }

    // Reset unread count
    conversation.unreadCount.set(currentUserId, 0);
    await conversation.save();

    res.status(200).json({
      success: true,
      message: "Conversation marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark conversation as read",
      error: "SERVER_ERROR",
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  updateMessageStatus,
  markConversationAsRead,
};

