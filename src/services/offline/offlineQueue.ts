import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredMessage } from '../../types/message';

const OFFLINE_QUEUE_KEY = 'offline:outgoing_queue';
const MAX_QUEUE_SIZE = 100;

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
 * Queue an outgoing message when offline
 */
export async function queueOutgoing(message: QueuedMessage): Promise<void> {
  try {
    const queue = await getQueue();
    
    // Prevent queue overflow
    if (queue.length >= MAX_QUEUE_SIZE) {
      throw new Error('Offline queue is full');
    }

    // Check for duplicates
    const exists = queue.some((m) => m.id === message.id);
    if (exists) {
      console.warn('Message already in queue:', message.id);
      return;
    }

    queue.push(message);
    await saveQueue(queue);
  } catch (error) {
    console.error('Error queueing outgoing message:', error);
    throw error;
  }
}

/**
 * Get all queued messages
 */
export async function getQueuedMessages(): Promise<QueuedMessage[]> {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting queued messages:', error);
    return [];
  }
}

/**
 * Remove message from queue (after successful send)
 */
export async function removeFromQueue(messageId: string): Promise<void> {
  try {
    const queue = await getQueue();
    const filtered = queue.filter((m) => m.id !== messageId);
    await saveQueue(filtered);
  } catch (error) {
    console.error('Error removing from queue:', error);
    throw error;
  }
}

/**
 * Update message retry count
 */
export async function updateQueueMessage(
  messageId: string,
  updates: Partial<QueuedMessage>
): Promise<void> {
  try {
    const queue = await getQueue();
    const index = queue.findIndex((m) => m.id === messageId);
    if (index !== -1) {
      queue[index] = { ...queue[index], ...updates };
      await saveQueue(queue);
    }
  } catch (error) {
    console.error('Error updating queue message:', error);
    throw error;
  }
}

/**
 * Clear entire queue
 */
export async function clearQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    console.error('Error clearing queue:', error);
    throw error;
  }
}

// Internal helpers
async function getQueue(): Promise<QueuedMessage[]> {
  return getQueuedMessages();
}

async function saveQueue(queue: QueuedMessage[]): Promise<void> {
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

