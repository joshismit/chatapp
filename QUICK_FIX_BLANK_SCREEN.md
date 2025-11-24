# Quick Fix for Blank Screen

## Immediate Steps

### 1. Check Browser Console (MOST IMPORTANT)
1. Open `http://localhost:8082` in Chrome
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Look for **red error messages**
5. **Copy and share the error** - this will tell us exactly what's wrong

### 2. Common Errors and Fixes

#### Error: "Cannot find module" or "Module not found"
**Fix:**
```bash
npm install
npm start -- --clear
```

#### Error: "useSettings is not defined" or hook errors
**Fix:** The useSettings hook might be failing. Check if AsyncStorage is working.

#### Error: Navigation errors
**Fix:** Check if all screens are properly imported.

### 3. Test with Minimal App

Temporarily replace `App.tsx` with this to test:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World!</Text>
      <Text style={styles.subtext}>If you see this, React is working</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
});
```

**If this works:** The issue is in navigation/components
**If this doesn't work:** There's a deeper setup issue

### 4. Restart Development Server

```bash
# Stop current server (Ctrl+C)
# Clear cache and restart
npx expo start --web --clear
```

### 5. Check Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Refresh the page
4. Check if all files are loading (status 200)
5. Look for failed requests (status 404, 500, etc.)

## What to Share

When asking for help, please share:
1. **Browser console errors** (screenshot or copy text)
2. **Network tab errors** (any failed requests)
3. **What you see** (completely blank? any text? loading spinner?)

## Most Likely Issues

1. **JavaScript error** - Check console
2. **Missing dependency** - Run `npm install`
3. **Port conflict** - Try different port: `npx expo start --web --port 3000`
4. **Cache issue** - Clear cache: `npx expo start --web --clear`

