require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db/connection");
const { User, AuthToken, Conversation, Message } = require("./mongodb-schemas");
// QRCode removed - QR functionality disabled

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Mock backend server is running" });
});

// Login endpoint - Token-based authentication only (QR code functionality disabled)
app.post("/api/login", async (req, res) => {
  try {
    const { token, userId } = req.body;

    // Validate token is not empty
    if (!token || typeof token !== "string" || token.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Token is required and cannot be empty",
      });
    }

    // Check if token is already associated with a user in AuthToken
    let existingAuthToken = await AuthToken.findOne({
      token: token.trim(),
      expiresAt: { $gt: new Date() },
    });

    let user;

    if (existingAuthToken) {
      // Token exists and is valid, get the associated user
      user = await User.findOne({ userId: existingAuthToken.userId });

      if (!user) {
        // User was deleted but token exists, create new user
        user = await User.create({
          userId: existingAuthToken.userId,
          displayName: `User ${existingAuthToken.userId}`,
          isOnline: true,
          lastSeen: new Date(),
        });
      } else {
        // Update user online status
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();
      }
    } else {
      // New token - create or get user
      const targetUserId = userId || `user_${Date.now()}`;
      user = await User.findOne({ userId: targetUserId });

      if (!user) {
        // Create new user
        user = await User.create({
          userId: targetUserId,
          displayName: `User ${targetUserId}`,
          isOnline: true,
          lastSeen: new Date(),
        });
      } else {
        // Update existing user online status
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();
      }

      // Create new auth token record
      await AuthToken.create({
        token: token.trim(),
        userId: user.userId,
        type: "jwt", // Changed from 'qr' to 'jwt' since QR is disabled
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        usedAt: new Date(),
      });
    }

    // Successful login
    res.status(200).json({
      success: true,
      userId: user.userId,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all conversations for a user
app.get("/api/conversations", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Find all conversations where user is a participant
    const conversations = await Conversation.find({
      "participants.userId": userId,
      "participants.isArchived": false,
    })
      .sort({ updatedAt: -1 })
      .lean();

    // Format response with user data
    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const userParticipant = conv.participants.find(
          (p) => p.userId === userId
        );
        const otherParticipants = conv.participants.filter(
          (p) => p.userId !== userId
        );

        // Get user data for other participants
        const participantsWithData = await Promise.all(
          conv.participants.map(async (p) => {
            const user = await User.findOne({ userId: p.userId }).lean();
            return {
              userId: p.userId,
              displayName:
                user?.displayName ||
                p.userId.replace("user_", "").replace(/_/g, " "),
              avatar: user?.avatar || null,
              lastReadMessageId: p.lastReadMessageId,
              isArchived: p.isArchived,
              isMuted: p.isMuted,
            };
          })
        );

        // Convert Map to number for unreadCount
        let unreadCount = 0;
        if (conv.unreadCount && conv.unreadCount instanceof Map) {
          unreadCount = conv.unreadCount.get(userId) || 0;
        } else if (
          typeof conv.unreadCount === "object" &&
          conv.unreadCount !== null
        ) {
          unreadCount = conv.unreadCount[userId] || 0;
        }

        return {
          conversationId: conv.conversationId,
          participants: participantsWithData,
          type: conv.type,
          name: conv.name,
          avatar: conv.avatar,
          lastMessage: conv.lastMessage
            ? {
                messageId: conv.lastMessage.messageId,
                text: conv.lastMessage.text,
                senderId: conv.lastMessage.senderId,
                timestamp: conv.lastMessage.timestamp,
              }
            : undefined,
          unreadCount: unreadCount,
          updatedAt: conv.updatedAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      conversations: formattedConversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
});

// Get specific conversation
app.get("/api/conversations/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({ conversationId }).lean();

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversation",
    });
  }
});

// Seed dummy data endpoint
app.post("/api/seed/dummy-data", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Dummy users
    const dummyUsers = [
      { userId: "user_john", displayName: "John Doe", avatar: null },
      { userId: "user_jane", displayName: "Jane Smith", avatar: null },
      { userId: "user_bob", displayName: "Bob Johnson", avatar: null },
      { userId: "user_alice", displayName: "Alice Williams", avatar: null },
      { userId: "user_charlie", displayName: "Charlie Brown", avatar: null },
      { userId: "user_diana", displayName: "Diana Prince", avatar: null },
      { userId: "user_emma", displayName: "Emma Watson", avatar: null },
      { userId: "user_frank", displayName: "Frank Miller", avatar: null },
      { userId: "user_grace", displayName: "Grace Kelly", avatar: null },
      { userId: "user_henry", displayName: "Henry Ford", avatar: null },
    ];

    // Create or update dummy users
    for (const userData of dummyUsers) {
      await User.findOneAndUpdate({ userId: userData.userId }, userData, {
        upsert: true,
        new: true,
      });
    }

    // Dummy conversations with messages
    const dummyConversations = [
      {
        conversationId: "conv_1",
        participants: [
          {
            userId: userId,
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
          {
            userId: "user_john",
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
        ],
        type: "direct",
        createdBy: userId,
        lastMessage: {
          messageId: "msg_1_1",
          text: "Hey, how are you doing today?",
          senderId: "user_john",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        unreadCount: new Map([[userId, 2]]),
      },
      {
        conversationId: "conv_2",
        participants: [
          {
            userId: userId,
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
          {
            userId: "user_jane",
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
        ],
        type: "direct",
        createdBy: userId,
        lastMessage: {
          messageId: "msg_2_1",
          text: "See you tomorrow at the meeting!",
          senderId: "user_jane",
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        },
        unreadCount: new Map(),
      },
      {
        conversationId: "conv_3",
        participants: [
          {
            userId: userId,
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
          {
            userId: "user_bob",
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
        ],
        type: "direct",
        createdBy: userId,
        lastMessage: {
          messageId: "msg_3_1",
          text: "Thanks for the help with the project",
          senderId: "user_bob",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        },
        unreadCount: new Map([[userId, 1]]),
      },
      {
        conversationId: "conv_4",
        participants: [
          {
            userId: userId,
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
          {
            userId: "user_alice",
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
        ],
        type: "direct",
        createdBy: userId,
        lastMessage: {
          messageId: "msg_4_1",
          text: "Are you free tonight for dinner?",
          senderId: "user_alice",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        },
        unreadCount: new Map(),
      },
      {
        conversationId: "conv_5",
        participants: [
          {
            userId: userId,
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
          {
            userId: "user_charlie",
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
        ],
        type: "direct",
        createdBy: userId,
        lastMessage: {
          messageId: "msg_5_1",
          text: "Great meeting today, let's follow up",
          senderId: "user_charlie",
          timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000), // Yesterday
        },
        unreadCount: new Map(),
      },
      {
        conversationId: "conv_6",
        participants: [
          {
            userId: userId,
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
          {
            userId: "user_diana",
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
        ],
        type: "direct",
        createdBy: userId,
        lastMessage: {
          messageId: "msg_6_1",
          text: "The files have been uploaded",
          senderId: "user_diana",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        unreadCount: new Map([[userId, 5]]),
      },
      {
        conversationId: "conv_7",
        participants: [
          {
            userId: userId,
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
          {
            userId: "user_emma",
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
        ],
        type: "direct",
        createdBy: userId,
        lastMessage: {
          messageId: "msg_7_1",
          text: "Can we reschedule?",
          senderId: "user_emma",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        unreadCount: new Map(),
      },
      {
        conversationId: "conv_8",
        participants: [
          {
            userId: userId,
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
          {
            userId: "user_frank",
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
        ],
        type: "direct",
        createdBy: userId,
        lastMessage: {
          messageId: "msg_8_1",
          text: "Looking forward to working together",
          senderId: "user_frank",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
        unreadCount: new Map(),
      },
      {
        conversationId: "conv_9",
        participants: [
          {
            userId: userId,
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
          {
            userId: "user_grace",
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
        ],
        type: "direct",
        createdBy: userId,
        lastMessage: {
          messageId: "msg_9_1",
          text: "The presentation is ready",
          senderId: "user_grace",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
        unreadCount: new Map([[userId, 3]]),
      },
      {
        conversationId: "conv_10",
        participants: [
          {
            userId: userId,
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
          {
            userId: "user_henry",
            joinedAt: new Date(),
            isArchived: false,
            isMuted: false,
          },
        ],
        type: "direct",
        createdBy: userId,
        lastMessage: {
          messageId: "msg_10_1",
          text: "Thanks for your help!",
          senderId: "user_henry",
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        },
        unreadCount: new Map(),
      },
    ];

    // Create conversations
    for (const convData of dummyConversations) {
      await Conversation.findOneAndUpdate(
        { conversationId: convData.conversationId },
        convData,
        { upsert: true, new: true }
      );

      // Create a sample message for each conversation
      await Message.findOneAndUpdate(
        { messageId: convData.lastMessage.messageId },
        {
          messageId: convData.lastMessage.messageId,
          conversationId: convData.conversationId,
          senderId: convData.lastMessage.senderId,
          text: convData.lastMessage.text,
          type: "text",
          status: "delivered",
          createdAt: convData.lastMessage.timestamp,
          updatedAt: convData.lastMessage.timestamp,
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: `Dummy data seeded successfully for user ${userId}`,
      conversationsCreated: dummyConversations.length,
      usersCreated: dummyUsers.length,
    });
  } catch (error) {
    console.error("Error seeding dummy data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed dummy data",
    });
  }
});

// QR Code generation endpoint - DISABLED
// QR code functionality has been disabled. Use token-based authentication instead.
/*
app.post("/api/qr/generate", async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Generate unique QR token
    const qrToken = `qr_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Create QR code document
    const qrCode = await QRCode.create({
      qrToken: qrToken,
      userId: userId || null,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      isUsed: false
    });

    res.status(200).json({
      success: true,
      qrToken: qrToken,
      expiresAt: qrCode.expiresAt,
      message: "QR code generated successfully"
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to generate QR code",
    });
  }
});
*/

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 Login endpoint: POST http://localhost:${PORT}/api/login`);
  console.log(
    `💬 Get conversations: GET http://localhost:${PORT}/api/conversations?userId=xxx`
  );
  console.log(
    `🌱 Seed dummy data: POST http://localhost:${PORT}/api/seed/dummy-data`
  );
  console.log(`💚 Health check: GET http://localhost:${PORT}/health`);
  console.log(`🗄️  MongoDB: Connected to chatapp_db`);
  console.log(
    `⚠️  QR Code functionality: DISABLED - Using token-based authentication only`
  );
});
