# Exact Setup Commands

## Step-by-Step Setup

### 1. Initialize Expo Project (TypeScript Template)

```bash
npx create-expo-app@latest chatapp --template blank-typescript
cd chatapp
```

**Note:** If you already have the project files, skip to step 2.

### 2. Install All Dependencies

```bash
npm install expo@~51.0.0 expo-status-bar@~1.12.1 react@18.2.0 react-native@0.74.5 @react-navigation/native@^6.1.9 @react-navigation/stack@^6.3.20 @react-navigation/bottom-tabs@^6.5.11 @react-native-async-storage/async-storage@1.23.1 axios@^1.6.5 eventsource@^2.0.2 react-native-gesture-handler@~2.16.1 react-native-reanimated@~3.10.1 react-native-safe-area-context@4.10.5 react-native-screens@~3.31.1
```

Or simply:

```bash
npm install
```

### 3. Install TypeScript Dev Dependencies

```bash
npm install --save-dev typescript@^5.1.3 @types/react@~18.2.45
```

### 4. Start Development Server

```bash
npm start
```

Or:

```bash
npx expo start
```

### 5. Run on Platform

- **iOS**: `npm run ios` or press `i` in terminal
- **Android**: `npm run android` or press `a` in terminal
- **Web**: `npm run web` or press `w` in terminal

## Alternative: One-Line Install (if package.json exists)

```bash
npm install && npm start
```

