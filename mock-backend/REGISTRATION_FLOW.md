# Registration Flow Documentation

## 📋 Overview

The chat app supports user registration via two methods:
1. **Phone Registration** - For mobile users
2. **Email Registration** - For website/desktop users

## 🔄 Registration Flow

### Flow 1: Phone Registration (Mobile)

```
1. User enters phone number
   ↓
2. POST /api/register/generate-otp { phoneNumber: "+1234567890" }
   ↓
3. User receives OTP via SMS
   ↓
4. User enters OTP + Display Name
   ↓
5. POST /api/register/verify-otp { phoneNumber, otp, displayName: "John Doe" }
   ↓
6. Account created + Auth token returned
   ↓
7. User is logged in
```

### Flow 2: Email Registration (Website)

```
1. User enters email address
   ↓
2. POST /api/register/generate-otp { email: "user@example.com" }
   ↓
3. User receives OTP via Email
   ↓
4. User enters OTP + Display Name
   ↓
5. POST /api/register/verify-otp { email, otp, displayName: "Jane Smith" }
   ↓
6. Account created + Auth token returned
   ↓
7. User is logged in
```

## 📡 API Endpoints

### 1. Check Availability

**GET** `/api/register/check-availability`

Check if a phone number or email is available for registration.

**Query Parameters:**
- `phoneNumber` (optional) - Phone number to check
- `email` (optional) - Email to check

**Example:**
```bash
GET /api/register/check-availability?phoneNumber=+1234567890
GET /api/register/check-availability?email=user@example.com
```

**Response:**
```json
{
  "success": true,
  "available": true,
  "message": "Phone number/email is available"
}
```

---

### 2. Generate Registration OTP

**POST** `/api/register/generate-otp`

Generate OTP for registration. Supports both phone and email.

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
  "message": "OTP generated successfully for registration",
  "otp": "123456",  // Only in development
  "expiresIn": 300,  // seconds
  "method": "phone"  // or "email"
}
```

**Error Responses:**
- `400` - Missing phone/email, invalid format, or user already exists
- `500` - Server error

**Notes:**
- Cannot provide both phoneNumber and email
- Checks if user already exists
- OTP expires in 5 minutes
- In production, OTP is sent via SMS/Email (not returned in response)

---

### 3. Verify Registration OTP

**POST** `/api/register/verify-otp`

Verify OTP and complete registration. Creates new user account.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",  // OR
  "email": "user@example.com",
  "otp": "123456",
  "displayName": "John Doe"
}
```

**Success Response (201):**
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
    "isRegistered": true,
    "registrationMethod": "phone"
  },
  "message": "Registration successful"
}
```

**Error Responses:**
- `400` - Missing fields, invalid OTP, expired OTP, max attempts exceeded, user already exists
- `500` - Server error

**Notes:**
- Display name is required (minimum 2 characters)
- OTP must be valid and not expired
- Maximum 3 verification attempts
- User is automatically logged in after successful registration

---

## 🔐 Registration vs Login

### Registration Endpoints
- `/api/register/generate-otp` - Generate OTP for new users
- `/api/register/verify-otp` - Complete registration

### Login Endpoints
- `/api/otp/generate` - Generate OTP for existing users
- `/api/otp/verify` - Login existing users

**Key Differences:**
1. Registration requires `displayName`
2. Registration checks if user doesn't exist
3. Registration sets `isRegistered: true`
4. Registration sets `registrationMethod` (phone/email)

---

## 📊 Database Changes

### User Model Updates

New fields added:
- `email` - Email address (unique, sparse index)
- `isRegistered` - Boolean flag (default: false)
- `registrationMethod` - Enum: "phone", "email", "qr"

### OTP Model Updates

New fields added:
- `email` - Email address (alternative to phoneNumber)
- `type` - Enum: "registration", "login" (default: "login")

**Constraints:**
- Either `phoneNumber` OR `email` must be provided (not both)
- OTP type distinguishes between registration and login

---

## 🎯 User Flow Examples

### Example 1: New User Registration (Phone)

```javascript
// Step 1: Check availability
GET /api/register/check-availability?phoneNumber=+1234567890
// Response: { "available": true }

// Step 2: Generate OTP
POST /api/register/generate-otp
Body: { "phoneNumber": "+1234567890" }
// Response: { "otp": "123456", "expiresIn": 300 }

// Step 3: Verify OTP and Register
POST /api/register/verify-otp
Body: {
  "phoneNumber": "+1234567890",
  "otp": "123456",
  "displayName": "John Doe"
}
// Response: { "userId": "...", "token": "...", "user": {...} }
```

### Example 2: New User Registration (Email)

```javascript
// Step 1: Check availability
GET /api/register/check-availability?email=user@example.com
// Response: { "available": true }

// Step 2: Generate OTP
POST /api/register/generate-otp
Body: { "email": "user@example.com" }
// Response: { "otp": "123456", "expiresIn": 300 }

// Step 3: Verify OTP and Register
POST /api/register/verify-otp
Body: {
  "email": "user@example.com",
  "otp": "123456",
  "displayName": "Jane Smith"
}
// Response: { "userId": "...", "token": "...", "user": {...} }
```

---

## ✅ Validation Rules

1. **Phone Number:**
   - Must match format: `+?[1-9]\d{1,14}`
   - Spaces are automatically removed
   - Must be unique (if user exists, must login instead)

2. **Email:**
   - Must match standard email format
   - Automatically lowercased
   - Must be unique (if user exists, must login instead)

3. **Display Name:**
   - Required for registration
   - Minimum 2 characters
   - Trimmed and sanitized

4. **OTP:**
   - 6 digits
   - Expires in 5 minutes
   - Maximum 3 verification attempts

---

## 🔒 Security Features

1. **Duplicate Prevention:** Checks if user exists before registration
2. **OTP Expiration:** OTPs expire after 5 minutes
3. **Attempt Limiting:** Maximum 3 verification attempts
4. **Input Validation:** All inputs are validated and sanitized
5. **Error Handling:** Proper error messages without information leakage

---

## 📝 Next Steps

After successful registration:
1. User receives auth token
2. User is automatically logged in
3. User can use the token for authenticated requests
4. User can update profile, settings, etc.

