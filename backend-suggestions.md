# Backend Development Suggestions for Chat App

## Architecture Recommendations

### 1. **Technology Stack**
- **Runtime**: Node.js with Express.js or Fastify
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **Real-time**: WebSockets (Socket.io) or Server-Sent Events (SSE)
- **File Storage**: AWS S3 / Cloudinary (for images/media)
- **Caching**: Redis (for online status, rate limiting)

### 2. **API Structure**
```
/api/auth/login          - QR login endpoint
/api/auth/refresh        - Refresh token
/api/conversations       - Get user conversations
/api/conversations/:id   - Get specific conversation
/api/messages            - Send message
/api/messages/:id        - Get messages for conversation
/api/sse                 - SSE endpoint for real-time updates
/api/users/:id           - Get user profile
/api/users/:id/status    - Update online status
```

## MongoDB Database Schema

### Database Name
```
chatapp_db
```

### Collections & Schemas

---

## 1. **users** Collection

**Purpose**: Store user account information

```javascript
{
  _id: ObjectId,
  userId: String,           // Unique user identifier (e.g., "user_12345")
  phoneNumber: String,      // Optional: for WhatsApp-like functionality
  displayName: String,      // User's display name
  avatar: String,          // URL to profile picture
  status: String,          // "Hey there! I'm using ChatApp"
  isOnline: Boolean,       // Current online status
  lastSeen: Date,          // Last seen timestamp
  createdAt: Date,
  updatedAt: Date,
  settings: {
    notifications: Boolean,
    theme: String,          // "light" | "dark"
    language: String
  }
}
```

**Indexes**:
- `userId` (unique)
- `phoneNumber` (unique, sparse)

---

## 2. **conversations** Collection

**Purpose**: Store chat conversations between users

```javascript
{
  _id: ObjectId,
  conversationId: String,  // Unique conversation ID (e.g., "conv_12345")
  participants: [{
    userId: String,         // Reference to users.userId
    joinedAt: Date,
    lastReadMessageId: String,  // Last message user read
    isArchived: Boolean,
    isMuted: Boolean
  }],
  type: String,            // "direct" | "group"
  name: String,            // Group name (if type is "group")
  avatar: String,          // Group avatar URL
  createdBy: String,       // userId of creator
  createdAt: Date,
  updatedAt: Date,
  lastMessage: {
    messageId: String,     // Reference to messages._id
    text: String,          // Preview of last message
    senderId: String,
    timestamp: Date
  },
  unreadCount: {
    userId: Number         // Map of userId -> unread count
  }
}
```

**Indexes**:
- `conversationId` (unique)
- `participants.userId`
- `updatedAt` (for sorting conversations)

---

## 3. **messages** Collection

**Purpose**: Store all chat messages

```javascript
{
  _id: ObjectId,
  messageId: String,       // Unique message ID (e.g., "msg_12345")
  conversationId: String,  // Reference to conversations.conversationId
  senderId: String,        // Reference to users.userId
  text: String,             // Message content
  type: String,            // "text" | "image" | "video" | "audio" | "file" | "location"
  media: {
    url: String,           // URL to media file
    thumbnail: String,     // Thumbnail URL
    mimeType: String,      // MIME type
    size: Number,          // File size in bytes
    duration: Number       // For audio/video
  },
  status: String,          // "sending" | "sent" | "delivered" | "read"
  replyTo: String,         // messageId of replied message (optional)
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,        // Soft delete timestamp
  reactions: [{            // Emoji reactions
    userId: String,
    emoji: String,
    createdAt: Date
  }]
}
```

**Indexes**:
- `messageId` (unique)
- `conversationId` + `createdAt` (compound, for pagination)
- `senderId`
- `status`

---

## 4. **auth_tokens** Collection

**Purpose**: Store QR login tokens and session tokens

```javascript
{
  _id: ObjectId,
  token: String,           // QR token or JWT token
  userId: String,          // Reference to users.userId
  type: String,            // "qr" | "jwt" | "refresh"
  expiresAt: Date,
  createdAt: Date,
  usedAt: Date,           // When token was used (for QR tokens)
  deviceInfo: {
    platform: String,     // "ios" | "android" | "web"
    deviceId: String,
    userAgent: String
  }
}
```

**Indexes**:
- `token` (unique)
- `userId`
- `expiresAt` (TTL index for auto-deletion)

---

## 5. **qr_codes** Collection (Optional)

**Purpose**: Generate and track QR codes for login

```javascript
{
  _id: ObjectId,
  qrToken: String,         // Unique token in QR code
  userId: String,          // User who generated QR (optional)
  expiresAt: Date,         // QR code expiration
  isUsed: Boolean,         // Whether QR was scanned
  scannedBy: String,       // userId who scanned (if used)
  scannedAt: Date,
  createdAt: Date
}
```

**Indexes**:
- `qrToken` (unique)
- `expiresAt` (TTL index)

---

## 6. **typing_indicators** Collection (Optional - Can use Redis)

**Purpose**: Track who is typing in conversations

```javascript
{
  _id: ObjectId,
  conversationId: String,
  userId: String,
  isTyping: Boolean,
  lastTypingAt: Date
}
```

**Indexes**:
- `conversationId` + `userId` (compound)
- `lastTypingAt` (TTL index for cleanup)

---

## 7. **message_status** Collection (Optional - Can be embedded in messages)

**Purpose**: Track delivery and read status per user

```javascript
{
  _id: ObjectId,
  messageId: String,
  userId: String,
  status: String,          // "delivered" | "read"
  timestamp: Date
}
```

**Indexes**:
- `messageId` + `userId` (compound)
- `messageId` + `status`

---

## Field Naming Conventions

### IDs
- Use descriptive prefixes: `user_`, `conv_`, `msg_`, `qr_`
- Store as `String` type for easier API usage
- Keep MongoDB `_id` as ObjectId for internal references

### Timestamps
- `createdAt`: When document was created
- `updatedAt`: When document was last modified
- `deletedAt`: For soft deletes
- `expiresAt`: For time-limited documents

### References
- Use `userId`, `conversationId`, `messageId` (not `_id`) for API responses
- Keep `_id` for internal MongoDB references

---

## Example API Response Formats

### Login Response
```json
{
  "success": true,
  "userId": "user_12345",
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "message": "Logged in via QR"
}
```

### Conversation Response
```json
{
  "conversationId": "conv_12345",
  "participants": [
    {
      "userId": "user_12345",
      "displayName": "John Doe",
      "avatar": "https://...",
      "lastReadMessageId": "msg_67890"
    }
  ],
  "lastMessage": {
    "messageId": "msg_11111",
    "text": "Hello!",
    "senderId": "user_12345",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "unreadCount": 2
}
```

### Message Response
```json
{
  "messageId": "msg_12345",
  "conversationId": "conv_12345",
  "senderId": "user_12345",
  "text": "Hello, how are you?",
  "type": "text",
  "status": "delivered",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

## Best Practices

1. **Use Mongoose Schemas** for validation and type safety
2. **Implement Soft Deletes** for messages (don't hard delete)
3. **Use TTL Indexes** for temporary data (tokens, typing indicators)
4. **Pagination** for messages (limit 50-100 per page)
5. **Index Optimization** for frequently queried fields
6. **Connection Pooling** for MongoDB connections
7. **Aggregation Pipelines** for complex queries
8. **Transaction Support** for multi-document operations

---

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/chatapp_db
MONGODB_URI_PROD=mongodb+srv://user:pass@cluster.mongodb.net/chatapp_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
QR_TOKEN_EXPIRES_IN=300000  # 5 minutes in milliseconds
PORT=3000
NODE_ENV=development
```

---

## Next Steps

1. Set up MongoDB connection with Mongoose
2. Create Mongoose schemas for each collection
3. Implement authentication middleware
4. Build REST API endpoints
5. Set up SSE/WebSocket for real-time updates
6. Add file upload handling for media messages
7. Implement rate limiting and security measures

