/**
 * Message Service
 * Handles sending and receiving messages
 */

import { apiClient } from './client';

export interface SendMessageRequest {
  conversationId: string;
  text: string;
  type?: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location';
  replyTo?: string | null;
}

export interface MessageSender {
  userId: string;
  displayName: string;
  avatar?: string | null;
}

export interface SendMessageResponse {
  success: boolean;
  message: {
    messageId: string;
    conversationId: string;
    senderId: string;
    sender: MessageSender;
    text: string;
    type: string;
    status: 'sending' | 'sent' | 'delivered' | 'read';
    replyTo: string | null;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

export interface ServerMessage {
  messageId: string;
  conversationId: string;
  senderId: string;
  sender: MessageSender;
  text: string;
  type: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo: string | null;
  reactions: Array<{
    userId: string;
    emoji: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface GetMessagesResponse {
  success: boolean;
  messages: ServerMessage[];
  total: number;
  hasMore: boolean;
  message: string;
}

export interface UpdateMessageStatusRequest {
  status: 'delivered' | 'read';
}

export interface UpdateMessageStatusResponse {
  success: boolean;
  message: {
    messageId: string;
    status: string;
  };
  message: string;
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
}

/**
 * Send a message
 */
export async function sendMessage(
  request: SendMessageRequest
): Promise<SendMessageResponse> {
  try {
    const response = await apiClient.post<SendMessageResponse>(
      '/api/chat/messages',
      request
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to send message'
    );
  }
}

/**
 * Get messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  limit: number = 50,
  offset: number = 0,
  before?: string
): Promise<GetMessagesResponse> {
  try {
    const params: any = { limit, offset };
    if (before) params.before = before;

    const response = await apiClient.get<GetMessagesResponse>(
      `/api/chat/conversations/${conversationId}/messages`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch messages'
    );
  }
}

/**
 * Update message status (delivered or read)
 */
export async function updateMessageStatus(
  messageId: string,
  status: 'delivered' | 'read'
): Promise<UpdateMessageStatusResponse> {
  try {
    const response = await apiClient.put<UpdateMessageStatusResponse>(
      `/api/chat/messages/${messageId}/status`,
      { status }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to update message status'
    );
  }
}

/**
 * Mark conversation as read
 */
export async function markConversationAsRead(
  conversationId: string
): Promise<MarkAsReadResponse> {
  try {
    const response = await apiClient.post<MarkAsReadResponse>(
      `/api/chat/conversations/${conversationId}/read`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to mark conversation as read'
    );
  }
}
