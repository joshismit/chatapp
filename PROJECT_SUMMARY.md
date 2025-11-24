# Expo + TypeScript Project Summary

## Shell Commands to Run Locally

### Initial Setup (if creating new project)
```bash
npx create-expo-app@latest chatapp --template blank-typescript
cd chatapp
```

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm start
```

### Run on Specific Platform
```bash
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web Browser
```

---

## package.json Dependencies Snippet

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-status-bar": "~1.12.1",
    "react": "18.2.0",
    "react-native": "0.74.5",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-native-async-storage/async-storage": "1.23.1",
    "axios": "^1.6.5",
    "eventsource": "^2.0.2",
    "react-native-gesture-handler": "~2.16.1",
    "react-native-reanimated": "~3.10.1",
    "react-native-safe-area-context": "4.10.5",
    "react-native-screens": "~3.31.1"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "typescript": "^5.1.3"
  }
}
```

---

## tsconfig.json Minimal Config

```json
{
  "compilerOptions": {
    "target": "esnext",
    "lib": ["esnext"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-native",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "noEmit": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

---

## App.tsx Content

```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#6200ee',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'Chat App' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

---

## Backend SSE Endpoint

Configured for: `https://example.com/sse`

Update this URL in your API service files when implementing SSE functionality.

---

## Project Structure

```
chatapp/
├── App.tsx                    # Main entry with React Navigation
├── src/
│   └── screens/
│       └── HomeScreen.tsx     # Placeholder Home screen
├── package.json               # All dependencies
├── tsconfig.json             # TypeScript config
├── app.json                  # Expo configuration
├── babel.config.js           # Babel config (includes Reanimated plugin)
└── .gitignore               # Git ignore rules
```

