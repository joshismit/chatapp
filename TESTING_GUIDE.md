# Testing Guide

This guide covers unit tests (Jest + React Native Testing Library) and E2E tests (Detox) for the chat app.

## 📋 Table of Contents

1. [Unit Tests](#unit-tests)
2. [E2E Tests](#e2e-tests)
3. [Running Tests](#running-tests)
4. [Test Coverage](#test-coverage)

---

## 🧪 Unit Tests

### Setup

Install required dependencies:

```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native @types/jest
```

### Test Files Structure

```
src/
├── components/
│   └── chat/
│       └── __tests__/
│           └── MessageBubble.test.tsx
├── hooks/
│   └── __tests__/
│       └── useMessageSender.test.tsx
└── services/
    ├── sse/
    │   └── __tests__/
    │       └── sseService.test.ts
    └── storage/
        └── __tests__/
            └── storage.test.ts
```

### Running Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- MessageBubble.test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="sendMessage"
```

### Example Test: MessageBubble

```typescript
// src/components/chat/__tests__/MessageBubble.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import MessageBubble from '../MessageBubble';

describe('MessageBubble', () => {
  it('renders sent message correctly', () => {
    const message = {
      id: '1',
      text: 'Hello, world!',
      isSent: true,
      timestamp: '2:30 PM',
      status: 'sent',
    };

    render(<MessageBubble message={message} />);
    
    expect(screen.getByText('Hello, world!')).toBeTruthy();
  });
});
```

### Example Test: sendMessage Flow

```typescript
// src/hooks/__tests__/useMessageSender.test.tsx
import { renderHook, act } from '@testing-library/react-native';
import { useMessageSender } from '../useMessageSender';
import * as messageService from '../../services/api/messageService';
import * as storage from '../../services/storage';

jest.mock('../../services/api/messageService');
jest.mock('../../services/storage');

describe('useMessageSender', () => {
  it('sends message and updates status', async () => {
    const mockResponse = {
      messageId: 'msg_123',
      text: 'Test',
      senderId: 'user_1',
      createdAt: new Date().toISOString(),
    };

    messageService.sendMessage.mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      useMessageSender({
        conversationId: 'conv_1',
        senderId: 'user_1',
        onMessageUpdate: jest.fn(),
        currentMessages: [],
      })
    );

    await act(async () => {
      await result.current.sendMessage('Test');
    });

    expect(messageService.sendMessage).toHaveBeenCalled();
    expect(storage.saveConversation).toHaveBeenCalled();
  });
});
```

### Example Test: SSE Event Handling

```typescript
// src/services/sse/__tests__/sseService.test.ts
import { subscribeToSSE } from '../sseService';
import EventSource from 'eventsource';

jest.mock('eventsource');

describe('SSE Service', () => {
  it('handles new message events', () => {
    const onMessage = jest.fn();
    const subscription = subscribeToSSE({
      conversationId: 'conv_1',
      onMessage,
    });

    // Simulate message event
    const mockEvent = {
      data: JSON.stringify({
        id: 'msg_1',
        text: 'Hello',
        senderId: 'user_1',
        createdAt: new Date().toISOString(),
        status: 'sent',
      }),
    };

    // Trigger event
    // ... (implementation depends on your EventSource mock)

    expect(onMessage).toHaveBeenCalled();
    subscription.unsubscribe();
  });
});
```

---

## 🎭 E2E Tests (Detox)

### Setup

Install Detox:

```bash
npm install --save-dev detox jest-circus
```

For iOS:
```bash
brew tap wix/brew
brew install applesimutils
```

For Android:
- Install Android Studio and set up an emulator

### Configuration

Detox configuration is in `.detoxrc.js`. Update device configurations as needed.

### Test Files Structure

```
e2e/
├── jest.config.js
└── firstTest.e2e.ts
```

### Running E2E Tests

```bash
# Build and run iOS tests
detox build --configuration ios.sim.debug
detox test --configuration ios.sim.debug

# Build and run Android tests
detox build --configuration android.emu.debug
detox test --configuration android.emu.debug

# Run specific test file
detox test --configuration ios.sim.debug e2e/firstTest.e2e.ts
```

### Example E2E Test: Send Message

```typescript
// e2e/firstTest.e2e.ts
describe('Chat App E2E', () => {
  it('should send a message', async () => {
    // Open chat
    await element(by.id('chat-list-item-0')).tap();
    
    // Type message
    await element(by.id('chat-input')).typeText('Hello');
    
    // Send
    await element(by.id('send-button')).tap();
    
    // Verify
    await expect(element(by.text('Hello'))).toBeVisible();
  });
});
```

---

## 🚀 Running Tests

### Quick Start

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Run E2E tests (iOS)
detox build --configuration ios.sim.debug
detox test --configuration ios.sim.debug
```

### Package.json Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e:ios": "detox test --configuration ios.sim.debug",
    "test:e2e:android": "detox test --configuration android.emu.debug",
    "test:e2e:build:ios": "detox build --configuration ios.sim.debug",
    "test:e2e:build:android": "detox build --configuration android.emu.debug"
  }
}
```

---

## 📊 Test Coverage

### Generate Coverage Report

```bash
npm test -- --coverage
```

Coverage report will be generated in `coverage/` directory.

### Coverage Thresholds

Add to `jest.config.js`:

```javascript
module.exports = {
  // ... other config
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

---

## 🧩 Test Prompts

### For MessageBubble Component

1. **Rendering Tests:**
   - Renders sent message correctly
   - Renders received message correctly
   - Shows date separator when provided
   - Handles long text
   - Handles empty text

2. **Status Tests:**
   - Displays sending status
   - Displays sent status
   - Displays delivered status
   - Displays read status
   - Displays failed status with retry button

3. **Interaction Tests:**
   - Retry button calls onRetry callback
   - Accessibility labels are correct

### For sendMessage Flow

1. **Optimistic Updates:**
   - Creates optimistic message immediately
   - Updates UI before API call
   - Persists to storage

2. **Success Flow:**
   - Calls API with correct parameters
   - Updates message with server ID
   - Changes status to "sent"
   - Persists updated message

3. **Failure Flow:**
   - Handles API errors
   - Marks message as "failed"
   - Allows retry

4. **Retry Flow:**
   - Retries failed message
   - Updates status correctly
   - Handles retry failures

### For SSE Event Handling

1. **Connection:**
   - Creates EventSource with correct URL
   - Includes token in URL
   - Calls onConnect callback

2. **Message Events:**
   - Handles new message events
   - Parses JSON correctly
   - Calls onMessage callback
   - Handles invalid JSON

3. **Status Updates:**
   - Handles status update events
   - Calls onStatusUpdate callback
   - Updates correct message

4. **Error Handling:**
   - Handles connection errors
   - Implements reconnection logic
   - Calls onError callback

5. **Cleanup:**
   - Unsubscribes correctly
   - Closes EventSource connection

---

## ✅ Best Practices

1. **Mock External Dependencies:**
   - Mock AsyncStorage
   - Mock axios/API calls
   - Mock EventSource

2. **Test User Interactions:**
   - Use `fireEvent` for interactions
   - Test accessibility
   - Test error states

3. **Test Async Operations:**
   - Use `waitFor` for async updates
   - Use `act` for state updates
   - Test loading states

4. **E2E Test Scenarios:**
   - Test complete user flows
   - Test error recovery
   - Test offline scenarios

5. **Maintain Test Data:**
   - Use factories for test data
   - Keep mocks up to date
   - Clean up after tests

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://wix.github.io/Detox/)

