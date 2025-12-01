# Login Flow Documentation

## 📋 Overview

The chat app supports login for **existing registered users only** via two methods:
1. **OTP Login** - For mobile (phone) and website (email)
2. **QR Code Login** - For desktop (requires mobile login first)

## 🔄 Login Flows

### Flow 1: OTP Login (Phone/Email)

```
1. User enters phone/email
   ↓
2. POST /api/otp/generate { phoneNumber: "+1234567890" } OR { email: "user@example.com" }
   ↓
3. System checks if user exists and is registered
   ↓
4. User receives OTP via SMS/Email
   ↓
5. User enters OTP
   ↓
6. POST /api/otp/verify { phoneNumber/email, otp: "123456" }
   ↓
7. User logged in + Auth token returned
```

### Flow 2: QR Code Login (Desktop)

```
1. Desktop generates QR code
   POST /api/qr/generate
   ↓
2. Desktop displays QR code and polls status
   GET /api/qr/status/:qrToken
   ↓
3. Mobile user (already logged in) scans QR code
   POST /api/qr/scan { qrToken: "..." }
   ↓
4. Mobile user confirms login
   POST /api/qr/verify { qrToken: "..." }
   ↓
5. Desktop receives auth token in polling response
   ↓
6. Desktop is logged in
```

## 📡 API Endpoints

### 1. Generate Login OTP

**POST** `/api/otp/generate`

Generate OTP for login. **Only works for existing registered users.**

**Request Body:**
```json
{
  "phoneNumber": "+1234567890"  // OR
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP generated successfully",
  "otp": "123456",  // Only in development
  "expiresIn": 300,  // seconds
  "method": "phone"  // or "email"
}
```

**Error Responses:**
- `400` - Missing phone/email, invalid format, or both provided
- `404` - User not found (not registered)
- `500` - Server error

**Notes:**
- User must be registered (`isRegistered: true`)
- If user doesn't exist, returns `404` with `action: "register"`
- OTP expires in 5 minutes
- In production, OTP is sent via SMS/Email

---

### 2. Verify Login OTP

**POST** `/api/otp/verify`

Verify OTP and login user. **Only works for existing registered users.**

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",  // OR
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "userId": "user_1234567890_abc123",
  "token": "auth_1234567890_xyz...",
  "user": {
    "userId": "user_1234567890_abc123",
    "displayName": "John Doe",
    "phoneNumber": "+1234567890",
    "email": null,
    "isOnline": true
  },
  "message": "Login successful"
}
```

**Error Responses:**
- `400` - Missing fields, invalid OTP, expired OTP, max attempts exceeded
- `404` - User not found (not registered)
- `500` - Server error

**Notes:**
- User must be registered
- Maximum 3 verification attempts
- User is marked as online after login
- Auth token expires in 7 days

---

### 3. QR Code Login (Desktop)

QR code login requires the user to be **already logged in on mobile**. The flow:

1. **Generate QR Code** (Desktop)
   - `POST /api/qr/generate` - Generates QR code

2. **Scan QR Code** (Mobile - requires authentication)
   - `POST /api/qr/scan` - User scans QR code
   - Requires: User must be logged in on mobile (Bearer token)

3. **Verify QR Code** (Mobile - requires authentication)
   - `POST /api/qr/verify` - User confirms login
   - Requires: User must be logged in on mobile (Bearer token)

4. **Check Status** (Desktop - polling)
   - `GET /api/qr/status/:qrToken` - Desktop polls for status
   - Returns auth token when verified

See [QR Code Flow Documentation](./API_ENDPOINTS.md) for details.

---

## 🔐 Registration vs Login

### Registration Endpoints
- `/api/register/generate-otp` - Generate OTP for new users
- `/api/register/verify-otp` - Complete registration (creates account, no login)

### Login Endpoints
- `/api/otp/generate` - Generate OTP for existing users
- `/api/otp/verify` - Login existing users (returns auth token)

**Key Differences:**
1. **Registration** creates account but doesn't log in
2. **Login** only works for existing registered users
3. **Registration** requires `displayName`
4. **Login** only requires phone/email and OTP

---

## 🎯 User Flow Examples

### Example 1: New User Flow

```javascript
// Step 1: Register
POST /api/register/generate-otp
Body: { "phoneNumber": "+1234567890" }
// Response: { "otp": "123456" }

POST /api/register/verify-otp
Body: { "phoneNumber": "+1234567890", "otp": "123456", "displayName": "John Doe" }
// Response: { "success": true, "message": "Registration successful. Please login to continue." }

// Step 2: Login (after registration)
POST /api/otp/generate
Body: { "phoneNumber": "+1234567890" }
// Response: { "otp": "654321" }

POST /api/otp/verify
Body: { "phoneNumber": "+1234567890", "otp": "654321" }
// Response: { "userId": "...", "token": "...", "message": "Login successful" }
```

### Example 2: Existing User Login

```javascript
// Direct login (user already registered)
POST /api/otp/generate
Body: { "phoneNumber": "+1234567890" }
// Response: { "otp": "123456" }

POST /api/otp/verify
Body: { "phoneNumber": "+1234567890", "otp": "123456" }
// Response: { "userId": "...", "token": "...", "message": "Login successful" }
```

### Example 3: Email Login

```javascript
// Login with email
POST /api/otp/generate
Body: { "email": "user@example.com" }
// Response: { "otp": "123456" }

POST /api/otp/verify
Body: { "email": "user@example.com", "otp": "123456" }
// Response: { "userId": "...", "token": "...", "message": "Login successful" }
```

### Example 4: QR Code Login (Desktop)

```javascript
// Desktop: Generate QR
POST /api/qr/generate
// Response: { "qrToken": "qr_..." }

// Desktop: Poll for status
GET /api/qr/status/:qrToken
// Response: { "status": "pending" }

// Mobile: User already logged in, scans QR
POST /api/qr/scan
Headers: { "Authorization": "Bearer <mobile_token>" }
Body: { "qrToken": "qr_..." }

// Mobile: User confirms
POST /api/qr/verify
Headers: { "Authorization": "Bearer <mobile_token>" }
Body: { "qrToken": "qr_..." }

// Desktop: Poll again
GET /api/qr/status/:qrToken
// Response: { "status": "verified", "token": "auth_...", "userId": "..." }
```

---

## ✅ Validation Rules

1. **Phone Number:**
   - Must match format: `+?[1-9]\d{1,14}`
   - User must be registered

2. **Email:**
   - Must match standard email format
   - User must be registered

3. **OTP:**
   - 6 digits
   - Expires in 5 minutes
   - Maximum 3 verification attempts
   - Type: "login" (not "registration")

---

## 🔒 Security Features

1. **User Verification:** Only registered users can login
2. **OTP Expiration:** OTPs expire after 5 minutes
3. **Attempt Limiting:** Maximum 3 verification attempts
4. **Input Validation:** All inputs are validated and sanitized
5. **Token Security:** Auth tokens expire after 7 days
6. **QR Code Security:** QR codes expire after 5 minutes and can only be used once

---

## 📝 Error Handling

### User Not Found (404)
```json
{
  "success": false,
  "message": "User not found. Please register first.",
  "error": "USER_NOT_FOUND",
  "action": "register"
}
```

### Invalid OTP (400)
```json
{
  "success": false,
  "message": "Invalid OTP",
  "remainingAttempts": 2,
  "error": "INVALID_OTP"
}
```

### Max Attempts Exceeded (400)
```json
{
  "success": false,
  "message": "Maximum verification attempts exceeded. Please request a new OTP",
  "error": "MAX_ATTEMPTS_EXCEEDED"
}
```

---

## 🎯 Complete User Journey

### New User
1. **Register** → `/api/register/generate-otp` → `/api/register/verify-otp`
2. **Login** → `/api/otp/generate` → `/api/otp/verify`
3. **Use App** → Authenticated with token

### Existing User
1. **Login** → `/api/otp/generate` → `/api/otp/verify`
2. **Use App** → Authenticated with token

### Desktop User (via QR)
1. **Mobile Login** → `/api/otp/generate` → `/api/otp/verify`
2. **Desktop QR** → `/api/qr/generate` → Scan → Verify
3. **Desktop Login** → Receives token via polling

