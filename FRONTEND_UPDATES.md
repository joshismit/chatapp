# Frontend Updates Documentation

## 📋 Overview

Frontend has been updated to match the new backend structure with:
- Registration (phone/email)
- OTP Login (phone/email)
- QR Code Login
- Chat functionality
- Online status
- Typing indicators
- Message status tracking
- Logout

## 🔄 Updated Services

### 1. **Registration Service** (`src/services/api/registrationService.ts`) - NEW

**Functions:**
- `checkAvailability(phoneNumber?, email?)` - Check if phone/email is available
- `generateRegistrationOTP(request)` - Generate OTP for registration
- `verifyRegistrationOTP(request)` - Verify OTP and complete registration

**Usage:**
```typescript
import { 
  checkAvailability, 
  generateRegistrationOTP, 
  verifyRegistrationOTP 
} from '../services/api/registrationService';

// Check availability
const availability = await checkAvailability('+1234567890');

// Generate OTP
const otpResponse = await generateRegistrationOTP({ 
  phoneNumber: '+1234567890' 
});

// Verify and register
const registerResponse = await verifyRegistrationOTP({
  phoneNumber: '+1234567890',
  otp: '123456',
  displayName: 'John Doe'
});
```

---

### 2. **Login Service** (`src/services/api/loginService.ts`) - UPDATED

**New Functions:**
- `generateOTPForLogin(request)` - Generate OTP for login (phone/email)
- `verifyOTPForLogin(request)` - Verify OTP and login
- `generateQRCode()` - Generate QR code for desktop
- `checkQRStatus(qrToken)` - Check QR code status (polling)
- `scanQRCode(request)` - Scan QR code (mobile)
- `verifyQRCode(request)` - Verify QR code (mobile)
- `logout()` - Logout user

**Updated:**
- `loginWithToken(token)` - Legacy token login (kept for backward compatibility)

**Usage:**
```typescript
import { 
  generateOTPForLogin, 
  verifyOTPForLogin,
  logout 
} from '../services/api/loginService';

// OTP Login
const otpResponse = await generateOTPForLogin({ 
  phoneNumber: '+1234567890' 
});
const loginResponse = await verifyOTPForLogin({
  phoneNumber: '+1234567890',
  otp: '123456'
});

// Logout
await logout();
```

---

### 3. **Conversation Service** (`src/services/api/conversationService.ts`) - UPDATED

**Updated Endpoints:**
- `getOrCreateConversation(otherUserId)` - POST `/api/chat/conversations`
- `getConversations(limit, offset)` - GET `/api/chat/conversations`
- `getConversation(conversationId)` - GET `/api/chat/conversations/:id`

**Usage:**
```typescript
import { 
  getOrCreateConversation, 
  getConversations 
} from '../services/api/conversationService';

// Get or create conversation
const conversation = await getOrCreateConversation('user2');

// Get all conversations
const conversations = await getConversations(50, 0);
```

---

### 4. **Message Service** (`src/services/api/messageService.ts`) - UPDATED

**Updated Endpoints:**
- `sendMessage(request)` - POST `/api/chat/messages`
- `getMessages(conversationId, limit, offset, before)` - GET `/api/chat/conversations/:id/messages`
- `updateMessageStatus(messageId, status)` - PUT `/api/chat/messages/:id/status`
- `markConversationAsRead(conversationId)` - POST `/api/chat/conversations/:id/read`

**Usage:**
```typescript
import { 
  sendMessage, 
  getMessages,
  updateMessageStatus,
  markConversationAsRead 
} from '../services/api/messageService';

// Send message
const message = await sendMessage({
  conversationId: 'conv_123',
  text: 'Hello!',
  type: 'text'
});

// Get messages
const messages = await getMessages('conv_123', 50, 0);

// Update status
await updateMessageStatus('msg_123', 'read');

// Mark as read
await markConversationAsRead('conv_123');
```

---

### 5. **Status Service** (`src/services/api/statusService.ts`) - NEW

**Functions:**
- `updateOnlineStatus(isOnline)` - Update user online status
- `getUserStatus(userId)` - Get user status
- `setTypingIndicator(conversationId, isTyping)` - Set typing indicator
- `getTypingIndicators(conversationId)` - Get typing indicators

**Usage:**
```typescript
import { 
  updateOnlineStatus,
  getUserStatus,
  setTypingIndicator,
  getTypingIndicators 
} from '../services/api/statusService';

// Update online status
await updateOnlineStatus(true);

// Get user status
const status = await getUserStatus('user2');

// Set typing
await setTypingIndicator('conv_123', true);

// Get typing indicators
const typing = await getTypingIndicators('conv_123');
```

---

## 📝 Updated Types

### User Type
```typescript
export interface User {
  id: string;
  userId: string; // Backend uses userId
  displayName?: string;
  avatar?: string | null; // Backend uses avatar
  email?: string;
  phoneNumber?: string;
  isOnline?: boolean;
  lastSeen?: string;
  status?: string;
  isRegistered?: boolean;
  registrationMethod?: 'phone' | 'email' | 'qr';
}
```

### ServerMessage Type
```typescript
export interface ServerMessage {
  messageId: string; // Backend uses messageId
  conversationId: string;
  text: string;
  senderId: string;
  sender?: {
    userId: string;
    displayName: string;
    avatar?: string | null;
  };
  type?: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string | null;
  reactions?: Array<{...}>;
  createdAt: string;
  updatedAt?: string;
}
```

---

## 🎯 API Endpoint Mapping

| Frontend Service | Backend Endpoint | Method |
|-----------------|------------------|--------|
| `checkAvailability` | `/api/register/check-availability` | GET |
| `generateRegistrationOTP` | `/api/register/generate-otp` | POST |
| `verifyRegistrationOTP` | `/api/register/verify-otp` | POST |
| `generateOTPForLogin` | `/api/otp/generate` | POST |
| `verifyOTPForLogin` | `/api/otp/verify` | POST |
| `generateQRCode` | `/api/qr/generate` | POST |
| `checkQRStatus` | `/api/qr/status/:qrToken` | GET |
| `scanQRCode` | `/api/qr/scan` | POST |
| `verifyQRCode` | `/api/qr/verify` | POST |
| `logout` | `/api/auth/logout` | POST |
| `getOrCreateConversation` | `/api/chat/conversations` | POST |
| `getConversations` | `/api/chat/conversations` | GET |
| `getConversation` | `/api/chat/conversations/:id` | GET |
| `sendMessage` | `/api/chat/messages` | POST |
| `getMessages` | `/api/chat/conversations/:id/messages` | GET |
| `updateMessageStatus` | `/api/chat/messages/:id/status` | PUT |
| `markConversationAsRead` | `/api/chat/conversations/:id/read` | POST |
| `updateOnlineStatus` | `/api/chat/status/online` | PUT |
| `getUserStatus` | `/api/chat/users/:id/status` | GET |
| `setTypingIndicator` | `/api/chat/typing` | POST |
| `getTypingIndicators` | `/api/chat/conversations/:id/typing` | GET |

---

## 🔧 Configuration

### API Base URL

The API client is configured in `src/services/api/client.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3000'; // Update for production
```

**For Production:**
- Update to your production backend URL
- For mobile devices, use your computer's IP address (e.g., `http://192.168.1.100:3000`)
- For web, use `http://localhost:3000` or your deployed URL

### Authentication

All authenticated endpoints automatically include the Bearer token:

```typescript
// Token is automatically added from AsyncStorage
Authorization: Bearer <token>
```

---

## 📱 Screen Updates Needed

### 1. **Login Screen** (`src/screens/LoginScreen.tsx`)

**Current:** Only supports QR code login  
**Needed:** Add OTP login option (phone/email)

**Suggested Flow:**
- Tab 1: OTP Login (phone/email)
- Tab 2: QR Code Login (existing)

---

### 2. **Registration Screen** (NEW - needs to be created)

**Features:**
- Phone number or email input
- OTP generation
- OTP verification
- Display name input
- Registration completion

---

### 3. **Chat List Screen** (`src/screens/ChatListScreen.tsx`)

**Update:**
- Use new `getConversations()` endpoint
- Handle new response structure
- Show online status
- Show unread counts

---

### 4. **Chat Screen** (`src/screens/ChatScreen.tsx`)

**Update:**
- Use new `sendMessage()` endpoint
- Use new `getMessages()` endpoint
- Implement typing indicators
- Update message status
- Mark as read functionality

---

### 5. **Settings Screen** (`src/screens/SettingsScreen.tsx`)

**Add:**
- Logout button (use `logout()` service)
- Online status toggle
- User profile display

---

## 🔄 Migration Guide

### Step 1: Update API Client

✅ Already done - `client.ts` is configured correctly

### Step 2: Update Service Imports

**Old:**
```typescript
import { getConversations } from '../services/api/conversationService';
```

**New:**
```typescript
import { getConversations } from '../services/api/conversationService';
// Same, but response structure changed
```

### Step 3: Update Response Handling

**Old:**
```typescript
const response = await getConversations(userId);
const conversations = response.conversations;
```

**New:**
```typescript
const response = await getConversations(50, 0);
if (response.success) {
  const conversations = response.conversations;
  // conversations structure updated
}
```

### Step 4: Update Message Handling

**Old:**
```typescript
const message = {
  id: 'msg_123',
  text: 'Hello',
  senderId: 'user1',
  createdAt: '2024-01-15T10:30:00.000Z',
  status: 'sent'
};
```

**New:**
```typescript
const message = {
  messageId: 'msg_123', // Changed from id
  text: 'Hello',
  senderId: 'user1',
  sender: { userId: 'user1', displayName: 'John' }, // Added sender info
  type: 'text', // Added type
  createdAt: '2024-01-15T10:30:00.000Z',
  status: 'sent'
};
```

---

## ✅ Checklist

- [x] Registration service created
- [x] Login service updated (OTP + QR)
- [x] Conversation service updated
- [x] Message service updated
- [x] Status service created
- [x] Types updated
- [x] API client configured
- [ ] Login screen updated (needs OTP UI)
- [ ] Registration screen created
- [ ] Chat list screen updated
- [ ] Chat screen updated
- [ ] Settings screen updated (logout)

---

## 🚀 Next Steps

1. **Create Registration Screen**
   - Phone/email input
   - OTP flow
   - Display name input

2. **Update Login Screen**
   - Add OTP login option
   - Keep QR code option

3. **Update Chat Screens**
   - Use new endpoints
   - Handle new response structures
   - Add typing indicators
   - Add online status

4. **Add Logout**
   - Add logout button to settings
   - Clear storage on logout

5. **Test Integration**
   - Test registration flow
   - Test OTP login
   - Test QR login
   - Test chat functionality
   - Test message status
   - Test typing indicators
   - Test online status
   - Test logout

---

## 📚 Example Usage

### Complete Registration Flow

```typescript
import { 
  checkAvailability,
  generateRegistrationOTP,
  verifyRegistrationOTP 
} from '../services/api/registrationService';

// Step 1: Check availability
const availability = await checkAvailability('+1234567890');
if (!availability.available) {
  // User exists, show login option
}

// Step 2: Generate OTP
const otpResponse = await generateRegistrationOTP({ 
  phoneNumber: '+1234567890' 
});
// Show OTP input (in dev, OTP is in response.otp)

// Step 3: Verify and register
const registerResponse = await verifyRegistrationOTP({
  phoneNumber: '+1234567890',
  otp: '123456',
  displayName: 'John Doe'
});

// Step 4: User needs to login after registration
if (registerResponse.action === 'login') {
  // Navigate to login screen
}
```

### Complete Login Flow

```typescript
import { 
  generateOTPForLogin,
  verifyOTPForLogin 
} from '../services/api/loginService';

// Step 1: Generate OTP
const otpResponse = await generateOTPForLogin({ 
  phoneNumber: '+1234567890' 
});

// Step 2: Verify OTP
const loginResponse = await verifyOTPForLogin({
  phoneNumber: '+1234567890',
  otp: '123456'
});

// Step 3: Token stored automatically, navigate to chat
if (loginResponse.success) {
  // Navigate to chat list
}
```

### Complete Chat Flow

```typescript
import { 
  getOrCreateConversation,
  sendMessage,
  getMessages,
  setTypingIndicator,
  updateOnlineStatus 
} from '../services/api';

// Step 1: Set online status
await updateOnlineStatus(true);

// Step 2: Get or create conversation
const conversation = await getOrCreateConversation('user2');

// Step 3: Get messages
const messagesResponse = await getMessages(
  conversation.conversation.conversationId,
  50,
  0
);

// Step 4: Send message
const messageResponse = await sendMessage({
  conversationId: conversation.conversation.conversationId,
  text: 'Hello!',
  type: 'text'
});

// Step 5: Set typing indicator
await setTypingIndicator(conversation.conversation.conversationId, true);
// ... user types ...
await setTypingIndicator(conversation.conversation.conversationId, false);
```

---

## 🔍 Testing

### Test Registration
1. Check availability
2. Generate OTP
3. Verify OTP with display name
4. Verify user needs to login

### Test Login
1. Generate OTP
2. Verify OTP
3. Verify token stored
4. Verify user can access chat

### Test Chat
1. Create conversation
2. Send message
3. Get messages
4. Update message status
5. Test typing indicators
6. Test online status

---

## 📝 Notes

- All services use the same API client with automatic token injection
- Token is stored in AsyncStorage after login
- Token is automatically included in all authenticated requests
- Error handling is consistent across all services
- Response structures match backend exactly

The frontend services are now fully updated and ready to use with the new backend!

