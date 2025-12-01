/**
 * Status Controller
 * Handles online status, typing indicators, and user presence
 */

const { User, TypingIndicator } = require("../models");
const constants = require("../config/constants");

/**
 * Update user online status
 */
const updateOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const userId = req.user.userId;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "NOT_FOUND",
      });
    }

    user.isOnline = isOnline !== undefined ? isOnline : true;
    user.lastSeen = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      user: {
        userId: user.userId,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      },
      message: "Online status updated successfully",
    });
  } catch (error) {
    console.error("Update online status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update online status",
      error: "SERVER_ERROR",
    });
  }
};

/**
 * Get user online status
 */
const getUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "NOT_FOUND",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        userId: user.userId,
        displayName: user.displayName,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        status: user.status,
      },
      message: "User status retrieved successfully",
    });
  } catch (error) {
    console.error("Get user status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user status",
      error: "SERVER_ERROR",
    });
  }
};

/**
 * Set typing indicator
 */
const setTypingIndicator = async (req, res) => {
  try {
    const { conversationId, isTyping } = req.body;
    const userId = req.user.userId;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
        error: "VALIDATION_ERROR",
      });
    }

    if (isTyping) {
      // Set typing indicator (expires in 3 seconds)
      await TypingIndicator.findOneAndUpdate(
        { conversationId, userId },
        {
          conversationId,
          userId,
          isTyping: true,
          expiresAt: new Date(Date.now() + 3000), // 3 seconds
        },
        { upsert: true, new: true }
      );
    } else {
      // Remove typing indicator
      await TypingIndicator.findOneAndDelete({ conversationId, userId });
    }

    res.status(200).json({
      success: true,
      message: isTyping ? "Typing indicator set" : "Typing indicator removed",
    });
  } catch (error) {
    console.error("Set typing indicator error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set typing indicator",
      error: "SERVER_ERROR",
    });
  }
};

/**
 * Get typing indicators for a conversation
 */
const getTypingIndicators = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.userId;

    // Get active typing indicators (not expired, not current user)
    const typingIndicators = await TypingIndicator.find({
      conversationId,
      userId: { $ne: currentUserId },
      isTyping: true,
      expiresAt: { $gt: new Date() },
    });

    // Get user info for typing users
    const typingUsers = await Promise.all(
      typingIndicators.map(async (indicator) => {
        const user = await User.findOne({ userId: indicator.userId });
        return {
          userId: user.userId,
          displayName: user.displayName,
        };
      })
    );

    res.status(200).json({
      success: true,
      typingUsers,
      message: "Typing indicators retrieved successfully",
    });
  } catch (error) {
    console.error("Get typing indicators error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get typing indicators",
      error: "SERVER_ERROR",
    });
  }
};

module.exports = {
  updateOnlineStatus,
  getUserStatus,
  setTypingIndicator,
  getTypingIndicators,
};

