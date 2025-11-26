# Backend Server for Chat App

Express.js backend server with MongoDB integration for QR code login and chat functionality.

## Installation

```bash
cd mock-backend
npm install
```

## Environment Setup

Create a `.env` file (already created with MongoDB connection):

```env
MONGODB_URI=mongodb+srv://smitjoshi709_db_user:RHLhRJ9PIBaP03yJ@cluster0.qampcyo.mongodb.net/chatapp_db
PORT=3000
NODE_ENV=development
```

## Running the Server

```bash
npm start
```

Or with auto-reload (requires nodemon):

```bash
npm run dev
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### POST /api/login

Login endpoint for QR code authentication. Validates QR token against MongoDB.

**Request:**
```json
{
  "token": "your-qr-token-here"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "userId": "user_12345",
  "message": "Logged in via QR"
}
```

**Error Responses:**

400 - Invalid token:
```json
{
  "success": false,
  "message": "Token is required and cannot be empty"
}
```

401 - Invalid/expired QR code:
```json
{
  "success": false,
  "message": "Invalid or expired QR token"
}
```

### POST /api/seed/dummy-data

Seed dummy conversations and messages to the database for testing.

**Request:**
```json
{
  "userId": "user_12345"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Dummy data seeded successfully for user user_12345",
  "conversationsCreated": 10,
  "usersCreated": 10
}
```

### GET /api/conversations

Get all conversations for a user.

**Query Parameters:**
- `userId` (required) - The user ID to fetch conversations for

**Success Response (200):**
```json
{
  "success": true,
  "conversations": [
    {
      "conversationId": "conv_1",
      "participants": [...],
      "type": "direct",
      "lastMessage": {
        "messageId": "msg_1_1",
        "text": "Hey, how are you doing today?",
        "senderId": "user_john",
        "timestamp": "2024-01-15T10:30:00.000Z"
      },
      "unreadCount": 2,
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### GET /api/conversations/:conversationId

Get a specific conversation by ID.

**Success Response (200):**
```json
{
  "conversationId": "conv_1",
  "participants": [...],
  "type": "direct",
  ...
}
```

### POST /api/qr/generate

Generate a new QR code token for testing.

**Request:**
```json
{
  "userId": "user_12345"  // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "qrToken": "qr_1234567890_abc123",
  "expiresAt": "2024-01-15T10:35:00.000Z",
  "message": "QR code generated successfully"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Mock backend server is running"
}
```

## MongoDB Database

The server connects to MongoDB Atlas:
- **Database**: `chatapp_db`
- **Collections**: 
  - `users` - User accounts
  - `conversations` - Chat conversations
  - `messages` - Chat messages
  - `auth_tokens` - Authentication tokens
  - `qr_codes` - QR login codes
  - `typing_indicators` - Typing status

## Configuration

To change the port, set the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## Testing QR Login

1. **Generate a QR token:**
   ```bash
   curl -X POST http://localhost:3000/api/qr/generate \
     -H "Content-Type: application/json" \
     -d '{"userId": "user_12345"}'
   ```

2. **Use the token to login:**
   ```bash
   curl -X POST http://localhost:3000/api/login \
     -H "Content-Type: application/json" \
     -d '{"token": "qr_1234567890_abc123"}'
   ```

## Updating the Mobile App

The API base URL is already configured in `src/services/api/client.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3000'; // For development
```

**Note:** When testing on a physical device, replace `localhost` with your computer's IP address (e.g., `http://192.168.1.100:3000`).

