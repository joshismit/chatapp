import { StoredMessage } from '../types/message';
import { Message } from '../components/chat/MessageBubble';

const CURRENT_USER_ID = 'current_user'; // Replace with actual user ID from auth

/**
 * Convert StoredMessage to Message (for UI display)
 */
export function storedMessageToMessage(stored: StoredMessage): Message {
  return {
    id: stored.id,
    text: stored.text,
    isSent: stored.senderId === CURRENT_USER_ID,
    timestamp: formatTimestamp(stored.createdAt),
    createdAt: stored.createdAt, // Include for date grouping
    status: stored.status,
  };
}

/**
 * Convert Message to StoredMessage (for storage)
 */
export function messageToStoredMessage(
  message: Message,
  senderId: string
): StoredMessage {
  return {
    id: message.id,
    text: message.text,
    senderId,
    createdAt: new Date().toISOString(),
    status: message.status || 'sending',
    archived: false,
  };
}

/**
 * Format ISO timestamp to readable time
 */
function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

