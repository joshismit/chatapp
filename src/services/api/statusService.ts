/**
 * Status Service
 * Handles online status, typing indicators, and user presence
 */

import { apiClient } from './client';

export interface UpdateOnlineStatusRequest {
  isOnline: boolean;
}

export interface UpdateOnlineStatusResponse {
  success: boolean;
  user: {
    userId: string;
    isOnline: boolean;
    lastSeen: string;
  };
  message: string;
}

export interface UserStatusResponse {
  success: boolean;
  user: {
    userId: string;
    displayName: string;
    isOnline: boolean;
    lastSeen: string;
    status: string;
  };
  message: string;
}

export interface SetTypingRequest {
  conversationId: string;
  isTyping: boolean;
}

export interface SetTypingResponse {
  success: boolean;
  message: string;
}

export interface TypingUser {
  userId: string;
  displayName: string;
}

export interface GetTypingResponse {
  success: boolean;
  typingUsers: TypingUser[];
  message: string;
}

/**
 * Update user online status
 */
export async function updateOnlineStatus(
  isOnline: boolean
): Promise<UpdateOnlineStatusResponse> {
  try {
    const response = await apiClient.put<UpdateOnlineStatusResponse>(
      '/api/chat/status/online',
      { isOnline }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to update online status'
    );
  }
}

/**
 * Get user status
 */
export async function getUserStatus(
  userId: string
): Promise<UserStatusResponse> {
  try {
    const response = await apiClient.get<UserStatusResponse>(
      `/api/chat/users/${userId}/status`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to get user status'
    );
  }
}

/**
 * Set typing indicator
 */
export async function setTypingIndicator(
  conversationId: string,
  isTyping: boolean
): Promise<SetTypingResponse> {
  try {
    const response = await apiClient.post<SetTypingResponse>(
      '/api/chat/typing',
      { conversationId, isTyping }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to set typing indicator'
    );
  }
}

/**
 * Get typing indicators for a conversation
 */
export async function getTypingIndicators(
  conversationId: string
): Promise<GetTypingResponse> {
  try {
    const response = await apiClient.get<GetTypingResponse>(
      `/api/chat/conversations/${conversationId}/typing`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to get typing indicators'
    );
  }
}

