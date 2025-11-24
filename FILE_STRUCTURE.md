# Chat App - File Structure

```
chatapp/
├── App.tsx                          # Main app entry point with navigation wrapper
├── app.json                         # Expo configuration
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── babel.config.js                  # Babel configuration
│
├── src/
│   ├── screens/                     # Screen components (full-page views)
│   │   ├── HomeScreen.tsx           # Main landing/home screen
│   │   ├── ChatListScreen.tsx       # List of all chat conversations
│   │   ├── ChatScreen.tsx           # Individual chat conversation view
│   │   ├── LoginScreen.tsx          # User authentication/login screen
│   │   ├── RegisterScreen.tsx       # User registration screen
│   │   ├── ProfileScreen.tsx        # User profile and settings
│   │   └── SettingsScreen.tsx       # App settings and preferences
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── common/                  # Generic reusable components
│   │   │   ├── Button.tsx           # Standard button component
│   │   │   ├── Input.tsx            # Text input field component
│   │   │   ├── Avatar.tsx           # User avatar/image component
│   │   │   ├── LoadingSpinner.tsx   # Loading indicator component
│   │   │   └── ErrorMessage.tsx     # Error display component
│   │   ├── chat/                    # Chat-specific components
│   │   │   ├── MessageBubble.tsx    # Individual message display bubble
│   │   │   ├── MessageList.tsx      # Scrollable list of messages
│   │   │   ├── ChatInput.tsx        # Message input bar with send button
│   │   │   ├── TypingIndicator.tsx  # Shows when user is typing
│   │   │   └── ChatHeader.tsx       # Chat screen header with user info
│   │   └── chat-list/               # Chat list components
│   │       ├── ChatListItem.tsx     # Single chat item in list
│   │       └── ChatListHeader.tsx   # Chat list screen header
│   │
│   ├── navigation/                  # Navigation configuration
│   │   ├── AppNavigator.tsx         # Main navigation container setup
│   │   ├── StackNavigator.tsx       # Stack navigation configuration
│   │   ├── TabNavigator.tsx         # Bottom tab navigation setup
│   │   └── navigationTypes.ts       # Navigation type definitions
│   │
│   ├── services/                    # API and external service integrations
│   │   ├── api/                     # API service layer
│   │   │   ├── client.ts            # Axios HTTP client configuration
│   │   │   ├── authService.ts       # Authentication API calls
│   │   │   ├── chatService.ts       # Chat/message API calls
│   │   │   └── userService.ts       # User profile API calls
│   │   ├── sse/                     # Server-Sent Events
│   │   │   ├── sseClient.ts         # SSE connection manager
│   │   │   └── sseHandlers.ts       # SSE event handlers
│   │   └── storage/                  # Local storage services
│   │       ├── asyncStorage.ts      # AsyncStorage wrapper utilities
│   │       └── storageKeys.ts       # Storage key constants
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.ts               # Authentication state and methods
│   │   ├── useChat.ts               # Chat messages and operations
│   │   ├── useSSE.ts                # SSE connection hook
│   │   ├── useDebounce.ts           # Debounce utility hook
│   │   └── useKeyboard.ts           # Keyboard visibility hook
│   │
│   ├── store/                       # State management (Redux/Zustand)
│   │   ├── index.ts                 # Store configuration and export
│   │   ├── slices/                  # Redux slices or Zustand stores
│   │   │   ├── authSlice.ts         # Authentication state slice
│   │   │   ├── chatSlice.ts         # Chat messages state slice
│   │   │   ├── userSlice.ts         # User profile state slice
│   │   │   └── uiSlice.ts            # UI state (loading, errors)
│   │   └── selectors/               # State selectors
│   │       ├── authSelectors.ts     # Auth state selectors
│   │       └── chatSelectors.ts     # Chat state selectors
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── index.ts                 # Central type exports
│   │   ├── user.ts                  # User-related types and interfaces
│   │   ├── chat.ts                  # Chat and message types
│   │   ├── api.ts                   # API request/response types
│   │   └── navigation.ts            # Navigation param types
│   │
│   └── utils/                       # Utility functions
│       ├── constants.ts             # App-wide constants
│       ├── helpers.ts               # General helper functions
│       ├── formatters.ts            # Date/time/formatters
│       └── validators.ts            # Input validation functions
│
├── assets/                          # Static assets
│   ├── images/                      # Image files
│   │   ├── logo.png                 # App logo
│   │   ├── icon.png                 # App icon
│   │   └── splash.png               # Splash screen image
│   ├── fonts/                       # Custom font files
│   └── icons/                       # Icon files
│
└── __tests__/                       # Test files (optional)
    ├── screens/
    ├── components/
    └── utils/
```

## Folder Responsibilities

- **screens/**: Full-page screen components that represent different routes/views in the app
- **components/**: Reusable UI components organized by feature (common, chat, chat-list)
- **navigation/**: React Navigation setup, navigators, and type definitions
- **services/**: API clients, SSE connections, and storage utilities for external integrations
- **hooks/**: Custom React hooks for shared logic and state management
- **store/**: Global state management (Redux slices or Zustand stores) and selectors
- **types/**: TypeScript interfaces, types, and enums for type safety
- **assets/**: Static files like images, fonts, and icons
- **utils/**: Helper functions, constants, formatters, and validators

