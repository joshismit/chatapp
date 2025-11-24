import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'app_settings';

export type FontSize = 'small' | 'medium' | 'large' | 'extraLarge';

export interface AppSettings {
  fontSize: FontSize;
  locale: 'en' | 'es';
  reduceMotion?: boolean;
  highContrast?: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 'medium',
  locale: 'en',
  reduceMotion: false,
  highContrast: false,
};

/**
 * Font size multipliers
 */
export const FONT_SIZE_MULTIPLIERS: Record<FontSize, number> = {
  small: 0.85,
  medium: 1.0,
  large: 1.15,
  extraLarge: 1.3,
};

/**
 * Get font size multiplier for current setting
 */
export function getFontSizeMultiplier(fontSize: FontSize): number {
  return FONT_SIZE_MULTIPLIERS[fontSize] || 1.0;
}

/**
 * Load settings from storage
 */
export async function loadSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (data) {
      const settings = JSON.parse(data);
      return { ...DEFAULT_SETTINGS, ...settings };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to storage
 */
export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  try {
    const currentSettings = await loadSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

/**
 * Get font size setting
 */
export async function getFontSize(): Promise<FontSize> {
  const settings = await loadSettings();
  return settings.fontSize;
}

/**
 * Set font size setting
 */
export async function setFontSize(fontSize: FontSize): Promise<void> {
  await saveSettings({ fontSize });
}

/**
 * Get locale setting
 */
export async function getLocale(): Promise<'en' | 'es'> {
  const settings = await loadSettings();
  return settings.locale;
}

/**
 * Set locale setting
 */
export async function setLocale(locale: 'en' | 'es'): Promise<void> {
  await saveSettings({ locale });
}

