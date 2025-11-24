import { StoredMessage } from '../types/message';
import { saveConversation } from '../services/storage';

/**
 * Debounce configuration
 */
const DEBOUNCE_DELAY = 500; // 500ms delay
const MAX_BATCH_SIZE = 50; // Max messages to batch

/**
 * Pending write queue
 */
interface PendingWrite {
  conversationId: string;
  messages: StoredMessage[];
  timestamp: number;
}

const pendingWrites = new Map<string, PendingWrite>();
let debounceTimer: NodeJS.Timeout | null = null;

/**
 * Debounced save conversation
 * Batches multiple rapid writes into a single storage operation
 * 
 * @param conversationId - Conversation ID
 * @param messages - Messages to save
 * @param immediate - If true, save immediately without debounce
 */
export async function debouncedSaveConversation(
  conversationId: string,
  messages: StoredMessage[],
  immediate: boolean = false
): Promise<void> {
  // Store the latest write request
  pendingWrites.set(conversationId, {
    conversationId,
    messages,
    timestamp: Date.now(),
  });

  // If immediate, save right away and clear timer
  if (immediate) {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    await flushPendingWrites();
    return;
  }

  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Set new timer
  debounceTimer = setTimeout(async () => {
    await flushPendingWrites();
    debounceTimer = null;
  }, DEBOUNCE_DELAY);
}

/**
 * Flush all pending writes to storage
 */
async function flushPendingWrites(): Promise<void> {
  if (pendingWrites.size === 0) {
    return;
  }

  const writes = Array.from(pendingWrites.values());
  pendingWrites.clear();

  // Execute all writes in parallel
  const writePromises = writes.map(({ conversationId, messages }) =>
    saveConversation(conversationId, messages).catch((error) => {
      console.error(`Error saving conversation ${conversationId}:`, error);
      // Re-queue failed writes
      pendingWrites.set(conversationId, {
        conversationId,
        messages,
        timestamp: Date.now(),
      });
    })
  );

  await Promise.all(writePromises);
}

/**
 * Force flush all pending writes
 * Useful when app is closing or going to background
 */
export async function flushAllPendingWrites(): Promise<void> {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  await flushPendingWrites();
}

/**
 * Clear pending writes for a specific conversation
 */
export function clearPendingWrite(conversationId: string): void {
  pendingWrites.delete(conversationId);
}

/**
 * Get count of pending writes
 */
export function getPendingWriteCount(): number {
  return pendingWrites.size;
}

