# Production Code Examples

## 1. Memoized MessageBubble Component

See `src/components/chat/MessageBubble.optimized.tsx` for the full implementation.

**Key optimizations:**
- `React.memo()` with custom comparison function
- `useMemo()` for expensive calculations (status icons, styles)
- Prevents re-renders when parent updates but message props unchanged

**Usage:**
```typescript
import MessageBubble from '../components/chat/MessageBubble.optimized';

// In ChatScreen.tsx
const renderMessage = useCallback(
  ({ item }: { item: MessageWithDate }) => (
    <MessageBubble
      message={item}
      onRetry={handleRetryMessage}
      showDateSeparator={item.showDateSeparator}
      dateLabel={item.dateLabel}
    />
  ),
  [handleRetryMessage]
);
```

---

## 2. FlatList getItemLayout

See `src/utils/flatListOptimizations.ts` for the full implementation.

**Usage in ChatScreen:**
```typescript
import { getMessageItemLayout, CHAT_FLATLIST_PROPS } from '../utils/flatListOptimizations';

<FlatList
  ref={flatListRef}
  data={messagesWithDates}
  renderItem={renderMessage}
  keyExtractor={(item) => item.id}
  getItemLayout={getMessageItemLayout.bind(null, messagesWithDates)}
  removeClippedSubviews={true}
  initialNumToRender={15}
  maxToRenderPerBatch={10}
  windowSize={21}
  updateCellsBatchingPeriod={50}
  inverted
  // ... other props
/>
```

**Benefits:**
- Pre-calculates item positions for smooth scrolling
- Reduces layout calculations during scroll
- Improves performance for long lists

---

## 3. Debounced Storage Writes

See `src/utils/storageDebounce.ts` for the full implementation.

**Usage in useConversation hook:**
```typescript
import { debouncedSaveConversation, flushAllPendingWrites } from '../utils/storageDebounce';

// Replace direct saveConversation calls:
// await saveConversation(conversationId, storedMessages);

// With debounced version:
await debouncedSaveConversation(conversationId, storedMessages);

// For critical saves (e.g., on app close):
await debouncedSaveConversation(conversationId, storedMessages, true); // immediate

// On app background/close:
import { AppState } from 'react-native';
AppState.addEventListener('change', async (nextAppState) => {
  if (nextAppState === 'background' || nextAppState === 'inactive') {
    await flushAllPendingWrites();
  }
});
```

**Benefits:**
- Reduces storage I/O operations
- Batches rapid writes
- Improves battery life
- Prevents storage thrashing

---

## 4. SSE Connection Health & Background Policies

See `src/services/sse/sseService.optimized.ts` for the full implementation.

**Key features:**
- Heartbeat mechanism (30s intervals)
- Stale connection detection (60s without messages)
- Background disconnect (5s after app background)
- Automatic reconnect on foreground
- Health status monitoring

**Usage:**
```typescript
import { subscribeToSSE } from '../services/sse/sseService.optimized';

const subscription = subscribeToSSE({
  conversationId: 'conv123',
  token: 'auth_token',
  onMessage: (message) => {
    // Handle message
  },
  onHealthCheck: (isHealthy) => {
    if (!isHealthy) {
      console.warn('SSE connection unhealthy');
      // Show user notification or attempt reconnect
    }
  },
  onConnect: () => {
    console.log('SSE connected');
  },
  onDisconnect: () => {
    console.log('SSE disconnected');
  },
});

// Check health status
const health = subscription.getHealthStatus();
console.log('Connection healthy:', health.isHealthy);
console.log('Last message:', health.lastMessageTime);

// Cleanup on unmount
useEffect(() => {
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

**Background behavior:**
- Automatically disconnects 5 seconds after app goes to background
- Reconnects when app comes to foreground
- Respects battery optimization settings
- Reduces battery drain

---

## 5. Complete Optimized ChatScreen Example

```typescript
import React, { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import { FlatList, AppState, AppStateStatus } from 'react-native';
import MessageBubble from '../components/chat/MessageBubble.optimized';
import { getMessageItemLayout, CHAT_FLATLIST_PROPS } from '../utils/flatListOptimizations';
import { flushAllPendingWrites } from '../utils/storageDebounce';

export default function ChatScreen() {
  const flatListRef = useRef<FlatList>(null);
  const { messages, sendMessage, retryMessage, loadOlder } = useConversation({
    conversationId: 'conv123',
    senderId: 'user1',
  });

  // Memoized render function
  const renderMessage = useCallback(
    ({ item }: { item: MessageWithDate }) => (
      <MessageBubble
        message={item}
        onRetry={retryMessage}
        showDateSeparator={item.showDateSeparator}
        dateLabel={item.dateLabel}
      />
    ),
    [retryMessage]
  );

  // Memoized key extractor
  const keyExtractor = useCallback((item: MessageWithDate) => item.id, []);

  // Memoized getItemLayout
  const getItemLayout = useMemo(
    () => getMessageItemLayout.bind(null, messagesWithDates),
    [messagesWithDates]
  );

  // Flush pending writes on app background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        await flushAllPendingWrites();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <FlatList
      ref={flatListRef}
      data={messagesWithDates}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={21}
      updateCellsBatchingPeriod={50}
      onEndReachedThreshold={0.5}
      onEndReached={loadOlder}
      inverted
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
      }}
    />
  );
}
```

---

## Performance Monitoring

Add performance markers to track improvements:

```typescript
import { PerformanceObserver } from 'react-native';

// Track FlatList render performance
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Performance:', entry.name, entry.duration);
  }
});

observer.observe({ entryTypes: ['measure']});

// Mark render start
performance.mark('render-start');

// ... render code ...

// Mark render end
performance.mark('render-end');
performance.measure('render-duration', 'render-start', 'render-end');
```

---

## Migration Checklist

1. **Replace MessageBubble:**
   - [ ] Copy `MessageBubble.optimized.tsx` to replace current component
   - [ ] Test message rendering
   - [ ] Verify memoization works (check React DevTools)

2. **Add getItemLayout:**
   - [ ] Import `getMessageItemLayout` in ChatScreen
   - [ ] Add `getItemLayout` prop to FlatList
   - [ ] Test scroll performance

3. **Implement debounced storage:**
   - [ ] Replace `saveConversation` calls with `debouncedSaveConversation`
   - [ ] Add `flushAllPendingWrites` on app background
   - [ ] Monitor storage write frequency

4. **Upgrade SSE service:**
   - [ ] Replace `sseService.ts` with `sseService.optimized.ts`
   - [ ] Add health check callbacks
   - [ ] Test background disconnect behavior
   - [ ] Monitor connection health

5. **Add FlatList optimizations:**
   - [ ] Add `removeClippedSubviews`
   - [ ] Set `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`
   - [ ] Test with large message lists

6. **Performance testing:**
   - [ ] Test with 100+ messages
   - [ ] Test scroll performance
   - [ ] Test background/foreground transitions
   - [ ] Monitor memory usage
   - [ ] Check battery impact

