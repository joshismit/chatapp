import { Platform } from 'react-native';
import { StoredMessage } from '../../types/message';

// React Native compatible EventSource implementation
// Uses native EventSource for web, fetch-based SSE for React Native
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
    // For React Native, use a fetch-based EventSource polyfill
    // This avoids Node.js dependencies that aren't available in React Native
    return ReactNativeEventSource;
  }
}

// React Native compatible EventSource implementation using fetch
class ReactNativeEventSource {
  private url: string;
  private withCredentials: boolean;
  private readyState: number;
  private abortController: AbortController | null = null;
  private onopen: ((event: any) => void) | null = null;
  private onmessage: ((event: any) => void) | null = null;
  private onerror: ((event: any) => void) | null = null;
  private eventListeners: Map<string, ((event: any) => void)[]> = new Map();
  private isClosed: boolean = false;

  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 2;

  constructor(url: string, eventSourceInitDict?: { withCredentials?: boolean }) {
    this.url = url;
    this.withCredentials = eventSourceInitDict?.withCredentials ?? false;
    this.readyState = ReactNativeEventSource.CONNECTING;
    this.connect();
  }

  private async connect() {
    if (this.isClosed) return;

    try {
      this.abortController = new AbortController();
      const response = await fetch(this.url, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          Cache: 'no-cache',
        },
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      this.readyState = ReactNativeEventSource.OPEN;
      this.onopen?.({ type: 'open' });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        if (this.isClosed) {
          reader.cancel();
          break;
        }

        const { done, value } = await reader.read();
        
        if (done) {
          this.readyState = ReactNativeEventSource.CLOSED;
          this.onerror?.({ type: 'error' });
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let eventType = 'message';
        let data = '';
        let eventId = '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.substring(6).trim();
          } else if (line.startsWith('data:')) {
            data += (data ? '\n' : '') + line.substring(5).trim();
          } else if (line.startsWith('id:')) {
            eventId = line.substring(3).trim();
          } else if (line === '') {
            if (data) {
              const event = {
                type: eventType,
                data: data,
                id: eventId || undefined,
              };

              if (eventType === 'message') {
                this.onmessage?.(event);
              }

              const listeners = this.eventListeners.get(eventType);
              if (listeners) {
                listeners.forEach((listener) => listener(event));
              }
            }
            eventType = 'message';
            data = '';
            eventId = '';
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Connection was manually closed
        return;
      }
      this.readyState = ReactNativeEventSource.CLOSED;
      this.onerror?.({ type: 'error', error });
    }
  }

  addEventListener(type: string, listener: (event: any) => void) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)?.push(listener);
  }

  removeEventListener(type: string, listener: (event: any) => void) {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  close() {
    this.isClosed = true;
    this.readyState = ReactNativeEventSource.CLOSED;
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}

// Get API base URL from config
let SSE_BASE_URL = 'http://localhost:3000'; // Default, will be updated from config
try {
  const apiConfig = require('../../app/config/api');
  SSE_BASE_URL = apiConfig.API_BASE_URL || SSE_BASE_URL;
} catch (error) {
  // Config not available, use default
}
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
  // Use relative URL if base URL is localhost (for same origin)
  const baseUrl = SSE_BASE_URL.includes('localhost') || SSE_BASE_URL.includes('127.0.0.1')
    ? '' // Relative URL for same origin
    : SSE_BASE_URL;
  
  const url = new URL(`${baseUrl}/api/sse`, baseUrl || window.location.origin);
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

      // Handle explicit message event type (backend sends event: message)
      eventSource.addEventListener('message', (event: any) => {
        try {
          const messageData = JSON.parse(event.data);
          // Only process if it's actually a message (has messageId or id)
          if (messageData.messageId || messageData.id) {
            const storedMessage: StoredMessage = {
              id: messageData.id || messageData.messageId,
              text: messageData.text || messageData.message,
              senderId: messageData.senderId || messageData.userId,
              createdAt: messageData.createdAt || new Date().toISOString(),
              status: messageData.status || 'sent',
              serverId: messageData.id || messageData.messageId,
            };
            onMessage(storedMessage);
          }
        } catch (parseError) {
          console.error('Error parsing SSE message event:', parseError);
          onError?.(new Error('Failed to parse SSE message event'));
        }
      });

      // Handle custom event types
      eventSource.addEventListener('ping', (event: any) => {
        console.log('SSE ping received');
      });

      // Handle status update event
      eventSource.addEventListener('statusUpdate', (event: any) => {
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
          console.error('Error handling statusUpdate event:', error);
        }
      });

      // Handle typing event
      eventSource.addEventListener('typing', (event: any) => {
        try {
          const data = JSON.parse(event.data);
          // Typing indicators are handled separately if needed
          console.log('Typing event:', data);
        } catch (error) {
          console.error('Error handling typing event:', error);
        }
      });

      // Handle online status event
      eventSource.addEventListener('onlineStatus', (event: any) => {
        try {
          const data = JSON.parse(event.data);
          // Online status updates are handled separately if needed
          console.log('Online status event:', data);
        } catch (error) {
          console.error('Error handling onlineStatus event:', error);
        }
      });

      // Handle connected event
      eventSource.addEventListener('connected', (event: any) => {
        try {
          const data = JSON.parse(event.data);
          console.log('SSE connected:', data);
        } catch (error) {
          console.error('Error handling connected event:', error);
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

