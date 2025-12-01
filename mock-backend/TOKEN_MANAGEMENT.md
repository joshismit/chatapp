# Token Management Documentation

## 📋 Overview

After successful login, each user receives a unique authentication token that is:
- **Assigned** to their specific user account
- **Stored** in the database (AuthToken collection)
- **Linked** to the user via `userId`
- **Used** for all authenticated requests

## 🔑 Token Assignment Flow

### 1. OTP Login (Phone/Email)

```
User verifies OTP
    ↓
System finds user by phone/email
    ↓
Generate unique token: auth_<timestamp>_<random>
    ↓
Create AuthToken record:
  - token: "auth_1234567890_abc123..."
  - userId: "user_1234567890_xyz"
  - type: "jwt"
  - expiresAt: <7 days from now>
  - usedAt: <current time>
    ↓
Return token to user
    ↓
User stores token for future requests
```

### 2. QR Code Login (Desktop)

```
Mobile user scans & verifies QR code
    ↓
Desktop polls QR status
    ↓
System finds user from QR code
    ↓
Generate unique token: auth_<timestamp>_<random>
    ↓
Create AuthToken record:
  - token: "auth_1234567890_abc123..."
  - userId: "user_1234567890_xyz"
  - type: "qr"
  - expiresAt: <7 days from now>
  - usedAt: <current time>
    ↓
Return token to desktop
    ↓
Desktop stores token for future requests
```

## 📊 Token Structure

### Database Schema (AuthToken)

```javascript
{
  token: String,        // Unique token string
  userId: String,       // Links to User.userId
  type: String,        // "jwt" or "qr"
  expiresAt: Date,      // Token expiration (7 days)
  usedAt: Date,        // When token was created/used
  createdAt: Date,     // Auto-generated
  updatedAt: Date      // Auto-generated
}
```

### Token Format

```
auth_<timestamp>_<32-byte-hex-string>

Example: auth_1704067200000_a1b2c3d4e5f6...
```

## 🔐 Token Usage

### 1. Storing Token

After login, the client receives:
```json
{
  "success": true,
  "userId": "user_1234567890_abc123",
  "token": "auth_1704067200000_a1b2c3d4e5f6...",
  "user": { ... }
}
```

**Client should:**
- Store token securely (localStorage, secure cookie, etc.)
- Include token in all authenticated requests

### 2. Using Token

**Authorization Header (Recommended):**
```http
Authorization: Bearer auth_1704067200000_a1b2c3d4e5f6...
```

**Query Parameter (Alternative):**
```
GET /api/endpoint?token=auth_1704067200000_a1b2c3d4e5f6...
```

**Request Body (Alternative):**
```json
{
  "token": "auth_1704067200000_a1b2c3d4e5f6...",
  "data": "..."
}
```

### 3. Token Validation

The authentication middleware:
1. Extracts token from request
2. Finds token in AuthToken collection
3. Checks if token is expired
4. Finds user by `userId` from token
5. Verifies user is registered
6. Attaches user to request (`req.user`)

## 📝 Token Lifecycle

### Creation
- **When:** After successful login (OTP or QR)
- **Where:** Created in AuthToken collection
- **Lifetime:** 7 days from creation

### Validation
- **When:** Every authenticated request
- **Checks:**
  - Token exists in database
  - Token is not expired (`expiresAt > now`)
  - User exists and is registered

### Expiration
- **Duration:** 7 days
- **Auto-cleanup:** TTL index automatically deletes expired tokens
- **After expiration:** User must login again

## 🔄 Multiple Tokens

### Same User, Multiple Devices

A user can have multiple active tokens:
- One token per device/session
- All tokens linked to same `userId`
- Each token expires independently
- User can be logged in on multiple devices simultaneously

**Example:**
```javascript
// User logs in on mobile
Token 1: auth_123... (mobile, expires in 7 days)

// Same user logs in on desktop
Token 2: auth_456... (desktop, expires in 7 days)

// Both tokens are valid and linked to same userId
```

## 🛡️ Security Features

### 1. Token Uniqueness
- Each token is unique (database constraint)
- Generated using crypto.randomBytes for randomness
- Includes timestamp to prevent collisions

### 2. Token Expiration
- Tokens expire after 7 days
- Expired tokens are automatically deleted
- User must re-authenticate after expiration

### 3. Token Validation
- Token must exist in database
- Token must not be expired
- User must exist and be registered
- All checks happen on every request

### 4. Token Storage
- Tokens stored in MongoDB with indexes
- Fast lookup by token string
- Fast lookup by userId
- TTL index for auto-cleanup

## 📡 API Endpoints

### Login Endpoints (Return Tokens)

1. **OTP Login**
   - `POST /api/otp/verify`
   - Returns: `{ token: "...", userId: "..." }`

2. **QR Code Login**
   - `GET /api/qr/status/:qrToken` (when verified)
   - Returns: `{ token: "...", userId: "..." }`

### Token Management Endpoints

1. **Verify Token**
   - `GET /api/auth/verify`
   - Requires: Bearer token
   - Returns: `{ success: true, userId: "..." }`

2. **Generate Test Token** (Development)
   - `POST /api/auth/generate-token`
   - Creates token for testing

## 💾 Database Queries

### Find Token
```javascript
const authToken = await AuthToken.findOne({
  token: "auth_1704067200000_a1b2c3d4e5f6...",
  expiresAt: { $gt: new Date() }
});
```

### Find User by Token
```javascript
const authToken = await AuthToken.findOne({
  token: "auth_1704067200000_a1b2c3d4e5f6...",
  expiresAt: { $gt: new Date() }
});

const user = await User.findOne({ userId: authToken.userId });
```

### Find All User Tokens
```javascript
const tokens = await AuthToken.find({
  userId: "user_1234567890_abc123",
  expiresAt: { $gt: new Date() }
});
```

## ✅ Token Assignment Verification

### After OTP Login
```javascript
// 1. User verifies OTP
POST /api/otp/verify
Body: { phoneNumber: "+1234567890", otp: "123456" }

// 2. Response includes token
Response: {
  "success": true,
  "userId": "user_1234567890_abc123",
  "token": "auth_1704067200000_a1b2c3d4e5f6...",
  "user": { ... }
}

// 3. Token is stored in database
// AuthToken collection now has:
{
  token: "auth_1704067200000_a1b2c3d4e5f6...",
  userId: "user_1234567890_abc123",
  type: "jwt",
  expiresAt: <7 days from now>,
  usedAt: <now>
}
```

### After QR Code Login
```javascript
// 1. Desktop polls QR status
GET /api/qr/status/:qrToken

// 2. Response includes token when verified
Response: {
  "success": true,
  "status": "verified",
  "userId": "user_1234567890_abc123",
  "token": "auth_1704067200000_a1b2c3d4e5f6...",
  "message": "QR code verified successfully"
}

// 3. Token is stored in database
// AuthToken collection now has:
{
  token: "auth_1704067200000_a1b2c3d4e5f6...",
  userId: "user_1234567890_abc123",
  type: "qr",
  expiresAt: <7 days from now>,
  usedAt: <now>
}
```

## 🔍 Token Validation Flow

```
Request with token
    ↓
Extract token from Authorization header
    ↓
Find token in AuthToken collection
    ↓
Check: token exists? → NO → 401 Unauthorized
    ↓ YES
Check: token expired? → YES → 401 Unauthorized
    ↓ NO
Find user by userId from token
    ↓
Check: user exists? → NO → 401 Unauthorized
    ↓ YES
Check: user registered? → NO → 403 Forbidden
    ↓ YES
Attach user to request (req.user)
    ↓
Continue to route handler
```

## 📊 Token Statistics

### Per User
- Can have multiple active tokens (one per device)
- All tokens linked to same `userId`
- Tokens expire independently

### Per Token
- Unique identifier
- Linked to one user (`userId`)
- Expires in 7 days
- Type: "jwt" (OTP login) or "qr" (QR login)

## 🎯 Best Practices

1. **Store Securely**
   - Use secure storage (not plain text)
   - Consider httpOnly cookies for web
   - Use secure storage APIs for mobile

2. **Include in Requests**
   - Always include token in Authorization header
   - Don't expose token in URLs (use headers)

3. **Handle Expiration**
   - Check token expiration before making requests
   - Implement token refresh or re-login flow
   - Handle 401 errors gracefully

4. **Token Cleanup**
   - Tokens auto-expire after 7 days
   - TTL index automatically deletes expired tokens
   - No manual cleanup needed

## ✅ Summary

**Token Assignment is Working Correctly:**

✅ Each user gets a unique token after login  
✅ Token is stored in database with userId link  
✅ Token is returned in login response  
✅ Token can be used for authenticated requests  
✅ Token expires after 7 days  
✅ Multiple tokens per user (multiple devices)  
✅ Token validation on every request  
✅ Automatic cleanup of expired tokens  

The token system is fully functional and properly assigns tokens to users after login.

