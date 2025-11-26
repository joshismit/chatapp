import { apiClient } from './client';

export interface LoginRequest {
  token: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  userId?: string;
  user?: {
    id: string;
    name?: string;
  };
}

export interface LoginError {
  message: string;
  code?: string;
}

/**
 * Login with QR code token
 */
export async function loginWithToken(token: string): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>('/api/login', {
      token,
    });
    return response.data;
  } catch (error: any) {
    const loginError: LoginError = {
      message: error.response?.data?.message || 'Login failed. Please try again.',
      code: error.response?.status?.toString(),
    };
    throw loginError;
  }
}

