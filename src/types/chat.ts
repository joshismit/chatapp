/**
 * Chat Types
 */

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'location';

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
  type?: MessageType;
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

/**
 * Send message request
 */
export interface SendMessageRequest {
  conversationId: string;
  text: string;
  type?: MessageType;
  replyTo?: string | null;
}

/**
 * Send message response
 */
export interface SendMessageResponse {
  success: boolean;
  message: {
    messageId: string;
    conversationId: string;
    senderId: string;
    sender: {
      userId: string;
      displayName: string;
      avatar?: string | null;
    };
    text: string;
    type: string;
    status: 'sending' | 'sent' | 'delivered' | 'read';
    replyTo: string | null;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
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
  success: boolean;
  messages: ServerMessage[];
  total: number;
  hasMore: boolean;
  message: string;
}

