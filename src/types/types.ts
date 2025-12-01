/**
 * Centralized TypeScript type definitions for the chat application
 */

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  userId: string; // Backend uses userId
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  avatar?: string | null; // Backend uses avatar
  email?: string;
  phoneNumber?: string;
  isOnline?: boolean;
  lastSeen?: string; // ISO timestamp
  status?: string; // User status message
  isRegistered?: boolean;
  registrationMethod?: 'phone' | 'email' | 'qr';
}

// ============================================================================
// Message Status
// ============================================================================

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

// ============================================================================
// Message Types
// ============================================================================

/**
 * Message as stored in AsyncStorage
 */
export interface StoredMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: string; // ISO 8601 format
  status: MessageStatus;
  archived?: boolean;
  serverId?: string; // Server-assigned ID after successful send
  errorMessage?: string; // Error message if failed
}

/**
 * Message as displayed in UI (MessageBubble component)
 */
export interface UIMessage {
  id: string;
  text: string;
  isSent: boolean;
  timestamp: string; // Formatted timestamp for display
  status?: MessageStatus;
}

/**
 * Message from server API
 */
export interface ServerMessage {
  id?: string; // Legacy
  messageId: string; // Backend uses messageId
  conversationId: string;
  text: string;
  senderId: string;
  sender?: {
    userId: string;
    displayName: string;
    avatar?: string | null;
  };
  type?: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location';
  createdAt: string; // ISO 8601 format
  updatedAt?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string | null;
  reactions?: Array<{
    userId: string;
    emoji: string;
    createdAt: string;
  }>;
}

/**
 * Queued message for offline sending
 */
export interface QueuedMessage {
  id: string; // Local temporary ID
  conversationId: string;
  text: string;
  senderId: string;
  createdAt: string; // ISO timestamp
  localTimestamp: string; // When queued locally
  retryCount: number;
  status: 'queued' | 'sending' | 'failed';
}

// ============================================================================
// Conversation Types
// ============================================================================

/**
 * Conversation metadata stored in AsyncStorage
 */
export interface ConversationMetadata {
  conversationId: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  archived?: boolean;
}

/**
 * Full conversation with messages
 */
export interface Conversation {
  id: string;
  participants: string[]; // User IDs
  messages: StoredMessage[];
  metadata: ConversationMetadata;
  createdAt: string;
  updatedAt: string;
}

/**
 * Chat list item data
 */
export interface ChatItemData {
  id: string;
  userName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  avatarColor?: string;
}

// ============================================================================
// SSE Event Types
// ============================================================================

/**
 * Raw SSE message event
 */
export interface SSEMessageEvent {
  id?: string;
  type?: string;
  data: string;
}

/**
 * Parsed SSE message event data
 */
export interface SSEMessageData {
  id?: string;
  messageId?: string;
  text?: string;
  message?: string;
  senderId?: string;
  userId?: string;
  createdAt?: string;
  status?: MessageStatus;
}

/**
 * SSE status update event data
 */
export interface SSEStatusUpdateData {
  messageId: string;
  id?: string;
  status: 'delivered' | 'read';
  conversationId?: string;
}

/**
 * SSE subscription options
 */
export interface SSESubscribeOptions {
  conversationId: string;
  token?: string; // Auth token for query param
  onMessage: (message: StoredMessage) => void;
  onStatusUpdate?: (messageId: string, status: 'delivered' | 'read') => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

/**
 * SSE subscription handle
 */
export interface SSESubscription {
  unsubscribe: () => void;
  reconnect: () => void;
  isConnected: () => boolean;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Send message request
 */
export interface SendMessageRequest {
  conversationId: string;
  text: string;
  senderId: string;
}

/**
 * Send message response
 */
export interface SendMessageResponse {
  messageId: string;
  conversationId: string;
  text: string;
  senderId: string;
  createdAt: string;
  status: 'sent';
}

/**
 * Send message error
 */
export interface SendMessageError {
  message: string;
  code?: string;
}

/**
 * Fetch messages request (pagination)
 */
export interface FetchMessagesRequest {
  conversationId: string;
  before?: string; // ISO timestamp for pagination
  limit?: number; // Number of messages to fetch (default: 20)
}

/**
 * Fetch messages response
 */
export interface FetchMessagesResponse {
  messages: ServerMessage[];
  hasMore: boolean; // Whether more messages are available
}

// ============================================================================
// Network Types
// ============================================================================

/**
 * Network connectivity state
 */
export interface NetworkState {
  isConnected: boolean;
  type: string;
}

// ============================================================================
// Reconciliation Types
// ============================================================================

/**
 * Message reconciliation result
 */
export interface ReconciliationResult {
  merged: StoredMessage[];
  conflicts: Array<{
    local: StoredMessage;
    server: ServerMessage;
    resolution: 'server' | 'local';
  }>;
}

/**
 * Queued message reconciliation result
 */
export interface QueuedReconciliationResult {
  sent: QueuedMessage[];
  failed: QueuedMessage[];
  conflicts: Array<{
    queued: QueuedMessage;
    server: ServerMessage;
  }>;
}

// ============================================================================
// Queue Flush Result
// ============================================================================

/**
 * Result of flushing offline queue
 */
export interface QueueFlushResult {
  success: number;
  failed: number;
  errors: Array<{
    messageId: string;
    error: string;
  }>;
}

// ============================================================================
// Navigation Types
// ============================================================================

import { NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  Chats: undefined;
  Archived: undefined;
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatScreen: {
    chatId: string;
    conversationId?: string;
    userName?: string;
  };
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<RootTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

