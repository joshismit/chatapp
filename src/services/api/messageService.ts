import apiClient from './client';
import { StoredMessage } from '../../types/message';

export interface SendMessageRequest {
  conversationId: string;
  text: string;
  senderId: string;
}

export interface SendMessageResponse {
  messageId: string;
  conversationId: string;
  text: string;
  senderId: string;
  createdAt: string;
  status: 'sent';
}

export interface SendMessageError {
  message: string;
  code?: string;
}

/**
 * Send a message to the server
 */
export async function sendMessage(
  request: SendMessageRequest
): Promise<SendMessageResponse> {
  try {
    const response = await apiClient.post<SendMessageResponse>(
      '/api/messages/send',
      request
    );
    return response.data;
  } catch (error: any) {
    const errorMessage: SendMessageError = {
      message: error.response?.data?.message || error.message || 'Failed to send message',
      code: error.response?.status?.toString() || error.code,
    };
    throw errorMessage;
  }
}

/**
 * Retry sending a failed message
 */
export async function retrySendMessage(
  message: StoredMessage,
  conversationId: string,
  senderId: string
): Promise<SendMessageResponse> {
  return sendMessage({
    conversationId,
    text: message.text,
    senderId,
  });
}

export interface FetchMessagesRequest {
  conversationId: string;
  before?: string; // ISO timestamp for pagination
  limit?: number; // Number of messages to fetch (default: 20)
}

export interface FetchMessagesResponse {
  messages: Array<{
    id: string;
    text: string;
    senderId: string;
    createdAt: string;
    status: 'sent' | 'delivered' | 'read';
  }>;
  hasMore: boolean; // Whether more messages are available
}

/**
 * Fetch older messages from the server
 */
export async function fetchOlderMessages(
  request: FetchMessagesRequest
): Promise<FetchMessagesResponse> {
  try {
    const params = new URLSearchParams({
      conversationId: request.conversationId,
      limit: (request.limit || 20).toString(),
    });

    if (request.before) {
      params.append('before', request.before);
    }

    const response = await apiClient.get<FetchMessagesResponse>(
      `/api/messages?${params.toString()}`
    );
    return response.data;
  } catch (error: any) {
    const errorMessage: SendMessageError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch messages',
      code: error.response?.status?.toString() || error.code,
    };
    throw errorMessage;
  }
}

