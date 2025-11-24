# Test Quick Reference

## 🚀 Quick Commands

```bash
# Unit Tests
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage

# E2E Tests (iOS)
npm run test:e2e:build:ios  # Build first
npm run test:e2e:ios        # Run tests

# E2E Tests (Android)
npm run test:e2e:build:android  # Build first
npm run test:e2e:android         # Run tests
```

---

## 📁 Test Files Created

### Unit Tests

| File | Tests |
|------|-------|
| `src/components/chat/__tests__/MessageBubble.test.tsx` | Message rendering, status icons, retry button |
| `src/hooks/__tests__/useMessageSender.test.tsx` | sendMessage flow, optimistic updates, retry |
| `src/services/sse/__tests__/sseService.test.ts` | SSE connection, message events, error handling |
| `src/services/storage/__tests__/storage.test.ts` | AsyncStorage operations |

### E2E Tests

| File | Tests |
|------|-------|
| `e2e/firstTest.e2e.ts` | Send message, receive via SSE, archive, pagination |

---

## 🧪 Test Examples

### MessageBubble Test

```typescript
it('renders sent message correctly', () => {
  render(<MessageBubble message={mockMessage} />);
  expect(screen.getByText('Hello, world!')).toBeTruthy();
});
```

### sendMessage Test

```typescript
it('sends message and updates status', async () => {
  mockMessageService.sendMessage.mockResolvedValue(mockResponse);
  await act(async () => {
    await result.current.sendMessage('Test');
  });
  expect(mockMessageService.sendMessage).toHaveBeenCalled();
});
```

### SSE Test

```typescript
it('handles new message events', () => {
  const onMessage = jest.fn();
  subscribeToSSE({ conversationId: 'conv_1', onMessage });
  // Simulate event...
  expect(onMessage).toHaveBeenCalled();
});
```

### E2E Test

```typescript
it('should send a message', async () => {
  await element(by.id('chat-input')).typeText('Hello');
  await element(by.id('send-button')).tap();
  await expect(element(by.text('Hello'))).toBeVisible();
});
```

---

## 🔍 Test Coverage Goals

- **Components**: 80%+
- **Hooks**: 85%+
- **Services**: 90%+
- **Utils**: 85%+

---

## 📝 Adding testID Props

For E2E tests, add `testID` to components:

```typescript
<TouchableOpacity testID="send-button">
  <Ionicons name="send" />
</TouchableOpacity>

<TextInput testID="chat-input" />

<FlatList testID="chat-messages-list" />
```

---

## ✅ Checklist

- [x] Jest configuration
- [x] Test setup with mocks
- [x] MessageBubble tests
- [x] sendMessage flow tests
- [x] SSE event handling tests
- [x] Storage service tests
- [x] E2E test scenarios
- [x] Detox configuration
- [ ] Add testID props to components (TODO)
- [ ] CI/CD integration (TODO)

