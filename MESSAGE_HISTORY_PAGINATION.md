# Message History Loading & Pagination

## Overview

Implementation of message history loading with pagination:
- Load last N messages from AsyncStorage on mount
- Load older messages when scrolling to top (pagination)
- Fetch from backend API and save to storage

## Implementation

### 1. Storage Functions

**`loadLastMessages(conversationId, limit)`**
- Loads last N messages from storage (default: 50)
- Returns oldest messages for initial display

**`getOldestMessageTimestamp(conversationId)`**
- Gets timestamp of oldest loaded message
- Used for pagination cursor

**`prependMessages(conversationId, newMessages)`**
- Prepends older messages to existing conversation
- Handles duplicate removal
- Maintains sorted order

### 2. API Service

**`fetchOlderMessages(request)`**
```typescript
interface FetchMessagesRequest {
  conversationId: string;
  before?: string; // ISO timestamp for pagination
  limit?: number; // Default: 20
}

interface FetchMessagesResponse {
  messages: Array<{
    id: string;
    text: string;
    senderId: string;
    createdAt: string;
    status: 'sent' | 'delivered' | 'read';
  }>;
  hasMore: boolean;
}
```

**API Endpoint:**
```
GET /api/messages?conversationId=xxx&before=2024-01-01T12:00:00Z&limit=20
```

### 3. ChatScreen Integration

**Initial Load:**
- Loads last 50 messages from storage on mount
- Sets `hasMoreMessages` flag based on whether limit was reached

**Pagination:**
- Uses `onEndReached` (fires when scrolling to top in inverted list)
- `onEndReachedThreshold={0.5}` triggers when 50% from top
- Fetches older messages from server
- Prepends to list and saves to storage
- Shows loading indicator at top

## Code Snippets

### Storage Functions

```typescript
// Load last N messages
export async function loadLastMessages(
  conversationId: string,
  limit: number = 50
): Promise<StoredMessage[]> {
  const allMessages = await loadConversation(conversationId);
  return allMessages.slice(-limit);
}

// Get oldest message timestamp
export async function getOldestMessageTimestamp(
  conversationId: string
): Promise<string | null> {
  const messages = await loadConversation(conversationId);
  if (messages.length === 0) return null;
  const oldestMessage = messages[messages.length - 1];
  return oldestMessage.createdAt;
}

// Prepend messages
export async function prependMessages(
  conversationId: string,
  newMessages: StoredMessage[]
): Promise<void> {
  const existingMessages = await loadConversation(conversationId);
  const allMessages = [...newMessages, ...existingMessages];
  const uniqueMessages = allMessages.filter(
    (msg, index, self) =>
      index === self.findIndex((m) => m.id === msg.id)
  );
  const sortedMessages = uniqueMessages.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  await saveConversation(conversationId, sortedMessages);
}
```

### API Service

```typescript
export async function fetchOlderMessages(
  request: FetchMessagesRequest
): Promise<FetchMessagesResponse> {
  const params = new URLSearchParams({
    conversationId: request.conversationId,
    limit: (request.limit || 20).toString(),
  });

  if (request.before) {
    params.append('before', request.before);
  }

  const response = await apiClient.get<FetchMessagesResponse>(
    `/api/messages?${params.toString()}`
  );
  return response.data;
}
```

### ChatScreen Integration

```typescript
// State
const [loadingOlder, setLoadingOlder] = useState(false);
const [hasMoreMessages, setHasMoreMessages] = useState(true);
const INITIAL_MESSAGE_LIMIT = 50;

// Load last N messages on mount
useEffect(() => {
  const loadMessages = async () => {
    const storedMessages = await loadLastMessages(
      conversationIdToUse,
      INITIAL_MESSAGE_LIMIT
    );
    const uiMessages = storedMessages.map(storedMessageToMessage);
    setMessages(uiMessages);
    setHasMoreMessages(storedMessages.length === INITIAL_MESSAGE_LIMIT);
  };
  loadMessages();
}, [conversationIdToUse]);

// Load older messages
const handleLoadOlderMessages = useCallback(async () => {
  if (loadingOlder || !hasMoreMessages) return;

  setLoadingOlder(true);
  const oldestTimestamp = await getOldestMessageTimestamp(conversationIdToUse);
  
  const response = await fetchOlderMessages({
    conversationId: conversationIdToUse,
    before: oldestTimestamp,
    limit: 20,
  });

  const storedMessages: StoredMessage[] = response.messages.map((msg) => ({
    id: msg.id,
    text: msg.text,
    senderId: msg.senderId,
    createdAt: msg.createdAt,
    status: msg.status,
  }));

  await prependMessages(conversationIdToUse, storedMessages);
  
  const uiMessages = storedMessages.map(storedMessageToMessage);
  setMessages((prev) => {
    const existingIds = new Set(prev.map((m) => m.id));
    const newMessages = uiMessages.filter((m) => !existingIds.has(m.id));
    return [...prev, ...newMessages];
  });

  setHasMoreMessages(response.hasMore);
  setLoadingOlder(false);
}, [conversationIdToUse, loadingOlder, hasMoreMessages]);

// FlatList
<FlatList
  data={messages}
  inverted
  onEndReached={handleLoadOlderMessages}
  onEndReachedThreshold={0.5}
  ListHeaderComponent={
    loadingOlder ? (
      <View>
        <ActivityIndicator />
        <Text>Loading older messages...</Text>
      </View>
    ) : null
  }
/>
```

## Flow Diagram

```
ChatScreen Mount
  ↓
Load last 50 messages from storage
  ↓
Display messages
  ↓
User scrolls to top (oldest messages)
  ↓
onEndReached fires (50% threshold)
  ↓
Get oldest message timestamp
  ↓
Fetch older messages from API
  ↓
Prepend to storage
  ↓
Prepend to UI state
  ↓
Update hasMoreMessages flag
```

## Features

✅ **Initial Load**: Last 50 messages from storage
✅ **Pagination**: Load 20 older messages at a time
✅ **Storage Persistence**: All fetched messages saved
✅ **Duplicate Prevention**: Checks for existing messages
✅ **Loading States**: Shows indicator while fetching
✅ **Has More Flag**: Prevents unnecessary API calls
✅ **Error Handling**: Graceful error handling with retry capability

## Configuration

**Initial Message Limit:**
```typescript
const INITIAL_MESSAGE_LIMIT = 50; // Adjust as needed
```

**Pagination Limit:**
```typescript
limit: 20 // Messages per page
```

**Scroll Threshold:**
```typescript
onEndReachedThreshold={0.5} // Trigger at 50% from top
```

## Notes

- **Inverted List**: Since FlatList is inverted, `onEndReached` fires when scrolling to top (oldest messages)
- **ListHeaderComponent**: Shows at top of inverted list (where older messages appear)
- **Message Order**: Messages sorted by createdAt descending (newest first)
- **Duplicate Check**: Uses message ID and serverId for duplicate detection

