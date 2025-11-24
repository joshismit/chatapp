# useConversation Hook

## Overview

A comprehensive hook that manages all conversation logic including message loading, SSE subscription, sending, pagination, and persistence.

## Hook API

```typescript
const {
  messages,           // Message[] - Array of UI messages
  status,             // Status object
  sendMessage,        // (text: string) => Promise<Result>
  retryMessage,       // (message: Message) => Promise<Result>
  loadOlder,          // () => Promise<void>
  archive,            // () => Promise<void>
  refresh,            // () => Promise<void>
} = useConversation({
  conversationId: string,
  senderId: string,
  token?: string,
  initialLimit?: number,
});
```

## Status Object

```typescript
status: {
  loading: boolean;           // Initial load state
  loadingOlder: boolean;      // Pagination load state
  hasMoreMessages: boolean;    // Whether more messages available
  error: Error | null;        // Error state
}
```

## Usage Example (ChatScreen)

```typescript
import { useConversation } from '../hooks/useConversation';

export default function ChatScreen() {
  const { conversationId, userName } = route.params;
  const CURRENT_USER_ID = 'current_user';

  // Use conversation hook - handles all logic internally
  const {
    messages,
    status,
    sendMessage,
    retryMessage,
    loadOlder,
    archive,
  } = useConversation({
    conversationId,
    senderId: CURRENT_USER_ID,
    token: getAuthToken(), // Optional
    initialLimit: 50, // Optional, default: 50
  });

  // Handle send
  const handleSend = async (text: string) => {
    const result = await sendMessage(text);
    if (!result.success) {
      console.error('Failed:', result.error);
    }
  };

  // Handle retry
  const handleRetry = async (message: Message) => {
    await retryMessage(message);
  };

  // Render
  return (
    <FlatList
      data={messages}
      onEndReached={loadOlder}
      ListHeaderComponent={
        status.loadingOlder ? <LoadingIndicator /> : null
      }
    />
  );
}
```

## Features

✅ **Automatic Loading**: Loads last N messages on mount
✅ **SSE Subscription**: Automatically subscribes to real-time updates
✅ **Status Updates**: Handles delivered/read status updates via SSE
✅ **Optimistic Updates**: Messages appear immediately when sent
✅ **Persistence**: All messages automatically saved to AsyncStorage
✅ **Pagination**: Load older messages with `loadOlder()`
✅ **Error Handling**: Comprehensive error state management
✅ **Archive Support**: Archive conversation with `archive()`

## Internal Handling

The hook internally handles:
- Message loading from storage
- SSE connection and reconnection
- Message status updates (delivered/read)
- Optimistic UI updates
- Storage persistence
- Duplicate prevention
- Error recovery

## Complete Example

```typescript
import React, { useCallback } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { useConversation } from '../hooks/useConversation';
import MessageBubble from '../components/chat/MessageBubble';
import ChatInput from '../components/chat/ChatInput';

export default function ChatScreen() {
  const conversationId = 'conv_123';
  const senderId = 'user_456';

  const {
    messages,
    status,
    sendMessage,
    retryMessage,
    loadOlder,
  } = useConversation({
    conversationId,
    senderId,
  });

  const handleSend = useCallback(
    async (text: string) => {
      await sendMessage(text);
    },
    [sendMessage]
  );

  const handleRetry = useCallback(
    async (message) => {
      await retryMessage(message);
    },
    [retryMessage]
  );

  if (status.loading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <MessageBubble message={item} onRetry={handleRetry} />
        )}
        keyExtractor={(item) => item.id}
        inverted
        onEndReached={loadOlder}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          status.loadingOlder ? (
            <ActivityIndicator size="small" />
          ) : null
        }
      />
      <ChatInput onSendMessage={handleSend} />
    </View>
  );
}
```

