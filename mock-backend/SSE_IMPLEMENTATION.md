# SSE (Server-Sent Events) Implementation

## 📋 Overview

SSE (Server-Sent Events) has been implemented to provide real-time updates for:
- New messages
- Message status updates (delivered, read)
- Typing indicators
- Online status changes

## 🏗️ Architecture

### Backend Components

1. **SSE Service** (`services/sseService.js`)
   - Manages all SSE connections
   - Broadcasts events to connected clients
   - Handles connection cleanup

2. **SSE Controller** (`controllers/sseController.js`)
   - Handles SSE connection requests
   - Validates user permissions
   - Manages connection lifecycle

3. **SSE Routes** (`routes/sseRoutes.js`)
   - Endpoint: `GET /api/sse?conversationId=xxx&token=xxx`
   - Requires authentication

### Frontend Components

1. **SSE Service** (`src/services/sse/sseService.ts`)
   - Connects to SSE endpoint
   - Handles reconnection
   - Parses SSE events

## 🔌 Endpoint

### SSE Connection

**GET** `/api/sse`

**Query Parameters:**
- `conversationId` (required) - Conversation ID to subscribe to
- `token` (optional) - Auth token (can also use Authorization header)

**Headers:**
- `Authorization: Bearer <token>` (alternative to query param)

**Response:**
- Content-Type: `text/event-stream`
- Connection: `keep-alive`
- Streams events continuously

## 📡 Event Types

### 1. Connection Event
```javascript
event: connected
data: {
  "message": "SSE connection established",
  "conversationId": "conv_user1_user2",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Message Event
```javascript
event: message
data: {
  "id": "msg_123",
  "messageId": "msg_123",
  "text": "Hello!",
  "senderId": "user_123",
  "conversationId": "conv_user1_user2",
  "type": "text",
  "status": "sent",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "sender": {
    "userId": "user_123",
    "displayName": "John Doe",
    "avatar": null
  }
}
```

### 3. Status Update Event
```javascript
event: statusUpdate
data: {
  "messageId": "msg_123",
  "status": "read",
  "conversationId": "conv_user1_user2",
  "userId": "user_456",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Typing Event
```javascript
event: typing
data: {
  "userId": "user_123",
  "displayName": "John Doe",
  "isTyping": true,
  "conversationId": "conv_user1_user2",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5. Online Status Event
```javascript
event: onlineStatus
data: {
  "userId": "user_123",
  "isOnline": true,
  "lastSeen": "2024-01-15T10:30:00.000Z",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 6. Heartbeat
```
: heartbeat
```
(Sent every 30 seconds to keep connection alive)

## 🔄 Integration Points

### Message Broadcasting

When a message is sent (`POST /api/chat/messages`):
1. Message saved to database
2. Message broadcasted via SSE to all conversation participants (except sender)
3. Clients receive real-time message update

### Status Updates

When message status is updated (`PUT /api/chat/messages/:id/status`):
1. Status updated in database
2. Status update broadcasted via SSE
3. Clients receive real-time status update

### Typing Indicators

When typing indicator is set (`POST /api/chat/typing`):
1. Typing indicator saved to database
2. Typing event broadcasted via SSE
3. Clients receive real-time typing update

### Online Status

When online status is updated (`PUT /api/chat/status/online`):
1. Status updated in database
2. Online status broadcasted via SSE
3. Clients receive real-time status update

## 📱 Frontend Usage

### Subscribe to SSE

```typescript
import { subscribeToSSE } from '../services/sse';

const subscription = subscribeToSSE({
  conversationId: 'conv_user1_user2',
  token: 'your-auth-token',
  onMessage: (message) => {
    // Handle new message
    console.log('New message:', message);
  },
  onStatusUpdate: (messageId, status) => {
    // Handle status update
    console.log(`Message ${messageId} status: ${status}`);
  },
  onError: (error) => {
    // Handle error
    console.error('SSE error:', error);
  },
  onConnect: () => {
    console.log('SSE connected');
  },
  onDisconnect: () => {
    console.log('SSE disconnected');
  },
});

// Unsubscribe when done
subscription.unsubscribe();
```

## 🔧 Configuration

### Backend

No additional configuration needed. SSE service is automatically initialized.

### Frontend

SSE base URL is automatically configured from `src/app/config/api.ts`:
```typescript
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
```

## 🧪 Testing

### Test SSE Connection

```bash
# Using curl
curl -N -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/sse?conversationId=conv_user1_user2"

# Using browser
# Open: http://localhost:3000/api/sse?conversationId=conv_user1_user2&token=<token>
```

### Test Message Broadcasting

1. Connect to SSE endpoint
2. Send a message via `POST /api/chat/messages`
3. Observe SSE stream receives message event

### Test Status Updates

1. Connect to SSE endpoint
2. Update message status via `PUT /api/chat/messages/:id/status`
3. Observe SSE stream receives statusUpdate event

## 🐛 Troubleshooting

### Connection Issues

1. **Connection closes immediately**
   - Check authentication token is valid
   - Verify conversation exists and user is participant
   - Check server logs for errors

2. **No events received**
   - Verify conversation has active participants
   - Check if messages are being sent
   - Verify SSE service is broadcasting

3. **Connection timeout**
   - Heartbeat is sent every 30 seconds
   - Stale connections are cleaned up after 5 minutes
   - Check network connectivity

### Frontend Issues

1. **EventSource not available**
   - Frontend uses polyfill for React Native
   - Web uses native EventSource
   - Check platform compatibility

2. **Reconnection issues**
   - Frontend automatically reconnects with exponential backoff
   - Max 10 reconnection attempts
   - Check network stability

## 📊 Performance

### Connection Management

- Each conversation can have multiple SSE connections
- Connections are automatically cleaned up on disconnect
- Stale connections are removed after 5 minutes of inactivity

### Broadcasting

- Events are broadcasted only to relevant clients
- Sender doesn't receive their own message events
- Typing events exclude the user who is typing

### Resource Usage

- Each SSE connection uses minimal resources
- Heartbeat keeps connections alive
- Automatic cleanup prevents resource leaks

## ✅ Benefits

1. **Real-time Updates** - Instant message delivery
2. **Status Updates** - Real-time message status changes
3. **Typing Indicators** - Real-time typing status
4. **Online Status** - Real-time online/offline updates
5. **Efficient** - Server pushes updates, no polling needed
6. **Scalable** - Handles multiple connections per conversation

## 🚀 Next Steps

1. **Load Testing** - Test with multiple concurrent connections
2. **Error Handling** - Enhanced error recovery
3. **Metrics** - Add connection metrics and monitoring
4. **Optimization** - Optimize for high-traffic scenarios

---

**SSE Implementation Complete!** ✅

Real-time updates are now available for all chat features.

