/**
 * Common Types
 */

/**
 * Network connectivity state
 */
export interface NetworkState {
  isConnected: boolean;
  type: string;
}

/**
 * SSE Event Types
 */

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
  status?: 'sending' | 'sent' | 'delivered' | 'read';
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
  onMessage: (message: import('./chat').StoredMessage) => void;
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

/**
 * Message reconciliation result
 */
export interface ReconciliationResult {
  merged: import('./chat').StoredMessage[];
  conflicts: Array<{
    local: import('./chat').StoredMessage;
    server: import('./chat').ServerMessage;
    resolution: 'server' | 'local';
  }>;
}

/**
 * Queued message reconciliation result
 */
export interface QueuedReconciliationResult {
  sent: import('./chat').QueuedMessage[];
  failed: import('./chat').QueuedMessage[];
  conflicts: Array<{
    queued: import('./chat').QueuedMessage;
    server: import('./chat').ServerMessage;
  }>;
}

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

