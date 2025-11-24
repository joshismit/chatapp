# Offline Support Implementation

## Overview

Complete offline support with message queuing, automatic retry, and reconciliation with server state.

## Architecture

### Components

1. **Offline Queue** - Stores outgoing messages when offline
2. **Network Monitor** - Detects connectivity changes
3. **Queue Flusher** - Retries queued messages when online
4. **Message Reconciliation** - Merges local and server messages

## Conflict Resolution Strategy

### Rules (Priority Order)

1. **Server ID Wins**: If server has an ID, use server version
2. **Timestamp Comparison**: Newer timestamp wins
3. **Server Priority**: If timestamps equal, server version takes precedence
4. **Local Fallback**: Only use local if server doesn't have the message

### Rationale

- **Server is Source of Truth**: Server-assigned IDs are authoritative
- **Chronological Order**: Timestamps ensure correct message sequence
- **Prevent Duplicates**: Server priority prevents duplicate messages
- **Preserve Pending**: Local messages without server ID remain pending

### Example Scenarios

**Scenario 1: Message sent offline, then received via SSE**
- Local: `{ id: 'temp_123', text: 'Hello', createdAt: '10:00' }`
- Server: `{ id: 'server_456', text: 'Hello', createdAt: '10:00' }`
- Resolution: Use server version (has ID)

**Scenario 2: Local message newer than server**
- Local: `{ id: 'temp_123', text: 'Hello', createdAt: '10:05' }`
- Server: `{ id: 'server_456', text: 'Hello', createdAt: '10:00' }`
- Resolution: Use local (newer timestamp)

**Scenario 3: Timestamps equal**
- Local: `{ id: 'temp_123', text: 'Hello', createdAt: '10:00' }`
- Server: `{ id: 'server_456', text: 'Hello', createdAt: '10:00' }`
- Resolution: Use server (priority rule)

## Implementation

### 1. Queue Outgoing Message

```typescript
import { queueOutgoing } from '../services/offline';

// When sending message and offline
const queuedMessage: QueuedMessage = {
  id: 'temp_' + Date.now(),
  conversationId: 'conv_123',
  text: 'Hello!',
  senderId: 'user_456',
  createdAt: new Date().toISOString(),
  localTimestamp: new Date().toISOString(),
  retryCount: 0,
  status: 'queued',
};

await queueOutgoing(queuedMessage);
```

### 2. Flush Queue on Reconnect

```typescript
import { subscribeToNetwork, flushQueue } from '../services/offline';

// Subscribe to network changes
useEffect(() => {
  const unsubscribe = subscribeToNetwork(async (isConnected) => {
    if (isConnected) {
      console.log('Network connected, flushing queue...');
      const result = await flushQueue();
      console.log(`Sent: ${result.success}, Failed: ${result.failed}`);
    }
  });

  return unsubscribe;
}, []);
```

### 3. Reconcile Messages

```typescript
import { reconcileMessages } from '../services/offline';

// After fetching messages from server
const serverMessages = await fetchMessages(conversationId);
const result = await reconcileMessages(conversationId, serverMessages);

console.log(`Merged: ${result.merged.length} messages`);
console.log(`Conflicts: ${result.conflicts.length}`);
```

## Integration Pattern

### Updated Message Sender Hook

```typescript
import { isOnline } from '../services/offline';
import { queueOutgoing } from '../services/offline';

const sendMessage = async (text: string) => {
  const online = await isOnline();
  
  if (!online) {
    // Queue for later
    await queueOutgoing({
      id: generateTempId(),
      conversationId,
      text,
      senderId,
      createdAt: new Date().toISOString(),
      localTimestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'queued',
    });
    
    // Update UI optimistically
    setMessages([optimisticMessage, ...messages]);
    return { success: false, queued: true };
  }
  
  // Send immediately
  return await sendToServer(text);
};
```

### Auto-Flush on Reconnect

```typescript
// In App.tsx or ChatScreen
useEffect(() => {
  const unsubscribe = subscribeToNetwork(async (isConnected) => {
    if (isConnected) {
      // Small delay to ensure connection is stable
      setTimeout(async () => {
        const result = await flushQueue();
        if (result.success > 0) {
          // Refresh conversation to show sent messages
          await loadConversation(conversationId);
        }
      }, 1000);
    }
  });

  return unsubscribe;
}, []);
```

### Reconcile on App Start

```typescript
// On app start or conversation open
useEffect(() => {
  const reconcile = async () => {
    if (await isOnline()) {
      // Fetch latest from server
      const serverMessages = await fetchMessages(conversationId);
      
      // Reconcile with local
      const result = await reconcileMessages(conversationId, serverMessages);
      
      // Update UI
      setMessages(result.merged.map(storedMessageToMessage));
    }
  };

  reconcile();
}, [conversationId]);
```

## API Functions

### `queueOutgoing(message: QueuedMessage)`
- Queues message for later sending
- Prevents duplicates
- Limits queue size (max 100)

### `flushQueue()`
- Sends all queued messages
- Retries failed messages (max 3 attempts)
- Returns success/failure counts

### `reconcileMessages(conversationId, serverMessages)`
- Merges local and server messages
- Resolves conflicts using strategy
- Returns merged messages and conflicts

## Error Handling

- **Queue Full**: Throws error if queue exceeds 100 messages
- **Max Retries**: Messages with 3+ failures are skipped
- **Network Errors**: Retries with exponential backoff
- **Reconciliation Errors**: Logs conflicts for manual review

## Storage

- **Queue**: Stored in AsyncStorage under `offline:outgoing_queue`
- **Messages**: Merged into conversation storage after reconciliation
- **Persistence**: Survives app restarts

## Testing

```typescript
// Test offline queue
await queueOutgoing(testMessage);
const queued = await getQueuedMessages();
expect(queued).toHaveLength(1);

// Test flush
await flushQueue();
const afterFlush = await getQueuedMessages();
expect(afterFlush).toHaveLength(0);

// Test reconciliation
const result = await reconcileMessages(convId, serverMessages);
expect(result.merged.length).toBeGreaterThan(0);
```

## Dependencies

Add to package.json:
```json
{
  "dependencies": {
    "@react-native-community/netinfo": "^11.0.0"
  }
}
```

Install:
```bash
npm install @react-native-community/netinfo
```

