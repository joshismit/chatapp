# Send Message Flow Implementation

## Overview

Complete implementation of send-message flow with optimistic updates, API integration, and retry functionality.

## Files Created/Updated

1. **`src/services/api/client.ts`** - Axios client configuration
2. **`src/services/api/messageService.ts`** - Message API service with send/retry functions
3. **`src/hooks/useMessageSender.ts`** - Custom hook for message sending with optimistic updates
4. **`src/types/message.ts`** - Updated with "failed" status
5. **`src/components/chat/MessageBubble.tsx`** - Updated with retry button for failed messages
6. **`src/screens/ChatScreen.tsx`** - Updated to use new send flow

## Implementation Details

### 1. sendMessage Function

```typescript
// From useMessageSender hook
const sendMessage = async (messageText: string): Promise<SendMessageResult> => {
  // 1. Generate temporary ID
  const tempId = generateTempId();

  // 2. Create optimistic message with status "sending"
  const optimisticMessage: Message = {
    id: tempId,
    text: messageText,
    isSent: true,
    timestamp: new Date().toLocaleTimeString(...),
    status: 'sending',
  };

  // 3. Update UI immediately (optimistic update)
  const updatedMessages = [optimisticMessage, ...currentMessages];
  onMessageUpdate(updatedMessages);
  await persistMessages(updatedMessages);

  // 4. Attempt POST to server
  try {
    const response = await sendMessage({
      conversationId,
      text: messageText,
      senderId,
    });

    // 5. On success: update status to "sent" and replace temp ID
    await replaceTempMessage(tempId, serverMessage);
    return { success: true };
  } catch (error) {
    // 6. On failure: mark as "failed"
    await updateMessageStatus(tempId, { status: 'failed' });
    return { success: false, error };
  }
};
```

### 2. Axios API Call Example

```typescript
// From messageService.ts
import apiClient from './client';

export async function sendMessage(
  request: SendMessageRequest
): Promise<SendMessageResponse> {
  try {
    const response = await apiClient.post<SendMessageResponse>(
      '/api/messages/send',
      {
        conversationId: request.conversationId,
        text: request.text,
        senderId: request.senderId,
      }
    );
    return response.data;
  } catch (error: any) {
    const errorMessage: SendMessageError = {
      message: error.response?.data?.message || error.message || 'Failed to send message',
      code: error.response?.status?.toString() || error.code,
    };
    throw errorMessage;
  }
}
```

### 3. State Management (useState)

```typescript
// From ChatScreen.tsx
const [messages, setMessages] = useState<Message[]>([]);
const [loading, setLoading] = useState(true);

// Initialize message sender hook
const { sendMessage, retryMessage } = useMessageSender({
  conversationId: conversationIdToUse,
  senderId: CURRENT_USER_ID,
  onMessageUpdate: setMessages, // Direct state setter
  currentMessages: messages,
});

// Usage
const handleSendMessage = useCallback(async (text: string) => {
  const result = await sendMessage(text);
  if (!result.success && result.error) {
    console.error('Failed to send message:', result.error);
  }
}, [sendMessage]);
```

### 4. Retry Failed Messages

```typescript
// From useMessageSender hook
const retryMessage = async (failedMessage: Message): Promise<SendMessageResult> => {
  // 1. Update status to "sending"
  await updateMessageStatus(failedMessage.id, { status: 'sending' });

  try {
    // 2. Retry API call
    const response = await retrySendMessage(storedMessage, conversationId, senderId);
    
    // 3. On success: update with server response
    await replaceTempMessage(failedMessage.id, serverMessage);
    return { success: true };
  } catch (error) {
    // 4. On failure: mark as "failed" again
    await updateMessageStatus(failedMessage.id, { status: 'failed' });
    return { success: false, error };
  }
};
```

## TypeScript Types

```typescript
// Message status includes "failed"
export interface Message {
  id: string;
  text: string;
  isSent: boolean;
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

// Stored message with server ID
export interface StoredMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  serverId?: string; // Server-assigned ID after successful send
  errorMessage?: string;
}

// API request/response types
export interface SendMessageRequest {
  conversationId: string;
  text: string;
  senderId: string;
}

export interface SendMessageResponse {
  messageId: string;
  conversationId: string;
  text: string;
  senderId: string;
  createdAt: string;
  status: 'sent';
}
```

## Flow Diagram

```
User types message → handleSendMessage()
  ↓
Generate temp ID → Create optimistic message (status: "sending")
  ↓
Update UI immediately → Persist to storage
  ↓
POST /api/messages/send
  ↓
Success? ──Yes──→ Update status to "sent", replace temp ID with server ID
  │
  No
  ↓
Mark status as "failed" → Show retry button
  ↓
User clicks retry → retryMessage()
  ↓
Update status to "sending" → Retry POST
  ↓
Success? ──Yes──→ Update to "sent"
  │
  No
  ↓
Mark as "failed" again
```

## Usage Example

```typescript
// In ChatScreen component
const { sendMessage, retryMessage } = useMessageSender({
  conversationId: 'conv_123',
  senderId: 'user_456',
  onMessageUpdate: setMessages,
  currentMessages: messages,
});

// Send message
await sendMessage('Hello!');

// Retry failed message
await retryMessage(failedMessage);
```

## Features

✅ Optimistic UI updates (instant feedback)
✅ Temporary ID generation for local messages
✅ Automatic persistence to AsyncStorage
✅ POST to `/api/messages/send` via axios
✅ Success handling (update to "sent" status)
✅ Failure handling (mark as "failed")
✅ Retry functionality for failed messages
✅ TypeScript types throughout
✅ useState for state management

## Configuration

Update API base URL in `src/services/api/client.ts`:
```typescript
const API_BASE_URL = 'https://your-api.com'; // Replace with your API
```

Add authentication token in request interceptor if needed:
```typescript
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

