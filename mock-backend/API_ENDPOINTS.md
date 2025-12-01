# API Endpoints Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 📱 Mobile Login (OTP)

### 1. Generate OTP
**POST** `/api/otp/generate`

Generate a 6-digit OTP for mobile login. OTP expires in 5 minutes.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP generated successfully",
  "otp": "123456",  // Only in development mode
  "expiresIn": 300  // seconds (5 minutes)
}
```

**Error Responses:**
- `400` - Missing or invalid phone number
- `500` - Server error

---

### 2. Verify OTP
**POST** `/api/otp/verify`

Verify OTP and login user. Creates user if doesn't exist.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "userId": "user_1234567890_abc123",
  "token": "auth_1234567890_xyz...",
  "message": "OTP verified successfully"
}
```

**Error Responses:**
- `400` - Missing fields, invalid/expired OTP, max attempts exceeded
- `500` - Server error

**Notes:**
- Maximum 3 verification attempts per OTP
- OTP expires after 5 minutes
- User is created automatically if doesn't exist

---

## 🖥️ Desktop Login (QR Code)

### 3. Generate QR Code
**POST** `/api/qr/generate`

Generate a QR code token for desktop login. QR code expires in 5 minutes.

**Request Body:**
```json
{}
```

**Success Response (200):**
```json
{
  "success": true,
  "qrToken": "qr_1234567890_abc123...",
  "expiresAt": "2024-01-15T10:35:00.000Z",
  "message": "QR code generated successfully"
}
```

**Error Responses:**
- `500` - Server error

---

### 4. Check QR Code Status
**GET** `/api/qr/status/:qrToken`

Poll this endpoint to check QR code status. Desktop should poll every 2-3 seconds.

**URL Parameters:**
- `qrToken` - The QR token from generate endpoint

**Success Responses (200):**

**Pending:**
```json
{
  "success": true,
  "status": "pending",
  "message": "QR code is waiting to be scanned"
}
```

**Scanned:**
```json
{
  "success": true,
  "status": "scanned",
  "scannedBy": "user_1234567890_abc123",
  "message": "QR code has been scanned"
}
```

**Verified (Login Success):**
```json
{
  "success": true,
  "status": "verified",
  "userId": "user_1234567890_abc123",
  "token": "auth_1234567890_xyz...",
  "message": "QR code verified successfully"
}
```

**Expired:**
```json
{
  "success": false,
  "status": "expired",
  "message": "QR code has expired"
}
```

**Error Responses:**
- `404` - QR code not found
- `400` - QR code already used
- `500` - Server error

---

### 5. Scan QR Code
**POST** `/api/qr/scan`

**Requires Authentication** - Mobile user scans QR code.

**Request Headers:**
```
Authorization: Bearer <mobile_user_token>
```

**Request Body:**
```json
{
  "qrToken": "qr_1234567890_abc123..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "QR code scanned successfully. Waiting for verification."
}
```

**Error Responses:**
- `400` - Missing qrToken, QR expired, or already used
- `401` - Authentication required
- `404` - QR code not found
- `500` - Server error

---

### 6. Verify QR Code
**POST** `/api/qr/verify`

**Requires Authentication** - Mobile user confirms login after scanning.

**Request Headers:**
```
Authorization: Bearer <mobile_user_token>
```

**Request Body:**
```json
{
  "qrToken": "qr_1234567890_abc123..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "QR code verified successfully. Desktop will receive the token."
}
```

**Error Responses:**
- `400` - Missing qrToken, QR expired
- `401` - Authentication required
- `403` - Unauthorized (different user scanned)
- `404` - QR code not found
- `500` - Server error

---

## 🔐 Authentication Endpoints

### 7. Verify Token
**GET** `/api/auth/verify`

**Requires Authentication** - Check if token is valid.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "userId": "user_1234567890_abc123",
  "message": "Token is valid"
}
```

**Error Responses:**
- `401` - Invalid or expired token
- `500` - Server error

---

### 8. Generate Test Token
**POST** `/api/auth/generate-token`

Generate a test token for development/testing.

**Request Body:**
```json
{
  "userId": "user_12345"  // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "test_token_1234567890_abc123",
  "userId": "user_12345",
  "expiresAt": "2024-01-22T10:30:00.000Z",
  "message": "Token generated successfully. Use this token to login at /api/login"
}
```

---

### 9. Legacy Login
**POST** `/api/login`

Legacy token-based login endpoint (kept for backward compatibility).

**Request Body:**
```json
{
  "token": "your_token_here",
  "userId": "user_12345"  // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "userId": "user_12345",
  "token": "your_token_here",
  "message": "Logged in successfully"
}
```

---

## 🛠️ Utility Endpoints

### 10. Health Check
**GET** `/health`

Check if server is running.

**Success Response (200):**
```json
{
  "status": "ok",
  "message": "Mock backend server is running"
}
```

---

### 11. Seed Dummy Data
**POST** `/api/seed/dummy-data`

Seed dummy users for testing.

**Request Body:**
```json
{
  "userId": "user_12345"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Dummy users seeded successfully",
  "usersCreated": 10
}
```

---

## 🔄 Complete Authentication Flows

### Mobile Login Flow:
1. User enters phone number
2. Call `POST /api/otp/generate` → Receive OTP
3. User enters OTP
4. Call `POST /api/otp/verify` → Receive auth token
5. User is logged in on mobile

### Desktop Login Flow:
1. Desktop calls `POST /api/qr/generate` → Get QR token
2. Desktop displays QR code and starts polling `GET /api/qr/status/:qrToken`
3. Mobile user (already logged in) scans QR code
4. Mobile calls `POST /api/qr/scan` with QR token
5. Mobile user confirms → Mobile calls `POST /api/qr/verify`
6. Desktop polling detects "verified" status → Receives auth token
7. Desktop is logged in

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- Tokens expire after 7 days
- OTP expires after 5 minutes
- QR codes expire after 5 minutes
- Phone numbers are normalized (spaces removed) automatically
- OTP has maximum 3 verification attempts
- QR codes can only be used once

