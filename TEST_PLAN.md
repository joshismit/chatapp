# Comprehensive Test Plan

## 🎯 Testing Overview

This document outlines the complete testing strategy for the Chat Application covering:
- Frontend UI functionality
- Backend API functionality
- Database connectivity and updates
- SSE (Server-Sent Events) implementation
- End-to-end user flow

---

## 📋 Test Checklist

### 1. Backend & Database Connection Tests

#### ✅ Test 1.1: Backend Server Startup
- [ ] Server starts without errors
- [ ] MongoDB connection established
- [ ] Health endpoint responds (`GET /health`)
- [ ] All routes are properly mounted

**Test Command:**
```bash
cd mock-backend
node server.js
```

**Expected Result:**
- Server runs on port 3000
- MongoDB connection successful
- All endpoints listed in console

---

#### ✅ Test 1.2: Database Connection
- [ ] MongoDB connection string is valid
- [ ] Database `chatapp_db` is accessible
- [ ] Collections are created automatically
- [ ] Indexes are created properly

**Test:**
```bash
# Check MongoDB connection
curl http://localhost:3000/health
```

---

### 2. Registration Flow Tests

#### ✅ Test 2.1: Check Phone/Email Availability
**Endpoint:** `GET /api/register/check-availability`

**Test Cases:**
1. Check available phone number
2. Check available email
3. Check existing phone number (should return unavailable)
4. Check existing email (should return unavailable)

**Test Script:**
```bash
# Available phone
curl -X GET "http://localhost:3000/api/register/check-availability?phoneNumber=%2B1234567890"

# Available email
curl -X GET "http://localhost:3000/api/register/check-availability?email=test@example.com"
```

---

#### ✅ Test 2.2: Generate Registration OTP
**Endpoint:** `POST /api/register/generate-otp`

**Test Cases:**
1. Generate OTP for phone
2. Generate OTP for email
3. Invalid phone format
4. Invalid email format

**Test Script:**
```bash
# Phone OTP
curl -X POST http://localhost:3000/api/register/generate-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'

# Email OTP
curl -X POST http://localhost:3000/api/register/generate-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Expected:**
- OTP generated (in dev mode, OTP returned in response)
- OTP expires in 5 minutes
- OTP stored in database

---

#### ✅ Test 2.3: Verify Registration OTP
**Endpoint:** `POST /api/register/verify-otp`

**Test Cases:**
1. Valid OTP → User created
2. Invalid OTP → Error
3. Expired OTP → Error
4. User already exists → Error

**Test Script:**
```bash
curl -X POST http://localhost:3000/api/register/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "otp": "123456",
    "displayName": "Test User"
  }'
```

**Expected:**
- User created in database
- `isRegistered: true`
- Response includes `action: "login"` (user needs to login)

---

### 3. Login Flow Tests

#### ✅ Test 3.1: OTP Login - Generate OTP
**Endpoint:** `POST /api/otp/generate`

**Test Cases:**
1. Generate OTP for registered user (phone)
2. Generate OTP for registered user (email)
3. Generate OTP for unregistered user → Error

**Test Script:**
```bash
curl -X POST http://localhost:3000/api/otp/generate \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

---

#### ✅ Test 3.2: OTP Login - Verify OTP
**Endpoint:** `POST /api/otp/verify`

**Test Cases:**
1. Valid OTP → Login successful, token assigned
2. Invalid OTP → Error
3. Expired OTP → Error
4. Unregistered user → Error with `action: "register"`

**Test Script:**
```bash
curl -X POST http://localhost:3000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "otp": "123456"
  }'
```

**Expected:**
- Token generated and stored in `AuthToken` collection
- User `isOnline: true`
- `lastSeen` updated
- Token returned in response

---

#### ✅ Test 3.3: QR Code Login - Generate QR
**Endpoint:** `POST /api/qr/generate`

**Test Cases:**
1. Generate QR code token
2. QR token expires in 5 minutes
3. QR token stored in database

**Test Script:**
```bash
curl -X POST http://localhost:3000/api/qr/generate \
  -H "Content-Type: application/json"
```

**Expected:**
- QR token generated
- Token stored in `QRCode` collection
- Expires in 5 minutes

---

#### ✅ Test 3.4: QR Code Login - Check Status
**Endpoint:** `GET /api/qr/status/:qrToken`

**Test Cases:**
1. Pending status (not scanned)
2. Scanned status (mobile scanned)
3. Verified status (mobile verified) → Token returned
4. Expired status

**Test Script:**
```bash
# Get QR token first, then check status
QR_TOKEN="qr_1234567890_abc123"
curl -X GET "http://localhost:3000/api/qr/status/${QR_TOKEN}"
```

---

#### ✅ Test 3.5: QR Code Login - Scan & Verify
**Endpoints:** `POST /api/qr/scan` and `POST /api/qr/verify`

**Test Cases:**
1. Scan QR code (requires auth token)
2. Verify QR code (requires auth token)
3. After verification, desktop receives token

**Test Script:**
```bash
# First login on mobile to get token
MOBILE_TOKEN="<token_from_mobile_login>"

# Scan QR
curl -X POST http://localhost:3000/api/qr/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MOBILE_TOKEN}" \
  -d '{"qrToken": "qr_1234567890_abc123"}'

# Verify QR
curl -X POST http://localhost:3000/api/qr/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MOBILE_TOKEN}" \
  -d '{"qrToken": "qr_1234567890_abc123"}'
```

---

### 4. Session & Profile Tests

#### ✅ Test 4.1: Token Verification
**Endpoint:** `GET /api/auth/verify`

**Test Cases:**
1. Valid token → User info returned
2. Invalid token → Error
3. Expired token → Error

**Test Script:**
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer <token>"
```

---

#### ✅ Test 4.2: Get User Profile
**Endpoint:** `GET /api/chat/users/:userId/status`

**Test Cases:**
1. Get own profile
2. Get other user's profile
3. Check online status
4. Check last seen

**Test Script:**
```bash
curl -X GET http://localhost:3000/api/chat/users/user_123/status \
  -H "Authorization: Bearer <token>"
```

---

#### ✅ Test 4.3: Update Online Status
**Endpoint:** `PUT /api/chat/status/online`

**Test Cases:**
1. Set online status to true
2. Set online status to false
3. Verify status updated in database

**Test Script:**
```bash
curl -X PUT http://localhost:3000/api/chat/status/online \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"isOnline": true}'
```

---

### 5. Chat Functionality Tests

#### ✅ Test 5.1: Create/Get Conversation
**Endpoint:** `POST /api/chat/conversations`

**Test Cases:**
1. Create new conversation
2. Get existing conversation
3. Conversation ID is consistent for same users

**Test Script:**
```bash
curl -X POST http://localhost:3000/api/chat/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"otherUserId": "user_456"}'
```

**Expected:**
- Conversation created in database
- Both users in participants array
- Conversation ID format: `conv_user1_user2`

---

#### ✅ Test 5.2: Get All Conversations
**Endpoint:** `GET /api/chat/conversations`

**Test Cases:**
1. Get conversations for logged-in user
2. Pagination works
3. Unread counts are correct

**Test Script:**
```bash
curl -X GET "http://localhost:3000/api/chat/conversations?limit=50&offset=0" \
  -H "Authorization: Bearer <token>"
```

---

#### ✅ Test 5.3: Send Message
**Endpoint:** `POST /api/chat/messages`

**Test Cases:**
1. Send text message
2. Message stored in database
3. Conversation lastMessage updated
4. Unread count incremented for recipient

**Test Script:**
```bash
curl -X POST http://localhost:3000/api/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "conversationId": "conv_user1_user2",
    "text": "Hello! This is a test message",
    "type": "text"
  }'
```

**Expected:**
- Message created in `Message` collection
- Status: "sent"
- Conversation updated
- Unread count incremented

---

#### ✅ Test 5.4: Get Messages
**Endpoint:** `GET /api/chat/conversations/:id/messages`

**Test Cases:**
1. Get messages for conversation
2. Messages in chronological order
3. Pagination works
4. Messages marked as "delivered" automatically
5. Unread count reset

**Test Script:**
```bash
curl -X GET "http://localhost:3000/api/chat/conversations/conv_user1_user2/messages?limit=50&offset=0" \
  -H "Authorization: Bearer <token>"
```

**Expected:**
- Messages returned
- Status updated to "delivered" for recipient
- Unread count reset to 0

---

#### ✅ Test 5.5: Update Message Status
**Endpoint:** `PUT /api/chat/messages/:id/status`

**Test Cases:**
1. Mark message as delivered
2. Mark message as read
3. Only recipient can update status

**Test Script:**
```bash
curl -X PUT http://localhost:3000/api/chat/messages/msg_123/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status": "read"}'
```

---

#### ✅ Test 5.6: Mark Conversation as Read
**Endpoint:** `POST /api/chat/conversations/:id/read`

**Test Cases:**
1. All messages marked as read
2. Unread count reset
3. Last read position updated

**Test Script:**
```bash
curl -X POST http://localhost:3000/api/chat/conversations/conv_user1_user2/read \
  -H "Authorization: Bearer <token>"
```

---

### 6. Typing Indicators Tests

#### ✅ Test 6.1: Set Typing Indicator
**Endpoint:** `POST /api/chat/typing`

**Test Cases:**
1. Set typing to true
2. Set typing to false
3. Indicator expires after 3 seconds

**Test Script:**
```bash
curl -X POST http://localhost:3000/api/chat/typing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "conversationId": "conv_user1_user2",
    "isTyping": true
  }'
```

---

#### ✅ Test 6.2: Get Typing Indicators
**Endpoint:** `GET /api/chat/conversations/:id/typing`

**Test Cases:**
1. Get active typing indicators
2. Expired indicators not returned
3. Current user's typing not returned

**Test Script:**
```bash
curl -X GET http://localhost:3000/api/chat/conversations/conv_user1_user2/typing \
  -H "Authorization: Bearer <token>"
```

---

### 7. Database Storage Tests

#### ✅ Test 7.1: Verify Message Storage
- [ ] Messages stored in `messages` collection
- [ ] All message fields saved correctly
- [ ] Messages linked to conversation
- [ ] Messages linked to sender

**Database Query:**
```javascript
// In MongoDB shell or Compass
db.messages.find({ conversationId: "conv_user1_user2" })
```

---

#### ✅ Test 7.2: Verify Conversation Storage
- [ ] Conversations stored in `conversations` collection
- [ ] Participants array correct
- [ ] Last message updated
- [ ] Unread counts stored correctly

**Database Query:**
```javascript
db.conversations.find({ "participants.userId": "user_123" })
```

---

#### ✅ Test 7.3: Verify User Data Storage
- [ ] User data stored in `users` collection
- [ ] Online status persisted
- [ ] Last seen updated
- [ ] Registration status correct

**Database Query:**
```javascript
db.users.find({ userId: "user_123" })
```

---

### 8. SSE Implementation Tests

#### ⚠️ Test 8.1: Check SSE Endpoint
**Status:** ⚠️ SSE NOT IMPLEMENTED IN BACKEND

**Current Status:**
- Frontend has SSE service (`src/services/sse/sseService.ts`)
- Backend does NOT have SSE endpoints
- Currently using REST API with polling

**Recommendation:**
- Implement SSE endpoint in backend: `GET /api/chat/sse/:conversationId`
- Or use Socket.io for real-time updates

---

### 9. Logout Tests

#### ✅ Test 9.1: User Logout
**Endpoint:** `POST /api/auth/logout`

**Test Cases:**
1. Logout successful
2. Token invalidated (deleted from database)
3. User online status set to false
4. Last seen updated
5. Typing indicators cleared

**Test Script:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <token>"
```

**Expected:**
- Token deleted from `AuthToken` collection
- User `isOnline: false`
- `lastSeen` updated
- Cannot use token after logout

---

### 10. Frontend UI Tests

#### ✅ Test 10.1: Registration Screen
- [ ] Phone/email input works
- [ ] OTP generation triggers
- [ ] OTP input displays
- [ ] Registration completes
- [ ] Redirects to login after registration

---

#### ✅ Test 10.2: Login Screen
- [ ] QR code scanner works (mobile)
- [ ] OTP input works
- [ ] Login successful
- [ ] Token stored in AsyncStorage
- [ ] Navigates to chat list

---

#### ✅ Test 10.3: Chat List Screen
- [ ] Conversations load
- [ ] Search works
- [ ] Pull to refresh works
- [ ] Navigate to chat screen

---

#### ✅ Test 10.4: Chat Screen
- [ ] Messages display
- [ ] Send message works
- [ ] Message status shows (sent/delivered/read)
- [ ] Typing indicator shows
- [ ] Online status displays
- [ ] Scroll to bottom works

---

#### ✅ Test 10.5: Profile/Status Display
- [ ] User profile displays
- [ ] Online status shows correctly
- [ ] Last seen displays
- [ ] Avatar displays (if available)

---

## 🔄 End-to-End Flow Test

### Complete User Journey Test

1. **Registration**
   ```bash
   # 1. Check availability
   GET /api/register/check-availability?phoneNumber=+1234567890
   
   # 2. Generate OTP
   POST /api/register/generate-otp
   Body: { "phoneNumber": "+1234567890" }
   
   # 3. Verify OTP
   POST /api/register/verify-otp
   Body: { "phoneNumber": "+1234567890", "otp": "123456", "displayName": "Test User" }
   ```

2. **Login (OTP)**
   ```bash
   # 1. Generate OTP
   POST /api/otp/generate
   Body: { "phoneNumber": "+1234567890" }
   
   # 2. Verify OTP
   POST /api/otp/verify
   Body: { "phoneNumber": "+1234567890", "otp": "123456" }
   # → Receive token
   ```

3. **Session Start**
   ```bash
   # 1. Verify token
   GET /api/auth/verify
   Header: Authorization: Bearer <token>
   
   # 2. Update online status
   PUT /api/chat/status/online
   Body: { "isOnline": true }
   ```

4. **Start Chat**
   ```bash
   # 1. Create/get conversation
   POST /api/chat/conversations
   Body: { "otherUserId": "user_456" }
   
   # 2. Get messages
   GET /api/chat/conversations/conv_user1_user2/messages
   ```

5. **Send Message**
   ```bash
   POST /api/chat/messages
   Body: { "conversationId": "conv_user1_user2", "text": "Hello!" }
   ```

6. **Receive Message**
   ```bash
   # Other user gets messages
   GET /api/chat/conversations/conv_user1_user2/messages
   # → Messages marked as delivered
   ```

7. **Message Status**
   ```bash
   # Mark as read
   PUT /api/chat/messages/msg_123/status
   Body: { "status": "read" }
   ```

8. **Session End & Storage**
   - Messages already stored in database
   - Conversations already stored
   - All data persists

9. **Logout**
   ```bash
   POST /api/auth/logout
   Header: Authorization: Bearer <token>
   ```

---

## 🐛 Known Issues & Recommendations

### ⚠️ Issues Found

1. **SSE Not Implemented in Backend**
   - Frontend has SSE service but backend doesn't have SSE endpoints
   - **Recommendation:** Implement SSE endpoint or use Socket.io

2. **Missing Constants Import**
   - `messageController.js` uses `constants.MESSAGE_STATUS.SENT` but may not import it
   - **Fix:** Check imports in messageController.js

3. **Frontend SSE Service**
   - SSE service exists but no backend endpoint
   - **Recommendation:** Either implement SSE or remove SSE service

### ✅ Working Features

1. ✅ Registration flow (phone/email)
2. ✅ OTP login
3. ✅ QR code login
4. ✅ Token management
5. ✅ Chat functionality
6. ✅ Message storage
7. ✅ Online status
8. ✅ Typing indicators
9. ✅ Logout

---

## 📊 Test Results Template

```
Test Date: __________
Tester: __________

Backend Tests:
- [ ] Server startup: PASS / FAIL
- [ ] Database connection: PASS / FAIL
- [ ] Registration: PASS / FAIL
- [ ] Login (OTP): PASS / FAIL
- [ ] Login (QR): PASS / FAIL
- [ ] Chat: PASS / FAIL
- [ ] Messages: PASS / FAIL
- [ ] Logout: PASS / FAIL

Frontend Tests:
- [ ] UI loads: PASS / FAIL
- [ ] Registration screen: PASS / FAIL
- [ ] Login screen: PASS / FAIL
- [ ] Chat list: PASS / FAIL
- [ ] Chat screen: PASS / FAIL
- [ ] Message sending: PASS / FAIL

Database Tests:
- [ ] Data stored: PASS / FAIL
- [ ] Data retrieved: PASS / FAIL
- [ ] Updates work: PASS / FAIL

SSE Tests:
- [ ] SSE endpoint: NOT IMPLEMENTED
- [ ] Real-time updates: NOT IMPLEMENTED

Issues Found:
1. __________
2. __________
3. __________
```

---

## 🚀 Next Steps

1. Run all backend API tests
2. Test frontend UI manually
3. Verify database storage
4. Implement SSE endpoint (if needed)
5. Fix any issues found
6. Re-test after fixes

