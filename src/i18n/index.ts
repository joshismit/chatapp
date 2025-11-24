import { en } from './locales/en';
import { es } from './locales/es';

export type Locale = 'en' | 'es';

const translations = {
  en,
  es,
};

let currentLocale: Locale = 'en';

/**
 * Set the current locale
 */
export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

/**
 * Get the current locale
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Get translation for a key with optional replacements
 */
export function t(key: string, replacements?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = translations[currentLocale];

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to English if key not found
      value = translations.en;
      for (const fallbackKey of keys) {
        value = value?.[fallbackKey];
      }
      break;
    }
  }

  if (typeof value !== 'string') {
    console.warn(`Translation key "${key}" not found`);
    return key;
  }

  // Replace placeholders like {name} with actual values
  if (replacements) {
    return value.replace(/\{(\w+)\}/g, (match, placeholder) => {
      return replacements[placeholder]?.toString() || match;
    });
  }

  return value;
}

/**
 * Format message with pluralization support (simple version)
 */
export function tPlural(
  key: string,
  count: number,
  replacements?: Record<string, string | number>
): string {
  const singularKey = `${key}_singular`;
  const pluralKey = `${key}_plural`;

  // For now, use simple logic - can be extended
  if (count === 1) {
    return t(singularKey, { ...replacements, count });
  }
  return t(pluralKey || key, { ...replacements, count });
}

