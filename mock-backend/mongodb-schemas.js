const mongoose = require("mongoose");

// ============================================
// 1. USER SCHEMA
// ============================================
const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      sparse: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: "Hey there! I'm using ChatApp",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    settings: {
      notifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      language: {
        type: String,
        default: "en",
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: "users",
  }
);

// ============================================
// 2. CONVERSATION SCHEMA
// NOTE: This collection does not exist in the current database
// It may be created when first used, or stored differently
// ============================================
const conversationSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    participants: [
      {
        userId: {
          type: String,
          required: true,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        lastReadMessageId: {
          type: String,
          default: null,
        },
        isArchived: {
          type: Boolean,
          default: false,
        },
        isMuted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
      required: true,
    },
    name: {
      type: String,
      default: null, // Only for groups
    },
    avatar: {
      type: String,
      default: null,
    },
    createdBy: {
      type: String,
      required: true,
    },
    lastMessage: {
      messageId: String,
      text: String,
      senderId: String,
      timestamp: Date,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  {
    timestamps: true,
    collection: "conversations",
  }
);

// Index for finding user conversations
conversationSchema.index({ "participants.userId": 1, updatedAt: -1 });

// ============================================
// 3. MESSAGE SCHEMA
// ============================================
const messageSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    text: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "file", "location"],
      default: "text",
    },
    // media field removed - not present in current database
    status: {
      type: String,
      enum: ["sending", "sent", "delivered", "read"],
      default: "sent",
    },
    replyTo: {
      type: String,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    reactions: [
      {
        userId: String,
        emoji: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    collection: "messages",
  }
);

// Compound index for efficient message pagination
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, messageId: 1 });

// ============================================
// 4. AUTH TOKEN SCHEMA
// ============================================
const authTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["qr", "jwt", "refresh"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    // deviceInfo field removed - not present in current database
  },
  {
    timestamps: true,
    collection: "auth_tokens",
  }
);

// TTL index to auto-delete expired tokens
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ============================================
// 5. QR CODE SCHEMA
// ============================================
const qrCodeSchema = new mongoose.Schema(
  {
    qrToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    scannedBy: {
      type: String,
      default: null,
    },
    scannedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "qr_codes",
  }
);

// TTL index for expired QR codes
qrCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ============================================
// 6. TYPING INDICATOR SCHEMA
// NOTE: This collection does not exist in the current database
// ============================================
const typingIndicatorSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
    },
    isTyping: {
      type: Boolean,
      default: false,
    },
    lastTypingAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "typing_indicators",
  }
);

// Compound index
typingIndicatorSchema.index({ conversationId: 1, userId: 1 });
// TTL index - cleanup after 30 seconds of inactivity
typingIndicatorSchema.index({ lastTypingAt: 1 }, { expireAfterSeconds: 30 });

// ============================================
// EXPORT MODELS
// ============================================
const User = mongoose.model("User", userSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);
const Message = mongoose.model("Message", messageSchema);
const AuthToken = mongoose.model("AuthToken", authTokenSchema);
const QRCode = mongoose.model("QRCode", qrCodeSchema);
const TypingIndicator = mongoose.model(
  "TypingIndicator",
  typingIndicatorSchema
);

module.exports = {
  User,
  Conversation,
  Message,
  AuthToken,
  QRCode,
  TypingIndicator,
};
