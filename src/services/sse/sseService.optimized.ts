import { Platform, AppState, AppStateStatus } from 'react-native';
import { StoredMessage } from '../../types/message';

// Use native EventSource for web, eventsource for React Native
function getEventSource(): any {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && (window as any).EventSource) {
      return (window as any).EventSource;
    }
    if (typeof global !== 'undefined' && (global as any).EventSource) {
      return (global as any).EventSource;
    }
    throw new Error('EventSource is not available in this browser');
  } else {
    try {
      const eventSourceModule = 'eventsource';
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require(eventSourceModule);
    } catch (e) {
      console.error('Failed to load eventsource for React Native:', e);
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

const SSE_BASE_URL = 'https://example.com';
const DEFAULT_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
const MAX_RECONNECT_ATTEMPTS = 10;

// Connection health monitoring
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const STALE_CONNECTION_THRESHOLD = 60000; // 60 seconds without messages = stale
const BACKGROUND_DISCONNECT_DELAY = 5000; // Disconnect 5 seconds after background

export interface SSEMessageEvent {
  id?: string;
  type?: string;
  data: string;
}

export interface SSESubscribeOptions {
  conversationId: string;
  token?: string;
  onMessage: (message: StoredMessage) => void;
  onStatusUpdate?: (messageId: string, status: 'delivered' | 'read') => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onHealthCheck?: (isHealthy: boolean) => void; // New: health check callback
}

export interface SSESubscription {
  unsubscribe: () => void;
  reconnect: () => void;
  isConnected: () => boolean;
  getHealthStatus: () => { isHealthy: boolean; lastMessageTime: number | null }; // New: health status
}

/**
 * Optimized SSE service with:
 * - Connection health monitoring
 * - Background disconnect policies
 * - Enhanced reconnection limits
 * - Heartbeat mechanism
 */
export function subscribeToSSE(options: SSESubscribeOptions): SSESubscription {
  const {
    conversationId,
    token,
    onMessage,
    onStatusUpdate,
    onError,
    onConnect,
    onDisconnect,
    onHealthCheck,
  } = options;

  const EventSourceClass = getEventSource();
  let eventSource: any = null;
  let reconnectAttempts = 0;
  let reconnectTimer: NodeJS.Timeout | null = null;
  let heartbeatTimer: NodeJS.Timeout | null = null;
  let backgroundDisconnectTimer: NodeJS.Timeout | null = null;
  let isSubscribed = false;
  let isManuallyClosed = false;
  let lastMessageTime: number | null = null;
  let appStateListener: ((state: AppStateStatus) => void) | null = null;

  // Health check function
  const checkConnectionHealth = () => {
    const now = Date.now();
    const isHealthy =
      eventSource?.readyState === 1 && // OPEN
      (lastMessageTime === null || now - lastMessageTime < STALE_CONNECTION_THRESHOLD);

    onHealthCheck?.(isHealthy);

    if (!isHealthy && eventSource?.readyState === 1) {
      console.warn('SSE connection appears stale, attempting reconnect');
      reconnect();
    }
  };

  // Setup heartbeat
  const setupHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
    }
    heartbeatTimer = setInterval(() => {
      checkConnectionHealth();
    }, HEARTBEAT_INTERVAL);
  };

  // Cleanup heartbeat
  const cleanupHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  // Handle app state changes (background/foreground)
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // Disconnect after delay when app goes to background
      backgroundDisconnectTimer = setTimeout(() => {
        if (eventSource && !isManuallyClosed) {
          console.log('App in background, disconnecting SSE');
          eventSource.close();
          eventSource = null;
          isSubscribed = false;
          onDisconnect?.();
          cleanupHeartbeat();
        }
      }, BACKGROUND_DISCONNECT_DELAY);
    } else if (nextAppState === 'active') {
      // Cancel background disconnect if app comes to foreground
      if (backgroundDisconnectTimer) {
        clearTimeout(backgroundDisconnectTimer);
        backgroundDisconnectTimer = null;
      }

      // Reconnect if not connected
      if (!isSubscribed && !isManuallyClosed && eventSource === null) {
        console.log('App in foreground, reconnecting SSE');
        reconnectAttempts = 0; // Reset attempts on foreground
        connect();
      }
    }
  };

  // Setup app state listener (only for mobile)
  if (Platform.OS !== 'web') {
    const AppState = require('react-native').AppState;
    appStateListener = handleAppStateChange;
    AppState.addEventListener('change', appStateListener);
  }

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
        lastMessageTime = Date.now();
        setupHeartbeat();
        onConnect?.();
      };

      eventSource.onmessage = (event: SSEMessageEvent) => {
        try {
          lastMessageTime = Date.now(); // Update last message time
          const messageData = JSON.parse(event.data);

          const storedMessage: StoredMessage = {
            id: messageData.id || messageData.messageId,
            text: messageData.text || messageData.message,
            senderId: messageData.senderId || messageData.userId,
            createdAt: messageData.createdAt || new Date().toISOString(),
            status: messageData.status || 'sent',
            serverId: messageData.id || messageData.messageId,
          };

          onMessage(storedMessage);
        } catch (parseError) {
          console.error('Error parsing SSE message:', parseError, event.data);
          onError?.(new Error('Failed to parse SSE message'));
        }
      };

      eventSource.onerror = (error: any) => {
        console.error('SSE error:', error);

        const CLOSED = 2;
        if (eventSource?.readyState === CLOSED) {
          isSubscribed = false;
          cleanupHeartbeat();
          onDisconnect?.();

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
          onError?.(new Error('SSE connection error'));
        }
      };

      // Handle custom events
      eventSource.addEventListener('ping', () => {
        lastMessageTime = Date.now();
        console.log('SSE ping received');
      });

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

      eventSource.addEventListener('status', (event: any) => {
        try {
          const data = JSON.parse(event.data);
          const messageId = data.messageId || data.id;
          const status = data.status;
          if (messageId && status && onStatusUpdate) {
            if (status === 'delivered' || status === 'read') {
              onStatusUpdate(messageId, status);
            }
          }
        } catch (error) {
          console.error('Error handling status event:', error);
        }
      });
    } catch (error) {
      console.error('Error creating SSE connection:', error);
      onError?.(error as Error);

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

      // Cleanup timers
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (backgroundDisconnectTimer) {
        clearTimeout(backgroundDisconnectTimer);
        backgroundDisconnectTimer = null;
      }
      cleanupHeartbeat();

      // Remove app state listener
      if (appStateListener && Platform.OS !== 'web') {
        const AppState = require('react-native').AppState;
        AppState.removeEventListener('change', appStateListener);
        appStateListener = null;
      }

      // Close connection
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
      const OPEN = 1;
      return isSubscribed && eventSource?.readyState === OPEN;
    },
    getHealthStatus: () => {
      const now = Date.now();
      const isHealthy =
        eventSource?.readyState === 1 &&
        (lastMessageTime === null || now - lastMessageTime < STALE_CONNECTION_THRESHOLD);
      return { isHealthy, lastMessageTime };
    },
  };
}

function buildSSEUrl(conversationId: string, token?: string): string {
  const url = new URL(`${SSE_BASE_URL}/api/sse`);
  url.searchParams.set('conversationId', conversationId);
  if (token) {
    url.searchParams.set('token', token);
  }
  return url.toString();
}

function calculateBackoffDelay(attempt: number): number {
  const delay = Math.min(
    DEFAULT_RECONNECT_DELAY * Math.pow(2, attempt),
    MAX_RECONNECT_DELAY
  );
  return delay + Math.random() * 1000;
}

