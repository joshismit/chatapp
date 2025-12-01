# Backend Structure Documentation

## 📁 Folder Structure

```
mock-backend/
├── config/                    # Configuration files
│   ├── database.js           # MongoDB connection setup
│   └── constants.js         # Application constants (expiration times, enums, etc.)
│
├── models/                    # Database models (Mongoose schemas)
│   └── index.js              # All database models exported
│
├── controllers/               # Business logic layer
│   ├── authController.js     # Authentication logic (login, token generation)
│   ├── otpController.js      # OTP generation and verification
│   ├── qrController.js       # QR code generation, scanning, verification
│   └── userController.js     # User-related operations (seed data)
│
├── routes/                    # Route definitions
│   ├── authRoutes.js         # Authentication routes
│   ├── otpRoutes.js          # OTP routes
│   ├── qrRoutes.js           # QR code routes
│   ├── userRoutes.js         # User routes
│   └── index.js              # Main routes file (combines all routes)
│
├── middleware/               # Express middleware
│   ├── auth.js               # Authentication middleware (token validation)
│   └── errorHandler.js       # Global error handling middleware
│
├── utils/                     # Utility functions
│   └── helpers.js            # Helper functions (token generation, validation, etc.)
│
├── scripts/                   # Utility scripts
│   └── seedData.js           # Script to seed dummy data
│
├── server.js                  # Main server file (entry point)
├── package.json              # Dependencies and scripts
└── .env                      # Environment variables
```

## 🔄 Data Flow

```
Request → Routes → Middleware → Controllers → Models → Database
                ↓
            Response
```

## 📝 File Responsibilities

### `server.js`
- Application entry point
- Express app setup
- Middleware configuration
- Route mounting
- Server startup

### `config/database.js`
- MongoDB connection
- Database connection handling

### `config/constants.js`
- All application constants
- Expiration times
- Enums (status types, token types, etc.)

### `models/index.js`
- All Mongoose schemas
- Database model definitions
- Index definitions

### Controllers (`controllers/*.js`)
- Business logic
- Request/response handling
- Database operations
- Error handling

### Routes (`routes/*.js`)
- Endpoint definitions
- Route-to-controller mapping
- Middleware application

### Middleware (`middleware/*.js`)
- Authentication validation
- Error handling
- Request preprocessing

### Utils (`utils/helpers.js`)
- Reusable helper functions
- Token generation
- Validation functions
- Data normalization

## 🔌 API Route Mapping

| Endpoint | Route File | Controller | Method |
|----------|-----------|------------|--------|
| `POST /api/otp/generate` | `otpRoutes.js` | `otpController.generateOTPForPhone` | POST |
| `POST /api/otp/verify` | `otpRoutes.js` | `otpController.verifyOTP` | POST |
| `POST /api/qr/generate` | `qrRoutes.js` | `qrController.generateQRCode` | POST |
| `GET /api/qr/status/:qrToken` | `qrRoutes.js` | `qrController.checkQRStatus` | GET |
| `POST /api/qr/scan` | `qrRoutes.js` | `qrController.scanQRCode` | POST (auth) |
| `POST /api/qr/verify` | `qrRoutes.js` | `qrController.verifyQRCode` | POST (auth) |
| `POST /api/login` | `routes/index.js` | `authController.legacyLogin` | POST |
| `POST /api/auth/generate-token` | `authRoutes.js` | `authController.generateToken` | POST |
| `GET /api/auth/verify` | `authRoutes.js` | `authController.verifyToken` | GET (auth) |
| `POST /api/seed/dummy-data` | `userRoutes.js` | `userController.seedDummyData` | POST |
| `GET /health` | `routes/index.js` | Inline handler | GET |

## 🎯 Best Practices Followed

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **DRY Principle**: Reusable functions in utils
3. **Single Responsibility**: Each controller handles one feature
4. **Modularity**: Routes and controllers are separated by feature
5. **Error Handling**: Centralized error handling middleware
6. **Constants Management**: All constants in one place
7. **Code Organization**: Logical folder structure
8. **Maintainability**: Easy to find and modify code

## 🚀 Adding New Features

1. **New Model**: Add schema to `models/index.js`
2. **New Controller**: Create file in `controllers/`
3. **New Routes**: Create file in `routes/` and mount in `routes/index.js`
4. **New Middleware**: Create file in `middleware/` and use in routes
5. **New Utils**: Add functions to `utils/helpers.js`

## 📦 Dependencies

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `cors` - CORS middleware
- `dotenv` - Environment variables

## 🔧 Development

- Use `npm run dev` for development with auto-reload
- All endpoints return consistent JSON format
- Error handling is centralized
- Logging is done via console (can be replaced with winston/morgan)

