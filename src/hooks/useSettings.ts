import { useState, useEffect, useCallback } from 'react';
import {
  loadSettings,
  saveSettings,
  AppSettings,
  FontSize,
  getFontSizeMultiplier,
} from '../services/settings';
import { setLocale as setI18nLocale, getLocale as getI18nLocale } from '../i18n';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const load = async () => {
      try {
        const loadedSettings = await loadSettings();
        setSettings(loadedSettings);
        // Sync i18n locale
        setI18nLocale(loadedSettings.locale);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Update font size
  const updateFontSize = useCallback(async (fontSize: FontSize) => {
    try {
      await saveSettings({ fontSize });
      setSettings((prev) => (prev ? { ...prev, fontSize } : null));
    } catch (error) {
      console.error('Error updating font size:', error);
    }
  }, []);

  // Update locale
  const updateLocale = useCallback(async (locale: 'en' | 'es') => {
    try {
      await saveSettings({ locale });
      setI18nLocale(locale);
      setSettings((prev) => (prev ? { ...prev, locale } : null));
    } catch (error) {
      console.error('Error updating locale:', error);
    }
  }, []);

  // Get font size multiplier
  const fontSizeMultiplier = settings
    ? getFontSizeMultiplier(settings.fontSize)
    : 1.0;

  return {
    settings,
    loading,
    fontSizeMultiplier,
    updateFontSize,
    updateLocale,
  };
}

