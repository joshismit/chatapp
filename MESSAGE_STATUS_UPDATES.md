# Message Status Updates via SSE

## Overview

Real-time message status updates (delivered/read) using Server-Sent Events (SSE).

## Implementation

### 1. Status Update Utility Function

**`updateMessageStatus(conversationId, messageId, newStatus)`**
- Updates message status in storage
- Finds message by ID or serverId
- Saves updated conversation

### 2. SSE Event Handlers

The SSE service listens for three event types:

1. **`delivery`** - Message delivered event
2. **`read`** - Message read event  
3. **`status`** - Generic status update event

### 3. ChatScreen Integration

- Subscribes to status update events via `onStatusUpdate` callback
- Updates storage when status event received
- Updates UI immediately to reflect new status

## SSE Event Format

### Delivery Event
```json
{
  "event": "delivery",
  "data": {
    "messageId": "msg_123",
    "id": "msg_123",
    "conversationId": "conv_456"
  }
}
```

### Read Event
```json
{
  "event": "read",
  "data": {
    "messageId": "msg_123",
    "id": "msg_123",
    "conversationId": "conv_456"
  }
}
```

### Generic Status Event
```json
{
  "event": "status",
  "data": {
    "messageId": "msg_123",
    "status": "read",
    "conversationId": "conv_456"
  }
}
```

## Code Snippets

### Status Update Utility

```typescript
import { updateMessageStatus } from '../services/storage/messageStatus';

// Update single message status
const updatedMessage = await updateMessageStatus(
  conversationId,
  messageId,
  'delivered'
);

// Update multiple messages (batch)
await updateMultipleMessageStatuses(conversationId, [
  { messageId: 'msg_1', status: 'delivered' },
  { messageId: 'msg_2', status: 'read' },
]);
```

### SSE Event Handler (in ChatScreen)

```typescript
const handleStatusUpdate = useCallback(
  async (messageId: string, newStatus: 'delivered' | 'read') => {
    // Update in storage
    const updatedMessage = await updateMessageStatus(
      conversationId,
      messageId,
      newStatus
    );

    if (updatedMessage) {
      // Update UI
      setMessages((prev) =>
        prev.map((msg) => {
          if (
            msg.id === messageId ||
            msg.id === updatedMessage.id ||
            msg.id === updatedMessage.serverId
          ) {
            return { ...msg, status: newStatus };
          }
          return msg;
        })
      );
    }
  },
  [conversationId]
);

// Subscribe with status update handler
const subscription = subscribeToSSE({
  conversationId,
  onMessage: handleNewMessage,
  onStatusUpdate: handleStatusUpdate, // Status update handler
});
```

### SSE Service Event Listeners

```typescript
// Delivery event
eventSource.addEventListener('delivery', (event: any) => {
  const data = JSON.parse(event.data);
  const messageId = data.messageId || data.id;
  if (messageId && onStatusUpdate) {
    onStatusUpdate(messageId, 'delivered');
  }
});

// Read event
eventSource.addEventListener('read', (event: any) => {
  const data = JSON.parse(event.data);
  const messageId = data.messageId || data.id;
  if (messageId && onStatusUpdate) {
    onStatusUpdate(messageId, 'read');
  }
});

// Generic status event
eventSource.addEventListener('status', (event: any) => {
  const data = JSON.parse(event.data);
  const messageId = data.messageId || data.id;
  const status = data.status;
  if (messageId && status && onStatusUpdate) {
    if (status === 'delivered' || status === 'read') {
      onStatusUpdate(messageId, status);
    }
  }
});
```

## Flow Diagram

```
Server sends status event
  ↓
SSE receives "delivery" or "read" event
  ↓
Parse event data (messageId)
  ↓
Call onStatusUpdate callback
  ↓
Update message status in storage
  ↓
Update UI state
  ↓
MessageBubble shows new status icon
```

## Features

✅ **Real-time Updates**: Status changes appear immediately
✅ **Storage Persistence**: Status updates saved to AsyncStorage
✅ **UI Synchronization**: UI updates automatically
✅ **Multiple Event Types**: Supports delivery, read, and generic status events
✅ **ID Matching**: Matches messages by ID or serverId
✅ **Error Handling**: Graceful error handling with logging

## Status Flow

```
sending → sent → delivered → read
```

- **sending**: Message queued locally
- **sent**: Message sent to server
- **delivered**: Message delivered to recipient (via SSE)
- **read**: Message read by recipient (via SSE)

## Testing

### Test Status Update

```typescript
// Simulate delivery event
await updateMessageStatus(conversationId, 'msg_123', 'delivered');

// Simulate read event
await updateMessageStatus(conversationId, 'msg_123', 'read');
```

### Test SSE Events

```typescript
// In browser console or test server
eventSource.addEventListener('delivery', (event) => {
  console.log('Delivery:', event.data);
});

eventSource.addEventListener('read', (event) => {
  console.log('Read:', event.data);
});
```

## Server Implementation Notes

The server should send SSE events in this format:

```javascript
// Delivery event
res.write(`event: delivery\n`);
res.write(`data: ${JSON.stringify({ messageId: 'msg_123' })}\n\n`);

// Read event
res.write(`event: read\n`);
res.write(`data: ${JSON.stringify({ messageId: 'msg_123' })}\n\n`);

// Generic status event
res.write(`event: status\n`);
res.write(`data: ${JSON.stringify({ messageId: 'msg_123', status: 'read' })}\n\n`);
```

