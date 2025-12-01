# 📡 API cURL Commands for Postman Testing

## Base URL
```
http://localhost:3000
```
**Note**: Replace with your actual backend URL (e.g., `https://your-backend.onrender.com` for production)

---

## 🔍 Health Check

### Check Server Status
```bash
curl -X GET http://localhost:3000/health
```

---

## 📝 Registration APIs

### 1. Check Availability (Phone/Email)
```bash
# Check by Email
curl -X GET "http://localhost:3000/api/register/check-availability?email=test@example.com"

# Check by Phone
curl -X GET "http://localhost:3000/api/register/check-availability?phoneNumber=%2B1234567890"
```

### 2. Generate Registration OTP
```bash
curl -X POST http://localhost:3000/api/register/generate-otp \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "password": "SecurePass123",
    "reEnterPassword": "SecurePass123"
  }'
```

### 3. Verify Registration OTP
```bash
curl -X POST http://localhost:3000/api/register/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp": "123456"
  }'
```

---

## 📱 Login APIs (OTP)

### 4. Generate Login OTP (Phone)
```bash
curl -X POST http://localhost:3000/api/otp/generate \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890"
  }'
```

### 5. Generate Login OTP (Email)
```bash
curl -X POST http://localhost:3000/api/otp/generate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

### 6. Verify Login OTP (Phone)
```bash
curl -X POST http://localhost:3000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "otp": "123456"
  }'
```

### 7. Verify Login OTP (Email)
```bash
curl -X POST http://localhost:3000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp": "123456"
  }'
```

---

## 🖥️ QR Code APIs (Desktop Login)

### 8. Generate QR Code
```bash
curl -X POST http://localhost:3000/api/qr/generate \
  -H "Content-Type: application/json"
```

### 9. Check QR Status
```bash
# Replace {qrToken} with actual QR token from step 8
curl -X GET http://localhost:3000/api/qr/status/{qrToken}
```

### 10. Scan QR Code (Mobile - Requires Auth Token)
```bash
# Replace {token} with your authentication token
curl -X POST http://localhost:3000/api/qr/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "qrToken": "qr_1234567890_abcdef123456"
  }'
```

### 11. Verify QR Code (Mobile - Requires Auth Token)
```bash
# Replace {token} with your authentication token
curl -X POST http://localhost:3000/api/qr/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "qrToken": "qr_1234567890_abcdef123456"
  }'
```

---

## 🔐 Authentication APIs

### 12. Legacy Login (Token-based)
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-test-token-here"
  }'
```

### 13. Generate Test Token
```bash
curl -X POST http://localhost:3000/api/auth/generate-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_1234567890"
  }'
```

### 14. Verify Token (Requires Auth Token)
```bash
# Replace {token} with your authentication token
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer {token}"
```

### 15. Logout (Requires Auth Token)
```bash
# Replace {token} with your authentication token
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}"
```

---

## 💬 Chat APIs (All require Authentication)

**Note**: Replace `{token}` with your authentication token from login/OTP verification

### 16. Get or Create Conversation
```bash
curl -X POST http://localhost:3000/api/chat/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "otherUserId": "user_9876543210"
  }'
```

### 17. Get All Conversations
```bash
curl -X GET http://localhost:3000/api/chat/conversations \
  -H "Authorization: Bearer {token}"
```

### 18. Get Conversation by ID
```bash
# Replace {conversationId} with actual conversation ID
curl -X GET http://localhost:3000/api/chat/conversations/{conversationId} \
  -H "Authorization: Bearer {token}"
```

### 19. Send Message
```bash
curl -X POST http://localhost:3000/api/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "conversationId": "conv_1234567890",
    "text": "Hello, how are you?"
  }'
```

### 20. Get Messages
```bash
# Replace {conversationId} with actual conversation ID
# Optional query params: ?limit=20&before=messageId
curl -X GET "http://localhost:3000/api/chat/conversations/{conversationId}/messages?limit=50" \
  -H "Authorization: Bearer {token}"
```

### 21. Update Message Status
```bash
# Replace {messageId} with actual message ID
# Status can be: "delivered" or "read"
curl -X PUT http://localhost:3000/api/chat/messages/{messageId}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "status": "delivered"
  }'
```

### 22. Mark Conversation as Read
```bash
# Replace {conversationId} with actual conversation ID
curl -X POST http://localhost:3000/api/chat/conversations/{conversationId}/read \
  -H "Authorization: Bearer {token}"
```

---

## 👤 Status APIs (All require Authentication)

### 23. Update Online Status
```bash
curl -X PUT http://localhost:3000/api/chat/status/online \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "isOnline": true
  }'
```

### 24. Get User Status
```bash
# Replace {userId} with actual user ID
curl -X GET http://localhost:3000/api/chat/users/{userId}/status \
  -H "Authorization: Bearer {token}"
```

### 25. Set Typing Indicator
```bash
curl -X POST http://localhost:3000/api/chat/typing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "conversationId": "conv_1234567890",
    "isTyping": true
  }'
```

### 26. Get Typing Indicators
```bash
# Replace {conversationId} with actual conversation ID
curl -X GET http://localhost:3000/api/chat/conversations/{conversationId}/typing \
  -H "Authorization: Bearer {token}"
```

---

## 📡 Server-Sent Events (SSE)

### 27. Connect to SSE Stream
```bash
# Replace {token} and {conversationId} with actual values
# Note: SSE requires special handling in Postman - use "Send and Download" or use a tool like curl
curl -N -H "Authorization: Bearer {token}" \
  "http://localhost:3000/api/sse?conversationId={conversationId}"
```

**Postman Note**: For SSE, use Postman's "Send and Download" feature or test with a browser/SSE client.

---

## 🛠️ Utility APIs

### 28. Seed Dummy Data
```bash
curl -X POST http://localhost:3000/api/seed/dummy-data \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_1234567890"
  }'
```

---

## 📋 Complete Testing Flow Example

### Step 1: Health Check
```bash
curl -X GET http://localhost:3000/health
```

### Step 2: Register New User
```bash
# Generate OTP
curl -X POST http://localhost:3000/api/register/generate-otp \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "password": "SecurePass123",
    "reEnterPassword": "SecurePass123"
  }'

# Verify OTP (use OTP from response or check console logs)
curl -X POST http://localhost:3000/api/register/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp": "123456"
  }'
```

### Step 3: Login
```bash
# Generate Login OTP
curl -X POST http://localhost:3000/api/otp/generate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'

# Verify OTP and get token
curl -X POST http://localhost:3000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp": "123456"
  }'
```

### Step 4: Use Token for Chat APIs
```bash
# Save the token from step 3 response, then use it:
TOKEN="your-token-from-step-3"

# Get conversations
curl -X GET http://localhost:3000/api/chat/conversations \
  -H "Authorization: Bearer $TOKEN"

# Create conversation
curl -X POST http://localhost:3000/api/chat/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "otherUserId": "user_9876543210"
  }'
```

---

## 🔑 Authentication Header Format

For all protected endpoints, use:
```
Authorization: Bearer {your-token-here}
```

Or in cURL:
```bash
-H "Authorization: Bearer {your-token-here}"
```

---

## 📝 Notes for Postman

1. **Base URL**: Set as environment variable `{{baseUrl}}` = `http://localhost:3000`
2. **Token**: Save token from login response as `{{authToken}}` environment variable
3. **Headers**: 
   - `Content-Type: application/json` for POST/PUT requests
   - `Authorization: Bearer {{authToken}}` for protected endpoints
4. **Variables**: Use `{{variableName}}` syntax in Postman for dynamic values

---

## 🐛 Common Issues

1. **CORS Error**: Make sure backend CORS is configured correctly
2. **401 Unauthorized**: Check if token is valid and included in Authorization header
3. **400 Bad Request**: Verify request body matches the expected format
4. **404 Not Found**: Check if endpoint URL is correct

---

## 📚 Response Examples

### Successful Registration Response
```json
{
  "success": true,
  "userId": "user_1234567890",
  "user": {
    "userId": "user_1234567890",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe",
    "phoneNumber": "+1234567890",
    "email": "john.doe@example.com",
    "isRegistered": true,
    "registrationMethod": "email"
  },
  "message": "Registration successful. Please login to continue.",
  "action": "login"
}
```

### Successful Login Response
```json
{
  "success": true,
  "token": "auth_1234567890_abcdef123456",
  "user": {
    "userId": "user_1234567890",
    "displayName": "John Doe",
    "email": "john.doe@example.com"
  },
  "message": "Login successful"
}
```

---

**Happy Testing! 🚀**

