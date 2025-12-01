/**
 * Global Theme Configuration
 * Centralized theme variables for easy color and styling changes
 * Similar to SCSS variables but for React Native
 */

export interface Theme {
  colors: {
    // Primary Colors
    primary: string;
    primaryLight: string;
    primaryDark: string;
    primaryAlpha: (opacity: number) => string;
    
    // Secondary Colors
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    
    // Status Colors
    success: string;
    successLight: string;
    error: string;
    errorLight: string;
    warning: string;
    warningLight: string;
    info: string;
    infoLight: string;
    
    // Background Colors
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    surface: string;
    surfaceElevated: string;
    
    // Text Colors
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;
    textDisabled: string;
    
    // Border Colors
    border: string;
    borderLight: string;
    borderDark: string;
    
    // Input Colors
    inputBackground: string;
    inputBorder: string;
    inputBorderFocused: string;
    inputPlaceholder: string;
    
    // Button Colors
    buttonPrimary: string;
    buttonSecondary: string;
    buttonDisabled: string;
    buttonText: string;
    buttonTextSecondary: string;
    
    // Message Bubble Colors
    messageSent: string;
    messageReceived: string;
    messageFailed: string;
    
    // Overlay Colors
    overlay: string;
    overlayDark: string;
    
    // Icon Colors
    iconPrimary: string;
    iconSecondary: string;
    iconTertiary: string;
  };
  
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    round: number;
  };
  
  typography: {
    fontFamily: {
      regular: string;
      medium: string;
      bold: string;
    };
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      xxxl: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
    fontWeight: {
      regular: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  
  shadows: {
    sm: object;
    md: object;
    lg: object;
    xl: object;
  };
  
  opacity: {
    disabled: number;
    hover: number;
    pressed: number;
  };
}

/**
 * Light Theme (Default)
 */
export const lightTheme: Theme = {
  colors: {
    // Primary Colors
    primary: '#6200ee',
    primaryLight: '#9d46ff',
    primaryDark: '#0a00b6',
    primaryAlpha: (opacity: number) => `rgba(98, 0, 238, ${opacity})`,
    
    // Secondary Colors
    secondary: '#25D366',
    secondaryLight: '#5df88f',
    secondaryDark: '#00a043',
    
    // Status Colors
    success: '#4CAF50',
    successLight: '#81C784',
    error: '#F44336',
    errorLight: '#E57373',
    warning: '#FF9800',
    warningLight: '#FFB74D',
    info: '#2196F3',
    infoLight: '#64B5F6',
    
    // Background Colors
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    backgroundTertiary: '#EEEEEE',
    surface: '#FFFFFF',
    surfaceElevated: '#FAFAFA',
    
    // Text Colors
    textPrimary: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textInverse: '#FFFFFF',
    textDisabled: '#CCCCCC',
    
    // Border Colors
    border: '#E0E0E0',
    borderLight: '#F5F5F5',
    borderDark: '#BDBDBD',
    
    // Input Colors
    inputBackground: '#F5F5F5',
    inputBorder: '#E0E0E0',
    inputBorderFocused: '#6200ee',
    inputPlaceholder: '#999999',
    
    // Button Colors
    buttonPrimary: '#6200ee',
    buttonSecondary: '#F5F5F5',
    buttonDisabled: '#CCCCCC',
    buttonText: '#FFFFFF',
    buttonTextSecondary: '#000000',
    
    // Message Bubble Colors
    messageSent: '#DCF8C6',
    messageReceived: '#FFFFFF',
    messageFailed: '#FFE5E5',
    
    // Overlay Colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayDark: 'rgba(0, 0, 0, 0.8)',
    
    // Icon Colors
    iconPrimary: '#000000',
    iconSecondary: '#666666',
    iconTertiary: '#999999',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
  },
  
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  opacity: {
    disabled: 0.6,
    hover: 0.8,
    pressed: 0.9,
  },
};

/**
 * Dark Theme
 */
export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    // Primary Colors
    primary: '#6200ee',
    primaryLight: '#9d46ff',
    primaryDark: '#0a00b6',
    primaryAlpha: (opacity: number) => `rgba(98, 0, 238, ${opacity})`,
    
    // Secondary Colors
    secondary: '#25D366',
    secondaryLight: '#5df88f',
    secondaryDark: '#00a043',
    
    // Status Colors
    success: '#4CAF50',
    successLight: '#66BB6A',
    error: '#F44336',
    errorLight: '#EF5350',
    warning: '#FF9800',
    warningLight: '#FFA726',
    info: '#2196F3',
    infoLight: '#42A5F5',
    
    // Background Colors
    background: '#0a0a0a',
    backgroundSecondary: '#1a1a1a',
    backgroundTertiary: '#2a2a2a',
    surface: '#1a1a1a',
    surfaceElevated: '#1f1f1f',
    
    // Text Colors
    textPrimary: '#FFFFFF',
    textSecondary: '#999999',
    textTertiary: '#666666',
    textInverse: '#000000',
    textDisabled: '#444444',
    
    // Border Colors
    border: '#2a2a2a',
    borderLight: '#1a1a1a',
    borderDark: '#333333',
    
    // Input Colors
    inputBackground: '#1a1a1a',
    inputBorder: '#2a2a2a',
    inputBorderFocused: '#6200ee',
    inputPlaceholder: '#666666',
    
    // Button Colors
    buttonPrimary: '#6200ee',
    buttonSecondary: '#2a2a2a',
    buttonDisabled: '#444444',
    buttonText: '#FFFFFF',
    buttonTextSecondary: '#FFFFFF',
    
    // Message Bubble Colors
    messageSent: '#DCF8C6',
    messageReceived: '#FFFFFF',
    messageFailed: '#FFE5E5',
    
    // Overlay Colors
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayDark: 'rgba(0, 0, 0, 0.9)',
    
    // Icon Colors
    iconPrimary: '#FFFFFF',
    iconSecondary: '#999999',
    iconTertiary: '#666666',
  },
};

/**
 * Default theme export (currently using dark theme)
 */
export const theme = darkTheme;

/**
 * Type helper for theme-aware styles
 */
export type ThemeStyles<T> = (theme: Theme) => T;

