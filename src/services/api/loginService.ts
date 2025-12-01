/**
 * Login Service
 * Handles OTP login (phone and email) and QR code login
 */

import { apiClient } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// OTP Login
// ============================================

export interface OTPLoginRequest {
  phoneNumber?: string;
  email?: string;
}

export interface OTPLoginResponse {
  success: boolean;
  message: string;
  otp?: string; // Only in development
  expiresIn: number; // seconds
  method?: 'phone' | 'email';
  error?: string;
}

export interface VerifyOTPRequest {
  phoneNumber?: string;
  email?: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  userId: string;
  token: string;
  user: {
    userId: string;
    displayName: string;
    phoneNumber?: string;
    email?: string;
    isOnline: boolean;
  };
  message: string;
  error?: string;
}

/**
 * Generate OTP for login
 */
export async function generateOTPForLogin(
  request: OTPLoginRequest
): Promise<OTPLoginResponse> {
  try {
    const response = await apiClient.post<OTPLoginResponse>(
      '/api/otp/generate',
      request
    );
    return response.data;
  } catch (error: any) {
    const errorMessage: OTPLoginResponse = {
      success: false,
      message: error.response?.data?.message || 'Failed to generate OTP',
      expiresIn: 0,
      error: error.response?.data?.error,
    };
    throw errorMessage;
  }
}

/**
 * Verify OTP and login
 */
export async function verifyOTPForLogin(
  request: VerifyOTPRequest
): Promise<VerifyOTPResponse> {
  try {
    const response = await apiClient.post<VerifyOTPResponse>(
      '/api/otp/verify',
      request
    );

    // Store user ID and token after successful login
    if (response.data.success && response.data.userId) {
      await AsyncStorage.setItem('currentUserId', response.data.userId);
    }

    if (response.data.success && response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
    }

    return response.data;
  } catch (error: any) {
    const errorMessage: VerifyOTPResponse = {
      success: false,
      userId: '',
      token: '',
      user: {
        userId: '',
        displayName: '',
        isOnline: false,
      },
      message: error.response?.data?.message || 'Failed to verify OTP',
      error: error.response?.data?.error,
    };
    throw errorMessage;
  }
}

// ============================================
// QR Code Login
// ============================================

export interface GenerateQRResponse {
  success: boolean;
  qrToken: string;
  expiresAt: string;
  message: string;
}

export interface QRStatusResponse {
  success: boolean;
  status: 'pending' | 'scanned' | 'verified' | 'expired' | 'used';
  scannedBy?: string;
  userId?: string;
  token?: string;
  message: string;
}

export interface ScanQRRequest {
  qrToken: string;
}

export interface ScanQRResponse {
  success: boolean;
  message: string;
}

/**
 * Generate QR code for desktop login
 */
export async function generateQRCode(): Promise<GenerateQRResponse> {
  try {
    const response = await apiClient.post<GenerateQRResponse>(
      '/api/qr/generate'
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to generate QR code'
    );
  }
}

/**
 * Check QR code status (polling)
 */
export async function checkQRStatus(
  qrToken: string
): Promise<QRStatusResponse> {
  try {
    const response = await apiClient.get<QRStatusResponse>(
      `/api/qr/status/${qrToken}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to check QR status'
    );
  }
}

/**
 * Scan QR code (mobile - requires authentication)
 */
export async function scanQRCode(
  request: ScanQRRequest
): Promise<ScanQRResponse> {
  try {
    const response = await apiClient.post<ScanQRResponse>(
      '/api/qr/scan',
      request
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to scan QR code');
  }
}

/**
 * Verify QR code (mobile - requires authentication)
 */
export async function verifyQRCode(
  request: ScanQRRequest
): Promise<ScanQRResponse> {
  try {
    const response = await apiClient.post<ScanQRResponse>(
      '/api/qr/verify',
      request
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to verify QR code'
    );
  }
}

// ============================================
// Legacy Token Login (for backward compatibility)
// ============================================

export interface LoginRequest {
  token: string;
  userId?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  userId?: string;
  token?: string;
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
 * Legacy login with token (for backward compatibility)
 */
export async function loginWithToken(token: string): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>('/api/login', {
      token,
    });

    // Store userId and token after successful login
    if (response.data.success && response.data.userId) {
      await AsyncStorage.setItem('currentUserId', response.data.userId);
    }

    if (response.data.success && response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
    }

    return response.data;
  } catch (error: any) {
    const loginError: LoginError = {
      message: error.response?.data?.message || 'Login failed. Please try again.',
      code: error.response?.status?.toString(),
    };
    throw loginError;
  }
}

// ============================================
// Logout
// ============================================

export interface LogoutResponse {
  success: boolean;
  message: string;
}

/**
 * Logout user
 */
export async function logout(): Promise<LogoutResponse> {
  try {
    const response = await apiClient.post<LogoutResponse>('/api/auth/logout');

    // Clear stored data
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('currentUserId');

    return response.data;
  } catch (error: any) {
    // Clear stored data even if API call fails
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('currentUserId');

    throw new Error(error.response?.data?.message || 'Failed to logout');
  }
}
