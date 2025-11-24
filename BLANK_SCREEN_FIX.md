# Blank Screen Fix - util.inherits Error

## Problem
- Blank white screen at `localhost:8081`
- Console error: `Uncaught TypeError: util.inherits is not a function`
- 500 Internal Server Error

## Root Cause
The `eventsource` npm package (v2.0.2) is a Node.js package that uses Node.js-specific modules like `util.inherits`, which don't exist in the browser. When bundled for web, it tries to use Node.js utilities that aren't available.

## Solution Applied

### 1. Fixed SSE Service (`src/services/sse/sseService.ts`)
- Changed from static import to conditional require
- Uses browser's native `EventSource` API on web
- Only requires `eventsource` package on React Native (iOS/Android)
- Prevents Node.js modules from being bundled for web

### 2. Added Error Boundary (`src/components/ErrorBoundary.tsx`)
- Catches React errors and displays them instead of blank screen
- Helps debug future issues

### 3. Fixed App.tsx
- Made `GestureHandlerRootView` web-compatible
- Wrapped app in ErrorBoundary

## Next Steps

1. **Clear cache and restart:**
   ```bash
   # Stop current server (Ctrl+C)
   npx expo start --web --clear
   ```

2. **Check browser console:**
   - Open Developer Tools (F12)
   - Check if `util.inherits` error is gone
   - Look for any new errors

3. **If still blank:**
   - Check console for new errors
   - Verify the app loads (you should see the chat list)
   - Check Network tab for failed requests

## What Changed

### Before:
```typescript
import EventSource from 'eventsource'; // ❌ Bundled for web, causes util.inherits error
```

### After:
```typescript
function getEventSource() {
  if (Platform.OS === 'web') {
    return window.EventSource; // ✅ Browser's native API
  } else {
    return require('eventsource'); // ✅ Only for React Native
  }
}
```

## Testing

After restarting, you should see:
- ✅ No `util.inherits` error in console
- ✅ Chat list screen visible
- ✅ App loads successfully

If issues persist, check:
1. Browser console for new errors
2. Network tab for failed requests
3. That all dependencies are installed: `npm install`

