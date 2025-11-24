# Web Blank Screen Troubleshooting

## Issue: Blank white screen at localhost:8082

### Quick Fixes

1. **Check Browser Console for Errors**
   - Open Developer Tools (F12)
   - Check Console tab for JavaScript errors
   - Check Network tab for failed requests

2. **Clear Cache and Restart**
   ```bash
   # Stop the server (Ctrl+C)
   # Clear cache
   npx expo start --clear
   # Or
   npm start -- --clear
   ```

3. **Check if Port is Correct**
   - The app should be running on port 8081 by default
   - If you see 8082, there might be a port conflict
   - Try: `npx expo start --web --port 8081`

4. **Verify Dependencies**
   ```bash
   npm install
   ```

### Common Causes

#### 1. JavaScript Error
- **Symptom**: Blank screen, errors in console
- **Fix**: Check browser console for the error
- **Common errors**:
  - Module not found
  - Navigation errors
  - Hook errors

#### 2. Missing Web Dependencies
- **Symptom**: Module not found errors
- **Fix**: 
  ```bash
  npm install react-native-web react-dom
  ```

#### 3. Navigation Error
- **Symptom**: Navigation-related errors
- **Fix**: Check if all screens are properly imported

#### 4. AsyncStorage on Web
- **Symptom**: AsyncStorage errors
- **Fix**: AsyncStorage should work on web, but check for errors

### Debug Steps

1. **Add Error Boundary** (Already added in App.tsx)
   - This will catch React errors and display them

2. **Check Network Tab**
   - Ensure all JS bundles are loading
   - Check for 404 errors

3. **Check Console**
   - Look for:
     - Red error messages
     - Failed imports
     - Navigation warnings

4. **Test with Simple Component**
   - Temporarily replace AppNavigator with a simple View to test if React is working

### Quick Test

Replace `App.tsx` temporarily with:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Hello World - If you see this, React is working!</Text>
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
});
```

If this works, the issue is in navigation or components.

### Check These Files

1. `src/navigation/index.tsx` - Navigation setup
2. `src/screens/ChatListScreen.tsx` - First screen
3. Browser console - For actual errors

### Next Steps

1. Open browser console (F12)
2. Look for red error messages
3. Share the error message for further debugging

