# Message Persistence Integration Guide

## Files Created

1. **`src/services/storage.ts`** - AsyncStorage service with all required functions
2. **`src/types/message.ts`** - TypeScript types for stored messages
3. **`src/utils/messageConverter.ts`** - Utility functions to convert between UI and storage message formats
4. **`src/screens/ChatScreen.tsx`** - Updated with storage integration

## Storage Service Functions

### `saveConversation(conversationId, messages)`
Saves messages for a conversation and updates conversation metadata.

### `loadConversation(conversationId)`
Loads all messages for a conversation, sorted by createdAt (newest first).

### `archiveConversation(conversationId)`
Archives a conversation and marks all its messages as archived.

### `listConversations()`
Returns list of all conversations with metadata (last message, timestamp, unread count).

## Integration Code Snippets

### 1. Load Messages on Mount

```typescript
import { useEffect, useState } from 'react';
import { loadConversation } from '../services/storage';
import { storedMessageToMessage } from '../utils/messageConverter';

const [messages, setMessages] = useState<Message[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadMessages = async () => {
    try {
      setLoading(true);
      const storedMessages = await loadConversation(conversationId);
      
      if (storedMessages.length > 0) {
        const uiMessages = storedMessages.map(storedMessageToMessage);
        setMessages(uiMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  loadMessages();
}, [conversationId]);
```

### 2. Save Messages on Send

```typescript
import { saveConversation } from '../services/storage';
import { messageToStoredMessage } from '../utils/messageConverter';

const CURRENT_USER_ID = 'current_user'; // Replace with actual user ID

const handleSendMessage = useCallback(async (text: string) => {
  const newMessage: Message = {
    id: Date.now().toString(),
    text,
    isSent: true,
    timestamp: new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
    status: 'sending',
  };

  // Update UI immediately
  const updatedMessages = [newMessage, ...messages];
  setMessages(updatedMessages);
  
  // Save to storage
  const storedMessages = updatedMessages.map((msg) =>
    messageToStoredMessage(
      msg,
      msg.isSent ? CURRENT_USER_ID : conversationId
    )
  );
  await saveConversation(conversationId, storedMessages);

  // Update status later (also save after status updates)
  setTimeout(async () => {
    setMessages((prev) => {
      const updated = prev.map((msg) =>
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      );
      // Save updated status
      const stored = updated.map((msg) =>
        messageToStoredMessage(
          msg,
          msg.isSent ? CURRENT_USER_ID : conversationId
        )
      );
      saveConversation(conversationId, stored);
      return updated;
    });
  }, 500);
}, [messages, conversationId]);
```

### 3. Complete Example (from ChatScreen.tsx)

```typescript
// On mount: Load messages
useEffect(() => {
  const loadMessages = async () => {
    try {
      setLoading(true);
      const storedMessages = await loadConversation(conversationIdToUse);
      
      if (storedMessages.length > 0) {
        const uiMessages = storedMessages.map(storedMessageToMessage);
        setMessages(uiMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  loadMessages();
}, [conversationIdToUse]);

// On send: Append and save
const handleSendMessage = useCallback(async (text: string) => {
  const newMessage: Message = {
    id: Date.now().toString(),
    text,
    isSent: true,
    timestamp: new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
    status: 'sending',
  };

  const updatedMessages = [newMessage, ...messages];
  setMessages(updatedMessages);
  await saveMessagesToStorage(updatedMessages);
  
  // Update status and save again
  setTimeout(() => {
    setMessages((prev) => {
      const updated = prev.map((msg) =>
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      );
      saveMessagesToStorage(updated);
      return updated;
    });
  }, 500);
}, [messages, saveMessagesToStorage]);
```

## Message Type Structure

```typescript
interface StoredMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: string; // ISO 8601 format
  status: 'sending' | 'sent' | 'delivered' | 'read';
  archived?: boolean;
}
```

## Notes

- Messages are stored with ISO 8601 timestamps (`createdAt`)
- UI displays formatted timestamps using `toLocaleTimeString`
- Messages are sorted by `createdAt` descending (newest first) for inverted FlatList
- Conversation metadata is automatically updated when messages are saved
- Replace `CURRENT_USER_ID` with actual user ID from your authentication system

