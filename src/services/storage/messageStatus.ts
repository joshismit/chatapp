import { StoredMessage } from '../../types/message';
import { loadConversation, saveConversation } from '../storage';

/**
 * Update message status in storage
 */
export async function updateMessageStatus(
  conversationId: string,
  messageId: string,
  newStatus: StoredMessage['status']
): Promise<StoredMessage | null> {
  try {
    const messages = await loadConversation(conversationId);
    const messageIndex = messages.findIndex(
      (msg) => msg.id === messageId || msg.serverId === messageId
    );

    if (messageIndex === -1) {
      console.warn(`Message ${messageId} not found in conversation ${conversationId}`);
      return null;
    }

    // Update status
    const updatedMessage: StoredMessage = {
      ...messages[messageIndex],
      status: newStatus,
    };

    // Replace in array
    messages[messageIndex] = updatedMessage;

    // Save back to storage
    await saveConversation(conversationId, messages);

    return updatedMessage;
  } catch (error) {
    console.error('Error updating message status:', error);
    throw error;
  }
}

/**
 * Update multiple message statuses (batch update)
 */
export async function updateMultipleMessageStatuses(
  conversationId: string,
  updates: Array<{ messageId: string; status: StoredMessage['status'] }>
): Promise<StoredMessage[]> {
  try {
    const messages = await loadConversation(conversationId);
    const updatedMessages: StoredMessage[] = [];
    const messageMap = new Map<string, number>();

    // Create index map
    messages.forEach((msg, index) => {
      messageMap.set(msg.id, index);
      if (msg.serverId) {
        messageMap.set(msg.serverId, index);
      }
    });

    // Apply updates
    updates.forEach(({ messageId, status }) => {
      const index = messageMap.get(messageId);
      if (index !== undefined) {
        messages[index] = {
          ...messages[index],
          status,
        };
        updatedMessages.push(messages[index]);
      }
    });

    // Save if any updates were made
    if (updatedMessages.length > 0) {
      await saveConversation(conversationId, messages);
    }

    return updatedMessages;
  } catch (error) {
    console.error('Error updating multiple message statuses:', error);
    throw error;
  }
}

/**
 * Find message by ID or serverId
 */
export async function findMessage(
  conversationId: string,
  messageId: string
): Promise<StoredMessage | null> {
  try {
    const messages = await loadConversation(conversationId);
    return (
      messages.find(
        (msg) => msg.id === messageId || msg.serverId === messageId
      ) || null
    );
  } catch (error) {
    console.error('Error finding message:', error);
    return null;
  }
}

