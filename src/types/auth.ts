/**
 * Authentication Types
 */

export interface User {
  id: string;
  userId: string; // Backend uses userId
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  avatar?: string | null; // Backend uses avatar
  email?: string;
  phoneNumber?: string;
  isOnline?: boolean;
  lastSeen?: string; // ISO timestamp
  status?: string; // User status message
  isRegistered?: boolean;
  registrationMethod?: 'phone' | 'email' | 'qr';
}

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
  user: User;
  message: string;
  action?: 'login'; // Indicates user needs to login
  error?: string;
}

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
  user: User;
  message: string;
  error?: string;
}

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

export interface LogoutResponse {
  success: boolean;
  message: string;
}

