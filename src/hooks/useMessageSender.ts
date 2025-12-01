import { useCallback } from 'react';
import { sendMessage } from '../services/api/messageService';
import { saveConversation } from '../services/storage';
import { StoredMessage } from '../types/message';
import { messageToStoredMessage } from '../utils/messageConverter';
import { Message } from '../components/chat/MessageBubble';

interface UseMessageSenderOptions {
  conversationId: string;
  senderId: string;
  onMessageUpdate: (messages: Message[]) => void;
  currentMessages: Message[];
}

interface SendMessageResult {
  success: boolean;
  error?: { message: string; code?: string };
}

/**
 * Hook for managing message sending with optimistic updates
 */
export function useMessageSender({
  conversationId,
  senderId,
  onMessageUpdate,
  currentMessages,
}: UseMessageSenderOptions) {
  /**
   * Generate a temporary ID for optimistic message
   */
  const generateTempId = useCallback(() => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Save messages to storage
   */
  const persistMessages = useCallback(
    async (messages: Message[]) => {
      try {
        const storedMessages = messages.map((msg) =>
          messageToStoredMessage(msg, msg.isSent ? senderId : conversationId)
        );
        await saveConversation(conversationId, storedMessages);
      } catch (error) {
        console.error('Error persisting messages:', error);
      }
    },
    [conversationId, senderId]
  );

  /**
   * Update message status in UI and storage
   */
  const updateMessageStatus = useCallback(
    async (tempId: string, updates: Partial<Message>) => {
      const updatedMessages = currentMessages.map((msg) =>
        msg.id === tempId ? { ...msg, ...updates } : msg
      );
      onMessageUpdate(updatedMessages);
      await persistMessages(updatedMessages);
    },
    [currentMessages, onMessageUpdate, persistMessages]
  );

  /**
   * Replace temporary message with server message
   */
  const replaceTempMessage = useCallback(
    async (tempId: string, serverMessage: StoredMessage) => {
      const updatedMessages = currentMessages.map((msg) =>
        msg.id === tempId
          ? {
              ...msg,
              id: serverMessage.id,
              status: serverMessage.status as Message['status'],
            }
          : msg
      );
      onMessageUpdate(updatedMessages);
      await persistMessages(updatedMessages);
    },
    [currentMessages, onMessageUpdate, persistMessages]
  );

  /**
   * Send a message with optimistic updates
   */
  const sendMessageWithOptimisticUpdate = useCallback(
    async (messageText: string): Promise<SendMessageResult> => {
      // Generate temporary ID
      const tempId = generateTempId();

      // Create optimistic message
      const optimisticMessage: Message = {
        id: tempId,
        text: messageText,
        isSent: true,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        status: 'sending',
      };

      // Update UI immediately (optimistic update)
      const updatedMessages = [optimisticMessage, ...currentMessages];
      onMessageUpdate(updatedMessages);
      await persistMessages(updatedMessages);

      try {
        // Attempt to send to server
        const response = await sendMessage({
          conversationId,
          text: messageText,
          type: 'text',
        });

        // On success: update status to "sent" and replace temp ID with server ID
        const serverStoredMessage: StoredMessage = {
          id: response.message.messageId,
          text: response.message.text,
          senderId: response.message.senderId,
          createdAt: response.message.createdAt,
          status: 'sent',
          serverId: response.message.messageId,
        };

        await replaceTempMessage(tempId, serverStoredMessage);

        return { success: true };
      } catch (error: any) {
        // On failure: mark as "failed"
        const errorMessage = {
          message: error.message || 'Failed to send message',
          code: error.code,
        };

        await updateMessageStatus(tempId, {
          status: 'failed',
        });

        return { success: false, error: errorMessage };
      }
    },
    [
      conversationId,
      senderId,
      currentMessages,
      onMessageUpdate,
      generateTempId,
      persistMessages,
      replaceTempMessage,
      updateMessageStatus,
    ]
  );

  /**
   * Retry sending a failed message
   */
  const retryFailedMessage = useCallback(
    async (failedMessage: Message): Promise<SendMessageResult> => {
      // Update status to "sending" immediately
      await updateMessageStatus(failedMessage.id, { status: 'sending' });

      try {
        // Convert UI message to stored message for retry
        const storedMessage = messageToStoredMessage(failedMessage, senderId);

        // Retry sending
        const response = await sendMessage({
          conversationId,
          text: storedMessage.text,
          type: 'text',
        });

        // On success: update with server response
        const serverStoredMessage: StoredMessage = {
          id: response.message.messageId,
          text: response.message.text,
          senderId: response.message.senderId,
          createdAt: response.message.createdAt,
          status: 'sent',
          serverId: response.message.messageId,
        };

        await replaceTempMessage(failedMessage.id, serverStoredMessage);

        return { success: true };
      } catch (error: any) {
        // On failure: mark as "failed" again
        const errorMessage = {
          message: error.message || 'Failed to retry message',
          code: error.code,
        };

        await updateMessageStatus(failedMessage.id, {
          status: 'failed',
        });

        return { success: false, error: errorMessage };
      }
    },
    [
      conversationId,
      senderId,
      updateMessageStatus,
      replaceTempMessage,
    ]
  );

  return {
    sendMessage: sendMessageWithOptimisticUpdate,
    retryMessage: retryFailedMessage,
  };
}

