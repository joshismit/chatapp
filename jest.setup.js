import '@testing-library/jest-native/extend-expect';
import { jest } from '@jest/globals';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock Expo modules
jest.mock('expo', () => ({
  ...jest.requireActual('expo'),
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock i18n
jest.mock('./src/i18n', () => ({
  t: (key: string, replacements?: Record<string, string | number>) => {
    // Simple mock - return key or formatted string
    if (replacements) {
      return Object.entries(replacements).reduce(
        (str, [k, v]) => str.replace(`{${k}}`, String(v)),
        key
      );
    }
    return key;
  },
  setLocale: jest.fn(),
  getLocale: jest.fn(() => 'en'),
}));

// Mock settings hook
jest.mock('./src/hooks/useSettings', () => ({
  useSettings: jest.fn(() => ({
    settings: { fontSize: 'medium', locale: 'en' },
    loading: false,
    fontSizeMultiplier: 1.0,
    updateFontSize: jest.fn(),
    updateLocale: jest.fn(),
  })),
}));

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

