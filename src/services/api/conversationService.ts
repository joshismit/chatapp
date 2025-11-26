import { apiClient } from './client';

export interface ConversationResponse {
  conversationId: string;
  participants: Array<{
    userId: string;
    displayName?: string;
    avatar?: string;
    lastReadMessageId?: string;
    isArchived: boolean;
    isMuted: boolean;
  }>;
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
  lastMessage?: {
    messageId: string;
    text: string;
    senderId: string;
    timestamp: string;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface ConversationsListResponse {
  success: boolean;
  conversations: ConversationResponse[];
  message?: string;
}

/**
 * Get all conversations for the current user
 */
export async function getConversations(userId?: string): Promise<ConversationsListResponse> {
  try {
    const response = await apiClient.get<ConversationsListResponse>('/api/conversations', {
      params: userId ? { userId } : undefined,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch conversations');
  }
}

/**
 * Get a specific conversation by ID
 */
export async function getConversation(conversationId: string): Promise<ConversationResponse> {
  try {
    const response = await apiClient.get<ConversationResponse>(`/api/conversations/${conversationId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching conversation:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch conversation');
  }
}

