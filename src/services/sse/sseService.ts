import { Platform } from 'react-native';
import { StoredMessage } from '../../types/message';

// Use native EventSource for web, eventsource for React Native
// This prevents Node.js 'util.inherits' error on web
// We use a function to get EventSource to prevent static analysis from bundling eventsource for web
function getEventSource(): any {
  if (Platform.OS === 'web') {
    // Use browser's native EventSource API
    if (typeof window !== 'undefined' && (window as any).EventSource) {
      return (window as any).EventSource;
    }
    if (typeof global !== 'undefined' && (global as any).EventSource) {
      return (global as any).EventSource;
    }
    throw new Error('EventSource is not available in this browser');
  } else {
    // Dynamically require eventsource only for React Native
    // This prevents it from being bundled for web
    try {
      // Use a string to prevent static analysis
      const eventSourceModule = 'eventsource';
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require(eventSourceModule);
    } catch (e) {
      console.error('Failed to load eventsource for React Native:', e);
      // Fallback: try eventsource-polyfill
      try {
        const polyfillModule = 'eventsource-polyfill';
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require(polyfillModule);
      } catch (e2) {
        console.error('Failed to load eventsource-polyfill:', e2);
        throw new Error('EventSource is not available for this platform');
      }
    }
  }
}

const SSE_BASE_URL = 'https://example.com'; // Replace with your SSE endpoint
const DEFAULT_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 30000; // 30 seconds
const MAX_RECONNECT_ATTEMPTS = 10;

export interface SSEMessageEvent {
  id?: string;
  type?: string;
  data: string;
}

export interface SSESubscribeOptions {
  conversationId: string;
  token?: string; // Auth token for query param
  onMessage: (message: StoredMessage) => void;
  onStatusUpdate?: (messageId: string, status: 'delivered' | 'read') => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export interface SSESubscription {
  unsubscribe: () => void;
  reconnect: () => void;
  isConnected: () => boolean;
}

/**
 * Get auth token (implement your token retrieval logic)
 */
function getAuthToken(): string | undefined {
  // TODO: Replace with actual token retrieval from auth service/storage
  // Example: return AsyncStorage.getItem('auth_token');
  return undefined;
}

/**
 * Build SSE URL with conversation ID and optional token
 */
function buildSSEUrl(conversationId: string, token?: string): string {
  const url = new URL(`${SSE_BASE_URL}/api/sse`);
  url.searchParams.set('conversationId', conversationId);
  
  // Add token as query param if provided (EventSource doesn't support headers)
  const authToken = token || getAuthToken();
  if (authToken) {
    url.searchParams.set('token', authToken);
  }

  return url.toString();
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoffDelay(attempt: number): number {
  const delay = Math.min(
    DEFAULT_RECONNECT_DELAY * Math.pow(2, attempt),
    MAX_RECONNECT_DELAY
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

/**
 * Subscribe to SSE stream for a conversation
 */
export function subscribeToSSE(
  options: SSESubscribeOptions
): SSESubscription {
  const {
    conversationId,
    token,
    onMessage,
    onStatusUpdate,
    onError,
    onConnect,
    onDisconnect,
  } = options;

  const EventSourceClass = getEventSource();
  let eventSource: any = null;
  let reconnectAttempts = 0;
  let reconnectTimer: NodeJS.Timeout | null = null;
  let isSubscribed = false;
  let isManuallyClosed = false;

  const connect = () => {
    if (isManuallyClosed) {
      return;
    }

    try {
      const url = buildSSEUrl(conversationId, token);
      eventSource = new EventSourceClass(url);

      eventSource.onopen = () => {
        console.log('SSE connection opened for conversation:', conversationId);
        reconnectAttempts = 0;
        isSubscribed = true;
        onConnect?.();
      };

      eventSource.onmessage = (event: SSEMessageEvent) => {
        try {
          // Parse JSON data from SSE event
          const messageData = JSON.parse(event.data);
          
          // Validate and transform to StoredMessage format
          const storedMessage: StoredMessage = {
            id: messageData.id || messageData.messageId,
            text: messageData.text || messageData.message,
            senderId: messageData.senderId || messageData.userId,
            createdAt: messageData.createdAt || new Date().toISOString(),
            status: messageData.status || 'sent',
            serverId: messageData.id || messageData.messageId,
          };

          // Call callback with parsed message
          onMessage(storedMessage);
        } catch (parseError) {
          console.error('Error parsing SSE message:', parseError, event.data);
          onError?.(new Error('Failed to parse SSE message'));
        }
      };

      eventSource.onerror = (error: any) => {
        console.error('SSE error:', error);
        
        // EventSource.CLOSED = 2, EventSource.OPEN = 1, EventSource.CONNECTING = 0
        const CLOSED = 2;
        if (eventSource?.readyState === CLOSED) {
          isSubscribed = false;
          onDisconnect?.();

          // Attempt reconnection if not manually closed
          if (!isManuallyClosed && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            const delay = calculateBackoffDelay(reconnectAttempts);
            console.log(
              `Reconnecting SSE in ${delay}ms (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`
            );

            reconnectTimer = setTimeout(() => {
              reconnectAttempts++;
              connect();
            }, delay);
          } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.error('Max reconnection attempts reached');
            onError?.(new Error('Max reconnection attempts reached'));
          }
        } else {
          // Connection error but not closed
          onError?.(new Error('SSE connection error'));
        }
      };

      // Handle custom event types
      eventSource.addEventListener('ping', (event: any) => {
        console.log('SSE ping received');
      });

      // Handle message delivery status update
      eventSource.addEventListener('delivery', (event: any) => {
        try {
          const data = JSON.parse(event.data);
          const messageId = data.messageId || data.id;
          if (messageId && onStatusUpdate) {
            onStatusUpdate(messageId, 'delivered');
          }
        } catch (error) {
          console.error('Error handling delivery event:', error);
        }
      });

      // Handle message read status update
      eventSource.addEventListener('read', (event: any) => {
        try {
          const data = JSON.parse(event.data);
          const messageId = data.messageId || data.id;
          if (messageId && onStatusUpdate) {
            onStatusUpdate(messageId, 'read');
          }
        } catch (error) {
          console.error('Error handling read event:', error);
        }
      });

      // Handle message status update (generic)
      eventSource.addEventListener('status', (event: any) => {
        try {
          const data = JSON.parse(event.data);
          const messageId = data.messageId || data.id;
          const status = data.status; // 'delivered' | 'read'
          if (messageId && status && onStatusUpdate) {
            if (status === 'delivered' || status === 'read') {
              onStatusUpdate(messageId, status);
            }
          }
        } catch (error) {
          console.error('Error handling status event:', error);
        }
      });

      eventSource.addEventListener('error', (event: any) => {
        console.error('SSE custom error event:', event);
        onError?.(new Error('SSE error event received'));
      });
    } catch (error) {
      console.error('Error creating SSE connection:', error);
      onError?.(error as Error);
      
      // Attempt reconnection
      if (!isManuallyClosed && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = calculateBackoffDelay(reconnectAttempts);
        reconnectTimer = setTimeout(() => {
          reconnectAttempts++;
          connect();
        }, delay);
      }
    }
  };

  // Start connection
  connect();

  return {
    unsubscribe: () => {
      isManuallyClosed = true;
      
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }

      isSubscribed = false;
      console.log('SSE unsubscribed for conversation:', conversationId);
    },
    reconnect: () => {
      if (eventSource) {
        eventSource.close();
      }
      reconnectAttempts = 0;
      isManuallyClosed = false;
      connect();
    },
    isConnected: () => {
      // EventSource.OPEN = 1
      const OPEN = 1;
      return isSubscribed && eventSource?.readyState === OPEN;
    },
  };
}

/**
 * Update SSE base URL (useful for environment-specific configs)
 */
export function setSSEBaseUrl(url: string): void {
  // This would need to be implemented with a module-level variable
  // For now, update the constant above
  console.warn('setSSEBaseUrl: Update SSE_BASE_URL constant in sseService.ts');
}

