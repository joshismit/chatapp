# Frontend Code Structure

## 📁 Folder Organization

The frontend codebase follows React Native/Expo best practices with a clear separation of concerns.

```
src/
├── app/                      # Application-level configuration
│   ├── config/              # App configuration files
│   │   └── api.ts           # API configuration (base URL, endpoints)
│   └── constants/           # Application constants
│       └── index.ts         # All constants (storage keys, colors, etc.)
│
├── assets/                  # Static assets (images, fonts, etc.)
│
├── components/              # Reusable UI components
│   ├── common/             # Common/shared components
│   │   ├── ErrorBoundary.tsx
│   │   └── index.ts
│   ├── chat/               # Chat-specific components
│   │   ├── ChatInput.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── index.ts
│   ├── chat-list/          # Chat list components
│   │   ├── ChatItem.tsx
│   │   └── index.ts
│   └── index.ts            # Central component exports
│
├── screens/                 # Screen components
│   ├── auth/              # Authentication screens
│   │   ├── LoginScreen.tsx
│   │   └── index.ts
│   ├── chat/              # Chat screens
│   │   ├── ChatListScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   └── index.ts
│   ├── settings/          # Settings screens
│   │   ├── SettingsScreen.tsx
│   │   └── index.ts
│   └── index.ts           # Central screen exports
│
├── navigation/            # Navigation setup
│   ├── index.tsx         # Navigation configuration
│   └── navigationTypes.ts # Navigation types (moved to types/navigation.ts)
│
├── hooks/                # Custom React hooks
│   ├── useConversation.ts
│   ├── useMessageSender.ts
│   └── useSettings.ts
│
├── services/             # Business logic and API services
│   ├── api/             # API services
│   │   ├── client.ts    # Axios client configuration
│   │   ├── registrationService.ts
│   │   ├── loginService.ts
│   │   ├── conversationService.ts
│   │   ├── messageService.ts
│   │   ├── statusService.ts
│   │   ├── seedService.ts
│   │   └── index.ts
│   ├── storage/         # Local storage services
│   │   ├── storage.ts
│   │   └── messageStatus.ts
│   ├── offline/        # Offline handling
│   │   ├── offlineQueue.ts
│   │   ├── queueFlusher.ts
│   │   ├── networkMonitor.ts
│   │   ├── messageReconciliation.ts
│   │   └── index.ts
│   ├── sse/            # Server-Sent Events
│   │   ├── sseService.ts
│   │   └── index.ts
│   └── settings.ts
│
├── types/               # TypeScript type definitions
│   ├── auth.ts         # Authentication types
│   ├── chat.ts         # Chat-related types
│   ├── common.ts       # Common types (SSE, network, etc.)
│   ├── navigation.ts   # Navigation types
│   └── index.ts        # Central type exports
│
├── utils/              # Utility functions
│   ├── dateFormatter.ts
│   ├── messageConverter.ts
│   ├── flatListOptimizations.ts
│   ├── storageDebounce.ts
│   └── seedDataHelper.ts
│
└── i18n/              # Internationalization
    ├── index.ts
    └── locales/
        ├── en.ts
        └── es.ts
```

## 📋 Key Principles

### 1. **Separation of Concerns**
- **Components**: Pure UI components, no business logic
- **Screens**: Screen-level components that compose components
- **Services**: Business logic and API calls
- **Hooks**: Reusable stateful logic
- **Utils**: Pure utility functions
- **Types**: TypeScript type definitions

### 2. **Feature-Based Organization**
- Screens and components are organized by feature (auth, chat, settings)
- Related files are grouped together
- Easy to find and maintain related code

### 3. **Index Files for Clean Imports**
- Each folder has an `index.ts` file for clean imports
- Example: `import { LoginScreen } from '../screens/auth'` instead of `'../screens/auth/LoginScreen'`

### 4. **Configuration Management**
- All configuration in `app/config/`
- All constants in `app/constants/`
- Easy to update and maintain

### 5. **Type Safety**
- Types organized by domain (auth, chat, common, navigation)
- Central export from `types/index.ts`
- Full TypeScript support throughout

## 🔄 Import Patterns

### Before (Old Structure)
```typescript
import LoginScreen from '../screens/LoginScreen';
import { getConversations } from '../services/api/conversationService';
import { User } from '../types/types';
```

### After (New Structure)
```typescript
import { LoginScreen } from '../screens/auth';
import { getConversations } from '../services/api';
import { User } from '../types';
import { STORAGE_KEYS } from '../app/constants';
```

## 📝 File Naming Conventions

- **Components**: PascalCase (e.g., `MessageBubble.tsx`)
- **Screens**: PascalCase (e.g., `LoginScreen.tsx`)
- **Services**: camelCase (e.g., `loginService.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useConversation.ts`)
- **Utils**: camelCase (e.g., `dateFormatter.ts`)
- **Types**: camelCase (e.g., `auth.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `STORAGE_KEYS`)

## 🎯 Best Practices

### 1. **Component Organization**
- Keep components small and focused
- Extract reusable logic into hooks
- Use index files for clean exports

### 2. **Service Organization**
- One service per domain (auth, chat, etc.)
- Keep API calls in service files
- Handle errors consistently

### 3. **Type Organization**
- Group related types together
- Use interfaces for objects, types for unions
- Export from central index

### 4. **Constants Management**
- All constants in `app/constants/`
- Use const assertions for type safety
- Group related constants together

## 🚀 Migration Guide

### Updating Imports

1. **Screens**:
   ```typescript
   // Old
   import LoginScreen from '../screens/LoginScreen';
   
   // New
   import { LoginScreen } from '../screens/auth';
   ```

2. **Components**:
   ```typescript
   // Old
   import ErrorBoundary from '../components/ErrorBoundary';
   
   // New
   import { ErrorBoundary } from '../components/common';
   ```

3. **Services**:
   ```typescript
   // Old
   import { getConversations } from '../services/api/conversationService';
   
   // New
   import { getConversations } from '../services/api';
   ```

4. **Types**:
   ```typescript
   // Old
   import { User, Message } from '../types/types';
   
   // New
   import { User } from '../types/auth';
   import { Message } from '../types/chat';
   // Or
   import { User, Message } from '../types';
   ```

5. **Constants**:
   ```typescript
   // Old
   const token = await AsyncStorage.getItem('authToken');
   
   // New
   import { STORAGE_KEYS } from '../app/constants';
   const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
   ```

## ✅ Benefits

1. **Better Organization**: Easy to find files
2. **Scalability**: Easy to add new features
3. **Maintainability**: Clear structure, easy to maintain
4. **Type Safety**: Centralized types, better IntelliSense
5. **Clean Imports**: Index files make imports cleaner
6. **Consistency**: Standard structure across the project

## 📚 Next Steps

1. Move remaining screens to appropriate folders
2. Update all import paths
3. Create additional index files where needed
4. Add barrel exports for better tree-shaking
5. Consider adding feature-based modules for larger features

