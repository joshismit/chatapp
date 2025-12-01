/**
 * Toast Notification Utility
 * Centralized toast notification helper
 */

import Toast from 'react-native-toast-message';

export interface ToastOptions {
  type?: 'success' | 'error' | 'info';
  position?: 'top' | 'bottom';
  visibilityTime?: number;
  autoHide?: boolean;
  topOffset?: number;
  bottomOffset?: number;
}

/**
 * Show success toast
 */
export const showSuccessToast = (
  message: string,
  title?: string,
  options?: ToastOptions
) => {
  Toast.show({
    type: 'success',
    text1: title || 'Success',
    text2: message,
    position: options?.position || 'top',
    visibilityTime: options?.visibilityTime || 3000,
    autoHide: options?.autoHide !== false,
    topOffset: options?.topOffset || 60,
    bottomOffset: options?.bottomOffset || 40,
  });
};

/**
 * Show error toast
 */
export const showErrorToast = (
  message: string,
  title?: string,
  options?: ToastOptions
) => {
  Toast.show({
    type: 'error',
    text1: title || 'Error',
    text2: message,
    position: options?.position || 'top',
    visibilityTime: options?.visibilityTime || 4000,
    autoHide: options?.autoHide !== false,
    topOffset: options?.topOffset || 60,
    bottomOffset: options?.bottomOffset || 40,
  });
};

/**
 * Show info toast
 */
export const showInfoToast = (
  message: string,
  title?: string,
  options?: ToastOptions
) => {
  Toast.show({
    type: 'info',
    text1: title || 'Info',
    text2: message,
    position: options?.position || 'top',
    visibilityTime: options?.visibilityTime || 3000,
    autoHide: options?.autoHide !== false,
    topOffset: options?.topOffset || 60,
    bottomOffset: options?.bottomOffset || 40,
  });
};

/**
 * Hide toast manually
 */
export const hideToast = () => {
  Toast.hide();
};

