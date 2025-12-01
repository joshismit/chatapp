/**
 * API Configuration
 */

// API Base URL - Update for production
// For mobile devices, use your computer's IP: http://192.168.1.100:3000
// For web, use: http://localhost:3000
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const API_TIMEOUT = 10000; // 10 seconds

export const API_ENDPOINTS = {
  // Registration
  REGISTER: {
    CHECK_AVAILABILITY: '/api/register/check-availability',
    GENERATE_OTP: '/api/register/generate-otp',
    VERIFY_OTP: '/api/register/verify-otp',
  },
  // Authentication
  AUTH: {
    LOGIN: '/api/login',
    LOGOUT: '/api/auth/logout',
    VERIFY: '/api/auth/verify',
    GENERATE_TOKEN: '/api/auth/generate-token',
  },
  // OTP
  OTP: {
    GENERATE: '/api/otp/generate',
    VERIFY: '/api/otp/verify',
  },
  // QR Code
  QR: {
    GENERATE: '/api/qr/generate',
    STATUS: '/api/qr/status',
    SCAN: '/api/qr/scan',
    VERIFY: '/api/qr/verify',
  },
  // Chat
  CHAT: {
    CONVERSATIONS: '/api/chat/conversations',
    MESSAGES: '/api/chat/messages',
    STATUS: '/api/chat/status',
    TYPING: '/api/chat/typing',
  },
  // User
  USER: {
    SEED: '/api/seed/dummy-data',
  },
} as const;

