# Chat System Documentation

## 📋 Overview

Complete WhatsApp-like chat system with:
- Session-based conversations
- Real-time messaging
- Online status tracking
- Typing indicators
- Message status (sent, delivered, read)
- Persistent message storage
- User logout

## 🔄 Chat Flow

### Complete User Journey

```
1. User logs in → Receives token
   ↓
2. User starts chat session → Create/get conversation
   ↓
3. User sends messages → Messages stored in database
   ↓
4. Messages have status: sending → sent → delivered → read
   ↓
5. User sees online status of other users
   ↓
6. User sees typing indicators
   ↓
7. All messages/conversations stored per user
   ↓
8. User logs out → Token invalidated, status updated
```

## 📡 API Endpoints

### 🔐 Authentication Required
All chat endpoints require authentication via Bearer token:
```
Authorization: Bearer <token>
```

---

## 💬 Conversation Endpoints

### 1. Get or Create Conversation

**POST** `/api/chat/conversations`

Start a chat session with another user. Creates conversation if doesn't exist.

**Request Body:**
```json
{
  "otherUserId": "user_1234567890_abc123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "conversation": {
    "conversationId": "conv_user1_user2",
    "type": "direct",
    "participants": [
      {
        "userId": "user1",
        "displayName": "John Doe",
        "avatar": null,
        "isOnline": true,
        "lastSeen": "2024-01-15T10:30:00.000Z",
        "isArchived": false,
        "isMuted": false
      },
      {
        "userId": "user2",
        "displayName": "Jane Smith",
        "avatar": null,
        "isOnline": false,
        "lastSeen": "2024-01-15T09:00:00.000Z",
        "isArchived": false,
        "isMuted": false
      }
    ],
    "lastMessage": null,
    "unreadCount": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Conversation retrieved successfully"
}
```

---

### 2. Get All Conversations

**GET** `/api/chat/conversations`

Get all conversations for the current user.

**Query Parameters:**
- `limit` (optional) - Number of conversations to return (default: 50)
- `offset` (optional) - Number of conversations to skip (default: 0)

**Success Response (200):**
```json
{
  "success": true,
  "conversations": [
    {
      "conversationId": "conv_user1_user2",
      "type": "direct",
      "otherUser": {
        "userId": "user2",
        "displayName": "Jane Smith",
        "avatar": null,
        "isOnline": false,
        "lastSeen": "2024-01-15T09:00:00.000Z"
      },
      "lastMessage": {
        "messageId": "msg_123",
        "text": "Hello!",
        "senderId": "user2",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "status": "read"
      },
      "unreadCount": 0,
      "isArchived": false,
      "isMuted": false,
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "message": "Conversations retrieved successfully"
}
```

---

### 3. Get Single Conversation

**GET** `/api/chat/conversations/:conversationId`

Get details of a specific conversation.

**Success Response (200):**
```json
{
  "success": true,
  "conversation": {
    "conversationId": "conv_user1_user2",
    "type": "direct",
    "participants": [...],
    "lastMessage": {...},
    "unreadCount": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Conversation retrieved successfully"
}
```

---

## 📨 Message Endpoints

### 4. Send Message

**POST** `/api/chat/messages`

Send a message in a conversation.

**Request Body:**
```json
{
  "conversationId": "conv_user1_user2",
  "text": "Hello! How are you?",
  "type": "text",
  "replyTo": null
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": {
    "messageId": "msg_1704067200000_abc123",
    "conversationId": "conv_user1_user2",
    "senderId": "user1",
    "sender": {
      "userId": "user1",
      "displayName": "John Doe",
      "avatar": null
    },
    "text": "Hello! How are you?",
    "type": "text",
    "status": "sent",
    "replyTo": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Message sent successfully"
}
```

**Message Types:**
- `text` - Text message (default)
- `image` - Image message
- `video` - Video message
- `audio` - Audio message
- `file` - File message
- `location` - Location message

---

### 5. Get Messages

**GET** `/api/chat/conversations/:conversationId/messages`

Get messages for a conversation.

**Query Parameters:**
- `limit` (optional) - Number of messages (default: 50)
- `offset` (optional) - Number to skip (default: 0)
- `before` (optional) - Get messages before this timestamp (ISO date)

**Success Response (200):**
```json
{
  "success": true,
  "messages": [
    {
      "messageId": "msg_123",
      "conversationId": "conv_user1_user2",
      "senderId": "user1",
      "sender": {
        "userId": "user1",
        "displayName": "John Doe",
        "avatar": null
      },
      "text": "Hello!",
      "type": "text",
      "status": "read",
      "replyTo": null,
      "reactions": [],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "hasMore": false,
  "message": "Messages retrieved successfully"
}
```

**Notes:**
- Messages are returned in chronological order (oldest first)
- Automatically marks messages as "delivered" when retrieved
- Resets unread count for the conversation

---

### 6. Update Message Status

**PUT** `/api/chat/messages/:messageId/status`

Update message status (delivered or read). Only recipient can update.

**Request Body:**
```json
{
  "status": "read"  // or "delivered"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": {
    "messageId": "msg_123",
    "status": "read"
  },
  "message": "Message status updated successfully"
}
```

**Message Status Flow:**
```
sending → sent → delivered → read
```

---

### 7. Mark Conversation as Read

**POST** `/api/chat/conversations/:conversationId/read`

Mark all messages in a conversation as read.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Conversation marked as read"
}
```

---

## 👤 Status Endpoints

### 8. Update Online Status

**PUT** `/api/chat/status/online`

Update current user's online status.

**Request Body:**
```json
{
  "isOnline": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "userId": "user1",
    "isOnline": true,
    "lastSeen": "2024-01-15T10:30:00.000Z"
  },
  "message": "Online status updated successfully"
}
```

---

### 9. Get User Status

**GET** `/api/chat/users/:userId/status`

Get online status of a user.

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "userId": "user2",
    "displayName": "Jane Smith",
    "isOnline": false,
    "lastSeen": "2024-01-15T09:00:00.000Z",
    "status": "Hey there! I'm using ChatApp"
  },
  "message": "User status retrieved successfully"
}
```

---

## ⌨️ Typing Indicators

### 10. Set Typing Indicator

**POST** `/api/chat/typing`

Set or clear typing indicator for a conversation.

**Request Body:**
```json
{
  "conversationId": "conv_user1_user2",
  "isTyping": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Typing indicator set"
}
```

**Notes:**
- Typing indicator expires after 3 seconds
- Set `isTyping: false` to clear immediately

---

### 11. Get Typing Indicators

**GET** `/api/chat/conversations/:conversationId/typing`

Get active typing indicators for a conversation.

**Success Response (200):**
```json
{
  "success": true,
  "typingUsers": [
    {
      "userId": "user2",
      "displayName": "Jane Smith"
    }
  ],
  "message": "Typing indicators retrieved successfully"
}
```

---

## 🚪 Logout

### 12. Logout

**POST** `/api/auth/logout`

Logout user and invalidate token.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**What happens:**
- User's online status set to `false`
- `lastSeen` updated
- Auth token deleted
- Typing indicators cleared

---

## 💾 Data Storage

### Conversation Storage

All conversations are stored in `conversations` collection:
- `conversationId` - Unique ID for conversation
- `participants` - Array of users in conversation
- `lastMessage` - Last message info
- `unreadCount` - Unread count per user
- `isActive` - Whether conversation is active

### Message Storage

All messages are stored in `messages` collection:
- `messageId` - Unique message ID
- `conversationId` - Links to conversation
- `senderId` - User who sent message
- `text` - Message content
- `type` - Message type (text, image, etc.)
- `status` - Message status (sent, delivered, read)
- `createdAt` - When message was sent

### Per User Storage

All conversations and messages are linked to users:
- Conversations: User is in `participants` array
- Messages: User is in `senderId` or recipient
- All data persists in database per user account

---

## 🔄 Message Status Flow

### Status Progression

1. **Sending** - Message is being sent (client-side)
2. **Sent** - Message sent to server (default)
3. **Delivered** - Message delivered to recipient (auto on fetch)
4. **Read** - Message read by recipient (manual update)

### Automatic Updates

- Messages automatically marked as "delivered" when recipient fetches messages
- Unread count automatically reset when messages are fetched
- Last read position updated when conversation marked as read

---

## 📊 Features

### ✅ Implemented

1. **Session-based chat** - Conversations created per user pair
2. **User-to-user messaging** - Direct messages between users
3. **Online status** - Real-time online/offline tracking
4. **Typing indicators** - Shows when user is typing
5. **Message status** - Sent, delivered, read tracking
6. **Message storage** - All messages stored in database
7. **Conversation storage** - All conversations stored per user
8. **Logout** - Proper logout with cleanup

### 🔄 Real-time Features (REST API)

Currently implemented as REST endpoints. For true real-time:
- Use polling for messages (every 2-3 seconds)
- Use polling for typing indicators (every 1 second)
- Use polling for online status (every 5 seconds)

**Recommended:** Add Socket.io for true real-time updates (see next section)

---

## 🚀 Adding Real-time with Socket.io (Optional)

For true real-time features, install Socket.io:

```bash
npm install socket.io
```

Then implement:
- Real-time message delivery
- Real-time typing indicators
- Real-time online status
- Real-time message status updates

---

## 📝 Usage Examples

### Complete Chat Flow

```javascript
// 1. Login
POST /api/otp/verify
→ Receive token

// 2. Start chat session
POST /api/chat/conversations
Body: { "otherUserId": "user2" }
→ Get conversation

// 3. Send message
POST /api/chat/messages
Body: { "conversationId": "...", "text": "Hello!" }
→ Message sent

// 4. Get messages
GET /api/chat/conversations/:id/messages
→ Receive all messages

// 5. Update online status
PUT /api/chat/status/online
Body: { "isOnline": true }

// 6. Set typing
POST /api/chat/typing
Body: { "conversationId": "...", "isTyping": true }

// 7. Mark as read
POST /api/chat/conversations/:id/read

// 8. Logout
POST /api/auth/logout
```

---

## ✅ Summary

**Complete Chat System Features:**

✅ Session-based conversations  
✅ User-to-user messaging  
✅ Online status tracking  
✅ Typing indicators  
✅ Message status (sent, delivered, read)  
✅ Persistent storage (all messages/conversations)  
✅ Per-user data storage  
✅ Logout functionality  

The chat system is fully functional and ready to use!

