# Mock Backend Server for QR Login

A simple Express.js mock server for testing the QR code login functionality.

## Installation

```bash
cd mock-backend
npm install
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

Login endpoint for QR code authentication.

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
  "userId": "12345",
  "message": "Logged in via QR"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Token is required and cannot be empty"
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

## Configuration

To change the port, set the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## Updating the Mobile App

Update the API base URL in `src/services/api/client.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3000'; // For development
// or
const API_BASE_URL = 'http://YOUR_IP:3000'; // For testing on physical device
```

**Note:** When testing on a physical device, replace `localhost` with your computer's IP address (e.g., `http://192.168.1.100:3000`).

