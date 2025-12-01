# ChatApp Backend

Express.js backend server with MongoDB integration for QR code login and OTP authentication.

## 📁 Project Structure

```
mock-backend/
├── config/              # Configuration files
│   ├── database.js      # MongoDB connection
│   └── constants.js     # Application constants
├── models/              # Database models/schemas
│   └── index.js         # All Mongoose models
├── controllers/         # Business logic
│   ├── authController.js
│   ├── otpController.js
│   ├── qrController.js
│   └── userController.js
├── routes/              # Route definitions
│   ├── authRoutes.js
│   ├── otpRoutes.js
│   ├── qrRoutes.js
│   ├── userRoutes.js
│   └── index.js         # Main routes file
├── middleware/         # Express middleware
│   ├── auth.js          # Authentication middleware
│   └── errorHandler.js  # Error handling middleware
├── utils/               # Utility functions
│   └── helpers.js       # Helper functions
├── scripts/             # Utility scripts
│   └── seedData.js      # Seed dummy data
├── server.js            # Main server file
└── package.json
```

## 🚀 Installation

```bash
cd mock-backend
npm install
```

## ⚙️ Environment Setup

Create a `.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp_db
PORT=3000
NODE_ENV=development
```

## 🏃 Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000` by default.

## 📡 API Endpoints

See [API_ENDPOINTS.md](./API_ENDPOINTS.md) for complete API documentation.

### Quick Reference:

**Mobile Login (OTP):**
- `POST /api/otp/generate` - Generate OTP
- `POST /api/otp/verify` - Verify OTP

**Desktop Login (QR Code):**
- `POST /api/qr/generate` - Generate QR code
- `GET /api/qr/status/:qrToken` - Check QR status
- `POST /api/qr/scan` - Scan QR code (requires auth)
- `POST /api/qr/verify` - Verify QR code (requires auth)

**Authentication:**
- `POST /api/login` - Legacy login
- `POST /api/auth/generate-token` - Generate test token
- `GET /api/auth/verify` - Verify token (requires auth)

**Utilities:**
- `GET /health` - Health check
- `POST /api/seed/dummy-data` - Seed dummy users

## 🗄️ Database

The server connects to MongoDB and uses the following collections:
- `users` - User accounts
- `messages` - Chat messages
- `auth_tokens` - Authentication tokens
- `qr_codes` - QR login codes
- `otps` - OTP codes for mobile login

## 🧪 Seeding Data

To seed dummy users:

```bash
node scripts/seedData.js
```

Or use the API endpoint:

```bash
curl -X POST http://localhost:3000/api/seed/dummy-data \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_12345"}'
```

## 📝 Code Standards

This project follows Node.js/Express best practices:

- **Separation of Concerns**: Controllers handle business logic, routes define endpoints
- **Middleware**: Authentication and error handling in separate middleware files
- **Models**: All database schemas in models folder
- **Constants**: Application constants centralized in config
- **Utils**: Reusable helper functions in utils folder
- **Error Handling**: Centralized error handling middleware

## 🔒 Security Notes

- OTPs expire after 5 minutes
- QR codes expire after 5 minutes
- Auth tokens expire after 7 days
- OTP has maximum 3 verification attempts
- QR codes can only be used once
- Phone numbers are validated and normalized

## 🛠️ Development

- Use `npm run dev` for development with auto-reload (requires nodemon)
- OTPs are logged to console in development mode
- All endpoints return consistent JSON responses with `success` and `message` fields
