import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredMessage, ConversationMetadata } from '../types/message';

const CONVERSATION_PREFIX = 'conversation:';
const CONVERSATIONS_LIST_KEY = 'conversations:list';
const CURRENT_USER_ID = 'current_user'; // Replace with actual user ID from auth

/**
 * Save messages for a conversation
 */
export async function saveConversation(
  conversationId: string,
  messages: StoredMessage[]
): Promise<void> {
  try {
    const key = `${CONVERSATION_PREFIX}${conversationId}`;
    const data = JSON.stringify(messages);
    await AsyncStorage.setItem(key, data);

    // Update conversation metadata
    await updateConversationMetadata(conversationId, messages);
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
}

/**
 * Load messages for a conversation
 */
export async function loadConversation(
  conversationId: string
): Promise<StoredMessage[]> {
  try {
    const key = `${CONVERSATION_PREFIX}${conversationId}`;
    const data = await AsyncStorage.getItem(key);
    
    if (!data) {
      return [];
    }

    const messages: StoredMessage[] = JSON.parse(data);
    // Sort by createdAt descending (newest first for inverted FlatList)
    return messages.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error loading conversation:', error);
    return [];
  }
}

/**
 * Load last N messages for a conversation (for initial load)
 */
export async function loadLastMessages(
  conversationId: string,
  limit: number = 50
): Promise<StoredMessage[]> {
  try {
    const allMessages = await loadConversation(conversationId);
    // Return last N messages (oldest ones, since list is sorted descending)
    return allMessages.slice(-limit);
  } catch (error) {
    console.error('Error loading last messages:', error);
    return [];
  }
}

/**
 * Get oldest message timestamp for pagination
 */
export async function getOldestMessageTimestamp(
  conversationId: string
): Promise<string | null> {
  try {
    const messages = await loadConversation(conversationId);
    if (messages.length === 0) {
      return null;
    }
    // Messages are sorted descending, so last one is oldest
    const oldestMessage = messages[messages.length - 1];
    return oldestMessage.createdAt;
  } catch (error) {
    console.error('Error getting oldest message timestamp:', error);
    return null;
  }
}

/**
 * Prepend messages to existing conversation (for pagination)
 */
export async function prependMessages(
  conversationId: string,
  newMessages: StoredMessage[]
): Promise<void> {
  try {
    const existingMessages = await loadConversation(conversationId);
    
    // Merge and remove duplicates
    const allMessages = [...newMessages, ...existingMessages];
    const uniqueMessages = allMessages.filter(
      (msg, index, self) =>
        index === self.findIndex((m) => m.id === msg.id || (msg.serverId && m.id === msg.serverId))
    );

    // Sort by createdAt descending
    const sortedMessages = uniqueMessages.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    await saveConversation(conversationId, sortedMessages);
  } catch (error) {
    console.error('Error prepending messages:', error);
    throw error;
  }
}

/**
 * Archive a conversation
 */
export async function archiveConversation(
  conversationId: string
): Promise<void> {
  try {
    // Load conversation metadata
    const conversations = await listConversations();
    const conversation = conversations.find(
      (c) => c.conversationId === conversationId
    );

    if (conversation) {
      conversation.archived = true;
      await updateConversationsList(conversations);
    } else {
      // Create new metadata entry if it doesn't exist
      const newConversation: ConversationMetadata = {
        conversationId,
        archived: true,
        unreadCount: 0,
      };
      conversations.push(newConversation);
      await updateConversationsList(conversations);
    }

    // Mark all messages in conversation as archived
    const messages = await loadConversation(conversationId);
    if (messages.length > 0) {
      const archivedMessages = messages.map((msg) => ({
        ...msg,
        archived: true,
      }));
      await saveConversation(conversationId, archivedMessages);
    }
  } catch (error) {
    console.error('Error archiving conversation:', error);
    throw error;
  }
}

/**
 * Unarchive a conversation
 */
export async function unarchiveConversation(
  conversationId: string
): Promise<void> {
  try {
    // Load conversation metadata
    const conversations = await listConversations();
    const conversation = conversations.find(
      (c) => c.conversationId === conversationId
    );

    if (conversation) {
      conversation.archived = false;
      await updateConversationsList(conversations);
    }

    // Unarchive all messages in conversation
    const messages = await loadConversation(conversationId);
    if (messages.length > 0) {
      const unarchivedMessages = messages.map((msg) => ({
        ...msg,
        archived: false,
      }));
      await saveConversation(conversationId, unarchivedMessages);
    }
  } catch (error) {
    console.error('Error unarchiving conversation:', error);
    throw error;
  }
}

/**
 * List all conversations with metadata
 */
export async function listConversations(): Promise<ConversationMetadata[]> {
  try {
    const data = await AsyncStorage.getItem(CONVERSATIONS_LIST_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error listing conversations:', error);
    return [];
  }
}

/**
 * List archived conversations only
 */
export async function listArchivedConversations(): Promise<ConversationMetadata[]> {
  try {
    const allConversations = await listConversations();
    return allConversations.filter((conv) => conv.archived === true);
  } catch (error) {
    console.error('Error listing archived conversations:', error);
    return [];
  }
}

/**
 * List non-archived conversations only
 */
export async function listActiveConversations(): Promise<ConversationMetadata[]> {
  try {
    const allConversations = await listConversations();
    return allConversations.filter((conv) => !conv.archived);
  } catch (error) {
    console.error('Error listing active conversations:', error);
    return [];
  }
}

/**
 * Update conversation metadata in the list
 */
async function updateConversationMetadata(
  conversationId: string,
  messages: StoredMessage[]
): Promise<void> {
  try {
    const conversations = await listConversations();
    // Messages are sorted descending (newest first), so first message is most recent
    const lastMessage = messages.length > 0 ? messages[0] : null;
    
    let conversation = conversations.find(
      (c) => c.conversationId === conversationId
    );

    if (!conversation) {
      conversation = {
        conversationId,
        unreadCount: 0,
        archived: false,
      };
      conversations.push(conversation);
    }

    conversation.lastMessage = lastMessage?.text;
    conversation.lastMessageTime = lastMessage?.createdAt;

    // Calculate unread count (messages not read by current user)
    const unreadMessages = messages.filter(
      (msg) => msg.senderId !== CURRENT_USER_ID && msg.status !== 'read'
    );
    conversation.unreadCount = unreadMessages.length;

    await updateConversationsList(conversations);
  } catch (error) {
    console.error('Error updating conversation metadata:', error);
  }
}

/**
 * Update the conversations list in storage
 */
async function updateConversationsList(
  conversations: ConversationMetadata[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      CONVERSATIONS_LIST_KEY,
      JSON.stringify(conversations)
    );
  } catch (error) {
    console.error('Error updating conversations list:', error);
    throw error;
  }
}

/**
 * Clear all conversation data (useful for testing/logout)
 */
export async function clearAllConversations(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const conversationKeys = keys.filter((key) =>
      key.startsWith(CONVERSATION_PREFIX)
    );
    await AsyncStorage.multiRemove([
      ...conversationKeys,
      CONVERSATIONS_LIST_KEY,
    ]);
  } catch (error) {
    console.error('Error clearing conversations:', error);
    throw error;
  }
}
