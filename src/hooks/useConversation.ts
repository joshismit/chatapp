import { useState, useCallback, useRef, useEffect } from 'react';
import {
  loadLastMessages,
  saveConversation,
  getOldestMessageTimestamp,
  prependMessages,
  loadConversation,
  archiveConversation,
} from '../services/storage';
import { updateMessageStatus } from '../services/storage/messageStatus';
import { storedMessageToMessage, messageToStoredMessage } from '../utils/messageConverter';
import { subscribeToSSE, SSESubscription } from '../services/sse';
import { getMessages, sendMessage as sendMessageAPI } from '../services/api/messageService';
import { StoredMessage } from '../types/message';
import { Message } from '../components/chat/MessageBubble';

const INITIAL_MESSAGE_LIMIT = 50;
const PAGINATION_LIMIT = 20;

export interface UseConversationOptions {
  conversationId: string;
  senderId: string;
  token?: string; // SSE auth token
  initialLimit?: number; // Override default initial load limit
}

export interface UseConversationReturn {
  // State
  messages: Message[];
  status: {
    loading: boolean;
    loadingOlder: boolean;
    hasMoreMessages: boolean;
    error: Error | null;
  };
  
  // Actions
  sendMessage: (text: string) => Promise<{ success: boolean; error?: SendMessageError }>;
  retryMessage: (message: Message) => Promise<{ success: boolean; error?: SendMessageError }>;
  loadOlder: () => Promise<void>;
  archive: () => Promise<void>;
  
  // Utilities
  refresh: () => Promise<void>;
}

/**
 * Hook for managing conversation state, messages, SSE, and persistence
 */
export function useConversation(
  options: UseConversationOptions
): UseConversationReturn {
  const { conversationId, senderId, token, initialLimit = INITIAL_MESSAGE_LIMIT } = options;

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Refs
  const sseSubscriptionRef = useRef<SSESubscription | null>(null);

  /**
   * Generate temporary ID for optimistic messages
   */
  const generateTempId = useCallback(() => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Persist messages to storage
   */
  const persistMessages = useCallback(
    async (messagesToSave: Message[]) => {
      try {
        const storedMessages = messagesToSave.map((msg) =>
          messageToStoredMessage(msg, msg.isSent ? senderId : conversationId)
        );
        await saveConversation(conversationId, storedMessages);
      } catch (err) {
        console.error('Error persisting messages:', err);
      }
    },
    [conversationId, senderId]
  );

  /**
   * Load messages from storage
   */
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const storedMessages = await loadLastMessages(conversationId, initialLimit);

      if (storedMessages.length > 0) {
        const uiMessages = storedMessages.map(storedMessageToMessage);
        setMessages(uiMessages);
        setHasMoreMessages(storedMessages.length === initialLimit);
      } else {
        setMessages([]);
        setHasMoreMessages(true);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err as Error);
      setMessages([]);
      setHasMoreMessages(true);
    } finally {
      setLoading(false);
    }
  }, [conversationId, initialLimit]);

  /**
   * Handle message status updates (delivered/read)
   */
  const handleStatusUpdate = useCallback(
    async (messageId: string, newStatus: 'delivered' | 'read') => {
      try {
        const updatedMessage = await updateMessageStatus(
          conversationId,
          messageId,
          newStatus
        );

        if (updatedMessage) {
          setMessages((prev) =>
            prev.map((msg) => {
              if (
                msg.id === messageId ||
                msg.id === updatedMessage.id ||
                msg.id === updatedMessage.serverId
              ) {
                return { ...msg, status: newStatus };
              }
              return msg;
            })
          );
        }
      } catch (err) {
        console.error('Error updating message status:', err);
      }
    },
    [conversationId]
  );

  /**
   * Handle new message from SSE
   */
  const handleNewMessage = useCallback(
    async (storedMessage: StoredMessage) => {
      try {
        const uiMessage = storedMessageToMessage(storedMessage);

        setMessages((prev) => {
          const alreadyExists = prev.some(
            (msg) =>
              msg.id === uiMessage.id ||
              msg.id === storedMessage.serverId ||
              (storedMessage.serverId && msg.id === storedMessage.id)
          );

          if (alreadyExists) {
            return prev;
          }

          return [uiMessage, ...prev];
        });

        // Persist to storage
        const existingMessages = await loadConversation(conversationId);
        const updatedMessages = [storedMessage, ...existingMessages];

        const uniqueMessages = updatedMessages.filter(
          (msg, index, self) =>
            index ===
            self.findIndex(
              (m) => m.id === msg.id || (msg.serverId && m.id === msg.serverId)
            )
        );

        await saveConversation(conversationId, uniqueMessages);
      } catch (err) {
        console.error('Error handling new SSE message:', err);
      }
    },
    [conversationId]
  );

  /**
   * Send message with optimistic updates
   */
  const sendMessage = useCallback(
    async (text: string): Promise<{ success: boolean; error?: SendMessageError }> => {
      const tempId = generateTempId();

      const optimisticMessage: Message = {
        id: tempId,
        text,
        isSent: true,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        status: 'sending',
      };

      // Optimistic update
      const updatedMessages = [optimisticMessage, ...messages];
      setMessages(updatedMessages);
      await persistMessages(updatedMessages);

      try {
      const response = await sendMessageAPI({
        conversationId,
        text,
        type: 'text',
      });

      // Update with server response
      const serverStoredMessage: StoredMessage = {
        id: response.message.messageId,
        text: response.message.text,
        senderId: response.message.senderId,
        createdAt: response.message.createdAt,
        status: 'sent',
        serverId: response.message.messageId,
      };

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? {
                  ...msg,
                  id: response.message.messageId,
                  status: 'sent',
                }
              : msg
          )
        );

        // Persist server message
        const existingMessages = await loadConversation(conversationId);
        await saveConversation(conversationId, [
          serverStoredMessage,
          ...existingMessages,
        ]);

        return { success: true };
      } catch (err: any) {
        const errorMessage: SendMessageError = {
          message: err.message || 'Failed to send message',
          code: err.code,
        };

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, status: 'failed' } : msg
          )
        );

        await persistMessages(
          messages.map((msg) =>
            msg.id === tempId ? { ...msg, status: 'failed' } : msg
          )
        );

        return { success: false, error: errorMessage };
      }
    },
    [conversationId, senderId, messages, generateTempId, persistMessages]
  );

  /**
   * Retry failed message
   */
  const retryMessage = useCallback(
    async (failedMessage: Message): Promise<{ success: boolean; error?: SendMessageError }> => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === failedMessage.id ? { ...msg, status: 'sending' } : msg
        )
      );

      try {
        const storedMessage = messageToStoredMessage(failedMessage, senderId);
        const response = await sendMessageAPI({
          conversationId,
          text: storedMessage.text,
          type: 'text',
        });

        const serverStoredMessage: StoredMessage = {
          id: response.message.messageId,
          text: response.message.text,
          senderId: response.message.senderId,
          createdAt: response.message.createdAt,
          status: 'sent',
          serverId: response.message.messageId,
        };

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === failedMessage.id
              ? {
                  ...msg,
                  id: response.messageId,
                  status: 'sent',
                }
              : msg
          )
        );

        // Persist
        const existingMessages = await loadConversation(conversationId);
        await saveConversation(conversationId, [
          serverStoredMessage,
          ...existingMessages,
        ]);

        return { success: true };
      } catch (err: any) {
        const errorMessage: SendMessageError = {
          message: err.message || 'Failed to retry message',
          code: err.code,
        };

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === failedMessage.id ? { ...msg, status: 'failed' } : msg
          )
        );

        return { success: false, error: errorMessage };
      }
    },
    [conversationId, senderId]
  );

  /**
   * Load older messages (pagination)
   */
  const loadOlder = useCallback(async () => {
    if (loadingOlder || !hasMoreMessages || messages.length === 0) {
      return;
    }

    try {
      setLoadingOlder(true);

      const oldestTimestamp = await getOldestMessageTimestamp(conversationId);

      if (!oldestTimestamp) {
        setHasMoreMessages(false);
        return;
      }

      const response = await getMessages(
        conversationId,
        PAGINATION_LIMIT,
        messages.length,
        oldestTimestamp
      );

      if (!response.success || response.messages.length === 0) {
        setHasMoreMessages(false);
        return;
      }

      const storedMessages: StoredMessage[] = response.messages.map((msg) => ({
        id: msg.messageId,
        text: msg.text,
        senderId: msg.senderId,
        createdAt: msg.createdAt,
        status: msg.status as 'sent' | 'delivered' | 'read',
        serverId: msg.messageId,
      }));

      await prependMessages(conversationId, storedMessages);

      const uiMessages = storedMessages.map(storedMessageToMessage);
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newMessages = uiMessages.filter((m) => !existingIds.has(m.id));
        return [...prev, ...newMessages];
      });

      setHasMoreMessages(response.hasMore);
    } catch (err) {
      console.error('Error loading older messages:', err);
      setError(err as Error);
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, loadingOlder, hasMoreMessages, messages.length]);

  /**
   * Archive conversation
   */
  const archive = useCallback(async () => {
    try {
      await archiveConversation(conversationId);
    } catch (err) {
      console.error('Error archiving conversation:', err);
      setError(err as Error);
      throw err;
    }
  }, [conversationId]);

  /**
   * Refresh messages
   */
  const refresh = useCallback(async () => {
    await loadMessages();
  }, [loadMessages]);

  // Initial load
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Subscribe to SSE
  useEffect(() => {
    if (loading) {
      return;
    }

    const subscription = subscribeToSSE({
      conversationId,
      token,
      onMessage: handleNewMessage,
      onStatusUpdate: handleStatusUpdate,
      onError: (err) => {
        console.error('SSE error:', err);
        setError(err);
      },
      onConnect: () => {
        console.log('SSE connected for conversation:', conversationId);
      },
      onDisconnect: () => {
        console.log('SSE disconnected for conversation:', conversationId);
      },
    });

    sseSubscriptionRef.current = subscription;

    return () => {
      if (sseSubscriptionRef.current) {
        sseSubscriptionRef.current.unsubscribe();
        sseSubscriptionRef.current = null;
      }
    };
  }, [conversationId, loading, token, handleNewMessage, handleStatusUpdate]);

  return {
    messages,
    status: {
      loading,
      loadingOlder,
      hasMoreMessages,
      error,
    },
    sendMessage,
    retryMessage,
    loadOlder,
    archive,
    refresh,
  };
}

