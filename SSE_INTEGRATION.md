# Server-Sent Events (SSE) Integration Guide

## Overview

Real-time message receiving using Server-Sent Events (SSE) with automatic reconnection, exponential backoff, and storage persistence.

## Files Created

1. **`src/services/sse/sseService.ts`** - SSE service with reconnection logic
2. **`src/services/sse/index.ts`** - Service exports
3. **Updated `src/screens/ChatScreen.tsx`** - SSE subscription integration

## SSE Service API

### `subscribeToSSE(options)`

Subscribe to SSE stream for a conversation.

```typescript
import { subscribeToSSE } from '../services/sse';

const subscription = subscribeToSSE({
  conversationId: 'conv_123',
  token: 'auth_token_here', // Optional: auth token for query param
  onMessage: (storedMessage: StoredMessage) => {
    // Handle new message
  },
  onError: (error: Error) => {
    // Handle errors
  },
  onConnect: () => {
    // Connection established
  },
  onDisconnect: () => {
    // Connection lost
  },
});

// Unsubscribe
subscription.unsubscribe();

// Reconnect manually
subscription.reconnect();

// Check connection status
const isConnected = subscription.isConnected();
```

## Features

### ✅ Automatic Reconnection
- Exponential backoff: 1s → 2s → 4s → 8s → ... → max 30s
- Jitter added to prevent thundering herd
- Max 10 reconnection attempts
- Automatic reconnection on connection loss

### ✅ Security
- Token passed via query parameter (EventSource doesn't support headers)
- URL format: `/api/sse?conversationId=xxx&token=yyy`

### ✅ Message Handling
- JSON parsing of SSE events
- Duplicate detection (prevents adding same message twice)
- Automatic storage persistence
- UI updates on new messages

### ✅ Error Handling
- Connection errors logged
- Parse errors handled gracefully
- Reconnection attempts tracked

## Integration Example (ChatScreen)

```typescript
import { useEffect, useRef } from 'react';
import { subscribeToSSE, SSESubscription } from '../services/sse';
import { StoredMessage } from '../types/message';
import { storedMessageToMessage } from '../utils/messageConverter';
import { loadConversation, saveConversation } from '../services/storage';

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const sseSubscriptionRef = useRef<SSESubscription | null>(null);

  // Subscribe on mount
  useEffect(() => {
    if (loading) return; // Wait for initial load

    const handleNewMessage = async (storedMessage: StoredMessage) => {
      // Convert to UI message
      const uiMessage = storedMessageToMessage(storedMessage);

      // Update UI (with duplicate check)
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === uiMessage.id);
        if (exists) return prev;
        return [uiMessage, ...prev];
      });

      // Persist to storage
      const existing = await loadConversation(conversationId);
      await saveConversation(conversationId, [storedMessage, ...existing]);
    };

    // Subscribe
    const subscription = subscribeToSSE({
      conversationId: conversationIdToUse,
      token: getAuthToken(), // Get from auth service
      onMessage: handleNewMessage,
      onError: (error) => console.error('SSE error:', error),
      onConnect: () => console.log('SSE connected'),
      onDisconnect: () => console.log('SSE disconnected'),
    });

    sseSubscriptionRef.current = subscription;

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [conversationIdToUse, loading]);

  // ... rest of component
}
```

## SSE Event Format

The service expects SSE events in the following JSON format:

```json
{
  "id": "msg_123",
  "messageId": "msg_123",
  "text": "Hello!",
  "senderId": "user_456",
  "userId": "user_456",
  "createdAt": "2024-01-01T12:00:00Z",
  "status": "sent"
}
```

The service maps fields flexibly:
- `id` or `messageId` → message ID
- `text` or `message` → message text
- `senderId` or `userId` → sender ID
- `createdAt` → ISO timestamp
- `status` → message status

## Configuration

### Update SSE Base URL

Edit `src/services/sse/sseService.ts`:

```typescript
const SSE_BASE_URL = 'https://your-api.com'; // Update this
```

### Get Auth Token

Update `getAuthToken()` function in `sseService.ts`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

function getAuthToken(): string | undefined {
  // Example: Get from AsyncStorage
  return await AsyncStorage.getItem('auth_token');
  
  // Or from your auth service
  // return authService.getToken();
}
```

Or pass token directly when subscribing:

```typescript
const subscription = subscribeToSSE({
  conversationId: 'conv_123',
  token: await AsyncStorage.getItem('auth_token'),
  onMessage: handleMessage,
});
```

## Reconnection Logic

1. **Initial Delay**: 1 second
2. **Exponential Backoff**: `delay * 2^attempt`
3. **Max Delay**: 30 seconds
4. **Jitter**: Random 0-1000ms added
5. **Max Attempts**: 10

Example reconnection timeline:
- Attempt 1: 1s + jitter
- Attempt 2: 2s + jitter
- Attempt 3: 4s + jitter
- Attempt 4: 8s + jitter
- Attempt 5: 16s + jitter
- Attempt 6+: 30s + jitter (capped)

## React Native Compatibility

The `eventsource` package (v2.0.2) is compatible with React Native/Expo. If you encounter issues, you may need to use a polyfill:

```bash
npm install eventsource-polyfill
```

Then update the import in `sseService.ts`:

```typescript
import EventSource from 'eventsource-polyfill';
```

## Testing

### Test SSE Connection

```typescript
const subscription = subscribeToSSE({
  conversationId: 'test_conv',
  onMessage: (msg) => {
    console.log('Received:', msg);
  },
  onConnect: () => {
    console.log('✅ Connected');
  },
  onError: (err) => {
    console.error('❌ Error:', err);
  },
});

// Test after 5 seconds
setTimeout(() => {
  subscription.unsubscribe();
}, 5000);
```

### Mock SSE Server

For testing, you can use a simple Node.js SSE server:

```javascript
// test-sse-server.js
const http = require('http');

http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  setInterval(() => {
    const message = {
      id: Date.now().toString(),
      text: 'Test message',
      senderId: 'test_user',
      createdAt: new Date().toISOString(),
      status: 'sent',
    };
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  }, 2000);
}).listen(3000);
```

## Troubleshooting

### Connection Not Establishing
- Check SSE endpoint URL
- Verify token is valid
- Check network connectivity
- Review server logs

### Messages Not Appearing
- Verify SSE event format matches expected JSON
- Check `onMessage` callback is being called
- Review duplicate detection logic
- Check storage permissions

### Reconnection Issues
- Verify max attempts not reached
- Check network stability
- Review exponential backoff delays
- Check server SSE endpoint availability

## Security Notes

⚠️ **Token in Query Parameter**: Since EventSource doesn't support custom headers, the auth token is passed as a query parameter. Ensure:
- Use HTTPS for SSE connections
- Tokens are short-lived
- Server validates tokens properly
- Consider token rotation

## Performance

- SSE connection is lightweight (single HTTP connection)
- Automatic reconnection prevents manual intervention
- Duplicate detection prevents UI spam
- Storage updates are async and non-blocking

