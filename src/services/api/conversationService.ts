/**
 * Conversation Service
 * Handles conversations/chat sessions
 */

import { apiClient } from './client';

export interface Participant {
  userId: string;
  displayName: string;
  avatar?: string | null;
  isOnline: boolean;
  lastSeen: string;
  isArchived: boolean;
  isMuted: boolean;
}

export interface LastMessage {
  messageId: string;
  text: string;
  senderId: string;
  timestamp: string;
  status: string;
}

export interface ConversationResponse {
  conversationId: string;
  type: 'direct' | 'group';
  participants: Participant[];
  lastMessage?: LastMessage | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationListResponse {
  success: boolean;
  conversations: Array<{
    conversationId: string;
    type: 'direct' | 'group';
    otherUser: {
      userId: string;
      displayName: string;
      avatar?: string | null;
      isOnline: boolean;
      lastSeen: string;
    } | null;
    lastMessage?: LastMessage | null;
    unreadCount: number;
    isArchived: boolean;
    isMuted: boolean;
    updatedAt: string;
  }>;
  total: number;
  message: string;
}

export interface CreateConversationRequest {
  otherUserId: string;
}

export interface CreateConversationResponse {
  success: boolean;
  conversation: ConversationResponse;
  message: string;
}

/**
 * Get or create conversation with another user
 */
export async function getOrCreateConversation(
  otherUserId: string
): Promise<CreateConversationResponse> {
  try {
    const response = await apiClient.post<CreateConversationResponse>(
      '/api/chat/conversations',
      { otherUserId }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to get/create conversation'
    );
  }
}

/**
 * Get all conversations for the current user
 */
export async function getConversations(
  limit: number = 50,
  offset: number = 0
): Promise<ConversationListResponse> {
  try {
    const response = await apiClient.get<ConversationListResponse>(
      '/api/chat/conversations',
      {
        params: { limit, offset },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch conversations'
    );
  }
}

/**
 * Get a specific conversation by ID
 */
export async function getConversation(
  conversationId: string
): Promise<{ success: boolean; conversation: ConversationResponse; message: string }> {
  try {
    const response = await apiClient.get<{
      success: boolean;
      conversation: ConversationResponse;
      message: string;
    }>(`/api/chat/conversations/${conversationId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching conversation:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch conversation'
    );
  }
}
