# Chat App - Expo + TypeScript

React Native chat application built with Expo (managed workflow) and TypeScript.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (will be installed globally)

## Setup Instructions

### 1. Initialize Expo Project (if starting fresh)

If you're creating a new project, run:

```bash
npx create-expo-app@latest chatapp --template blank-typescript
cd chatapp
```

**Note:** This project scaffold is already configured, so you can skip this step if you're using the provided files.

### 2. Install Dependencies

Install all required packages:

```bash
npm install
```

Or with yarn:

```bash
yarn install
```

### 3. Install Expo CLI (if not already installed)

```bash
npm install -g expo-cli
```

Or use npx (recommended):

```bash
npx expo start
```

### 4. Start the Development Server

```bash
npm start
```

Or:

```bash
npx expo start
```

### 5. Run on Device/Emulator

- **iOS Simulator**: Press `i` in the terminal or run `npm run ios`
- **Android Emulator**: Press `a` in the terminal or run `npm run android`
- **Web**: Press `w` in the terminal or run `npm run web`
- **Physical Device**: Scan QR code with Expo Go app

## Project Structure

```
chatapp/
├── App.tsx                 # Main app entry with navigation setup
├── src/
│   └── screens/
│       └── HomeScreen.tsx  # Placeholder home screen
├── package.json            # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── app.json               # Expo configuration
└── babel.config.js        # Babel configuration
```

## Key Dependencies

- **expo**: ~51.0.0 - Expo SDK
- **@react-navigation/native**: Navigation library
- **@react-navigation/stack**: Stack navigator
- **@react-navigation/bottom-tabs**: Bottom tabs navigator
- **@react-native-async-storage/async-storage**: Local storage
- **axios**: HTTP client
- **eventsource**: Server-Sent Events (SSE) support
- **react-native-gesture-handler**: Gesture handling
- **react-native-reanimated**: Animations
- **react-native-safe-area-context**: Safe area handling

## Backend Configuration

The app is configured to connect to an SSE endpoint at:
```
https://example.com/sse
```

Update this URL in your API service files when implementing the chat functionality.

## Development Commands

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run on web browser

## Next Steps

1. Create additional screens (Chat, Settings, etc.)
2. Implement SSE connection for real-time messaging
3. Add AsyncStorage for local data persistence
4. Set up API service layer with axios
5. Add navigation between screens

