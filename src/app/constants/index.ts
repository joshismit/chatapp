/**
 * Application Constants
 */

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  CURRENT_USER_ID: 'currentUserId',
  DATA_SEEDED: 'dataSeeded',
  CONVERSATION_PREFIX: 'conversation:',
  CONVERSATIONS_LIST: 'conversations:list',
} as const;

// Message Status
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
} as const;

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  FILE: 'file',
  LOCATION: 'location',
} as const;

// Conversation Types
export const CONVERSATION_TYPES = {
  DIRECT: 'direct',
  GROUP: 'group',
} as const;

// Pagination
export const PAGINATION = {
  INITIAL_MESSAGE_LIMIT: 50,
  MESSAGE_LIMIT: 20,
  CONVERSATION_LIMIT: 50,
} as const;

// Typing Indicator
export const TYPING_INDICATOR_EXPIRY = 3000; // 3 seconds

// OTP
export const OTP_EXPIRY = 300; // 5 minutes in seconds

// Colors
export const COLORS = {
  PRIMARY: '#6200ee',
  SECONDARY: '#25D366',
  ERROR: '#F44336',
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  BACKGROUND: '#FFFFFF',
  SURFACE: '#F0F2F5',
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#667781',
} as const;

// Timeouts
export const TIMEOUTS = {
  API_REQUEST: 10000,
  TYPING_INDICATOR: 3000,
  NETWORK_RETRY: 5000,
} as const;

