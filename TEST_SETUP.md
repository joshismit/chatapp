# Test Setup Instructions

## 📦 Installation

### 1. Install Test Dependencies

```bash
npm install --save-dev \
  jest \
  @testing-library/react-native \
  @testing-library/jest-native \
  @types/jest \
  react-test-renderer \
  detox \
  jest-circus
```

### 2. Install Detox CLI (Global)

```bash
npm install -g detox-cli
```

### 3. iOS Setup (for Detox)

```bash
# Install applesimutils
brew tap wix/brew
brew install applesimutils
```

### 4. Android Setup (for Detox)

- Install Android Studio
- Set up an Android emulator (API 30+ recommended)
- Ensure `ANDROID_HOME` is set in your environment

---

## ⚙️ Configuration Files

### Jest Configuration

- `jest.config.js` - Main Jest configuration
- `jest.setup.js` - Test setup and mocks

### Detox Configuration

- `.detoxrc.js` - Detox configuration
- `e2e/jest.config.js` - E2E test Jest configuration

---

## 🧪 Running Tests

### Unit Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- MessageBubble.test.tsx
```

### E2E Tests

```bash
# Build iOS app for testing
npm run test:e2e:build:ios

# Run iOS E2E tests
npm run test:e2e:ios

# Build Android app for testing
npm run test:e2e:build:android

# Run Android E2E tests
npm run test:e2e:android
```

---

## 📝 Test Files

### Unit Tests

- `src/components/chat/__tests__/MessageBubble.test.tsx`
- `src/hooks/__tests__/useMessageSender.test.tsx`
- `src/services/sse/__tests__/sseService.test.ts`
- `src/services/storage/__tests__/storage.test.ts`

### E2E Tests

- `e2e/firstTest.e2e.ts` - Main E2E test scenarios

---

## 🔧 Troubleshooting

### Jest Issues

1. **Module not found errors:**
   - Clear Jest cache: `npm test -- --clearCache`
   - Check `transformIgnorePatterns` in `jest.config.js`

2. **AsyncStorage mock issues:**
   - Ensure `jest.setup.js` is properly configured
   - Check mock implementation matches your usage

### Detox Issues

1. **Build failures:**
   - Ensure Xcode/Android Studio is properly configured
   - Check device/emulator is running
   - Verify app binary path in `.detoxrc.js`

2. **Test timeouts:**
   - Increase `testTimeout` in `e2e/jest.config.js`
   - Check device performance

3. **Element not found:**
   - Add `testID` props to components
   - Use `waitFor` for async elements
   - Check element IDs match test expectations

---

## 📊 Coverage Reports

Coverage reports are generated in `coverage/` directory after running:

```bash
npm run test:coverage
```

Open `coverage/lcov-report/index.html` in a browser to view detailed coverage.

---

## ✅ Next Steps

1. Add `testID` props to components for E2E tests
2. Expand test coverage for edge cases
3. Add integration tests for complex flows
4. Set up CI/CD pipeline for automated testing

