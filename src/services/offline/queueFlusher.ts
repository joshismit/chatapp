import { isOnline } from './networkMonitor';
import {
  getQueuedMessages,
  removeFromQueue,
  updateQueueMessage,
  QueuedMessage,
} from './offlineQueue';
import { sendMessage, SendMessageResponse } from '../api/messageService';
import { saveConversation, loadConversation } from '../storage';
import { messageToStoredMessage } from '../../utils/messageConverter';
import { Message } from '../../components/chat/MessageBubble';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Flush all queued messages when connectivity returns
 */
export async function flushQueue(): Promise<{
  success: number;
  failed: number;
  errors: Array<{ messageId: string; error: string }>;
}> {
  const result = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ messageId: string; error: string }>,
  };

  // Check connectivity
  if (!(await isOnline())) {
    console.log('Still offline, cannot flush queue');
    return result;
  }

  const queued = await getQueuedMessages();
  if (queued.length === 0) {
    return result;
  }

  console.log(`Flushing ${queued.length} queued messages`);

  // Process messages sequentially to avoid overwhelming server
  for (const queuedMsg of queued) {
    try {
      // Skip if max retries reached
      if (queuedMsg.retryCount >= MAX_RETRY_ATTEMPTS) {
        console.warn(
          `Skipping message ${queuedMsg.id} - max retries reached`
        );
        result.failed++;
        result.errors.push({
          messageId: queuedMsg.id,
          error: 'Max retry attempts reached',
        });
        continue;
      }

      // Update status to sending
      await updateQueueMessage(queuedMsg.id, { status: 'sending' });

      // Attempt to send
      const response: SendMessageResponse = await sendMessage({
        conversationId: queuedMsg.conversationId,
        text: queuedMsg.text,
        senderId: queuedMsg.senderId,
      });

      // Success - remove from queue and save to conversation
      await removeFromQueue(queuedMsg.id);

      // Save to conversation storage
      const storedMessage = {
        id: response.messageId,
        text: response.text,
        senderId: response.senderId,
        createdAt: response.createdAt,
        status: response.status,
        serverId: response.messageId,
      };

      const existingMessages = await loadConversation(queuedMsg.conversationId);
      const updatedMessages = [storedMessage, ...existingMessages];
      await saveConversation(queuedMsg.conversationId, updatedMessages);

      result.success++;
      console.log(`Successfully sent queued message: ${queuedMsg.id}`);
    } catch (error: any) {
      // Failed - increment retry count
      const newRetryCount = queuedMsg.retryCount + 1;
      await updateQueueMessage(queuedMsg.id, {
        status: 'failed',
        retryCount: newRetryCount,
      });

      result.failed++;
      result.errors.push({
        messageId: queuedMsg.id,
        error: error.message || 'Unknown error',
      });

      console.error(
        `Failed to send queued message ${queuedMsg.id}:`,
        error
      );

      // Add delay before next retry
      if (newRetryCount < MAX_RETRY_ATTEMPTS) {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * newRetryCount)
        );
      }
    }
  }

  return result;
}

/**
 * Flush queue for a specific conversation
 */
export async function flushQueueForConversation(
  conversationId: string
): Promise<number> {
  const queued = await getQueuedMessages();
  const conversationQueue = queued.filter(
    (m) => m.conversationId === conversationId
  );

  if (conversationQueue.length === 0) {
    return 0;
  }

  const result = await flushQueue();
  return result.success;
}

