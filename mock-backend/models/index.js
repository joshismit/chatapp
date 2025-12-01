/**
 * MongoDB Models
 * All database schemas and models
 */

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
      index: true,
    },
    email: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    isRegistered: {
      type: Boolean,
      default: false,
      index: true,
    },
    registrationMethod: {
      type: String,
      enum: ["phone", "email", "qr"],
      default: null,
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
    timestamps: true,
    collection: "users",
  }
);

// ============================================
// 2. MESSAGE SCHEMA
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
// 3. AUTH TOKEN SCHEMA
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
  },
  {
    timestamps: true,
    collection: "auth_tokens",
  }
);

// TTL index to auto-delete expired tokens
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ============================================
// 4. QR CODE SCHEMA
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
    status: {
      type: String,
      enum: ["pending", "scanned", "verified", "expired"],
      default: "pending",
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
// 5. OTP SCHEMA (For Registration and Login)
// ============================================
const otpSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      sparse: true,
      index: true,
    },
    email: {
      type: String,
      sparse: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["registration", "login"],
      default: "login",
      index: true,
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
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "otps",
  }
);

// TTL index for expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Compound indexes for phone/email and unused OTPs
otpSchema.index({ phoneNumber: 1, isUsed: 1, expiresAt: 1 });
otpSchema.index({ email: 1, isUsed: 1, expiresAt: 1 });
// Ensure either phoneNumber or email is provided
otpSchema.pre("validate", function (next) {
  if (!this.phoneNumber && !this.email) {
    return next(new Error("Either phoneNumber or email must be provided"));
  }
  if (this.phoneNumber && this.email) {
    return next(new Error("Cannot provide both phoneNumber and email"));
  }
  next();
});

// ============================================
// 6. CONVERSATION SCHEMA (Chat Sessions)
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
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        isArchived: {
          type: Boolean,
          default: false,
        },
        isMuted: {
          type: Boolean,
          default: false,
        },
        lastReadMessageId: {
          type: String,
          default: null,
        },
        lastReadAt: {
          type: Date,
          default: null,
        },
      },
    ],
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
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
      status: String,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "conversations",
  }
);

// Indexes for efficient queries
conversationSchema.index({ "participants.userId": 1, updatedAt: -1 });
conversationSchema.index({ conversationId: 1 });

// ============================================
// 7. TYPING INDICATOR SCHEMA
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
      index: true,
    },
    isTyping: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "typing_indicators",
  }
);

// TTL index for auto-cleanup
typingIndicatorSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Compound index
typingIndicatorSchema.index({ conversationId: 1, userId: 1 });

// ============================================
// EXPORT MODELS
// ============================================
const User = mongoose.model("User", userSchema);
const Message = mongoose.model("Message", messageSchema);
const AuthToken = mongoose.model("AuthToken", authTokenSchema);
const QRCode = mongoose.model("QRCode", qrCodeSchema);
const OTP = mongoose.model("OTP", otpSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);
const TypingIndicator = mongoose.model("TypingIndicator", typingIndicatorSchema);

module.exports = {
  User,
  Message,
  AuthToken,
  QRCode,
  OTP,
  Conversation,
  TypingIndicator,
};

