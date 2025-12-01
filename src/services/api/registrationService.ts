/**
 * Registration Service
 * Handles user registration (phone and email)
 */

import { apiClient } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RegistrationOTPRequest {
  phoneNumber?: string;
  email?: string;
}

export interface RegistrationOTPResponse {
  success: boolean;
  message: string;
  otp?: string; // Only in development
  expiresIn: number; // seconds
  method: 'phone' | 'email';
  error?: string;
}

export interface VerifyRegistrationOTPRequest {
  phoneNumber?: string;
  email?: string;
  otp: string;
  displayName: string;
}

export interface VerifyRegistrationOTPResponse {
  success: boolean;
  userId: string;
  user: {
    userId: string;
    displayName: string;
    phoneNumber?: string;
    email?: string;
    isRegistered: boolean;
    registrationMethod: 'phone' | 'email';
  };
  message: string;
  action?: 'login'; // Indicates user needs to login
  error?: string;
}

export interface CheckAvailabilityResponse {
  success: boolean;
  available: boolean;
  message: string;
}

/**
 * Check if phone/email is available for registration
 */
export async function checkAvailability(
  phoneNumber?: string,
  email?: string
): Promise<CheckAvailabilityResponse> {
  try {
    const params: any = {};
    if (phoneNumber) params.phoneNumber = phoneNumber;
    if (email) params.email = email;

    const response = await apiClient.get<CheckAvailabilityResponse>(
      '/api/register/check-availability',
      { params }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to check availability'
    );
  }
}

/**
 * Generate OTP for registration
 */
export async function generateRegistrationOTP(
  request: RegistrationOTPRequest
): Promise<RegistrationOTPResponse> {
  try {
    const response = await apiClient.post<RegistrationOTPResponse>(
      '/api/register/generate-otp',
      request
    );
    return response.data;
  } catch (error: any) {
    const errorMessage: RegistrationOTPResponse = {
      success: false,
      message: error.response?.data?.message || 'Failed to generate OTP',
      expiresIn: 0,
      method: request.phoneNumber ? 'phone' : 'email',
      error: error.response?.data?.error,
    };
    throw errorMessage;
  }
}

/**
 * Verify OTP and complete registration
 */
export async function verifyRegistrationOTP(
  request: VerifyRegistrationOTPRequest
): Promise<VerifyRegistrationOTPResponse> {
  try {
    const response = await apiClient.post<VerifyRegistrationOTPResponse>(
      '/api/register/verify-otp',
      request
    );

    // Store user ID after successful registration
    if (response.data.success && response.data.userId) {
      await AsyncStorage.setItem('currentUserId', response.data.userId);
    }

    return response.data;
  } catch (error: any) {
    const errorMessage: VerifyRegistrationOTPResponse = {
      success: false,
      userId: '',
      user: {
        userId: '',
        displayName: '',
        isRegistered: false,
        registrationMethod: request.phoneNumber ? 'phone' : 'email',
      },
      message: error.response?.data?.message || 'Failed to complete registration',
      error: error.response?.data?.error,
    };
    throw errorMessage;
  }
}

