import en from './translations/en';
import az from './translations/az';
import ru from './translations/ru';

export const LANGUAGES = {
  en: { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  az: { code: 'az', label: 'Azerbaijani', nativeLabel: 'Azərbaycan', flag: '🇦🇿' },
  ru: { code: 'ru', label: 'Russian', nativeLabel: 'Русский', flag: '🇷🇺' },
};

export const DEFAULT_LANGUAGE = 'en';

export const translations = { en, az, ru };

/**
 * Deep-get a translation key like "common.loading"
 * Falls back to English, then to the key itself.
 */
export function getTranslation(lang, key) {
  const keys = key.split('.');
  const langTranslations = translations[lang] || translations[DEFAULT_LANGUAGE];

  let result = langTranslations;
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      // Fallback to English
      let fallback = translations[DEFAULT_LANGUAGE];
      for (const fk of keys) {
        if (fallback && typeof fallback === 'object' && fk in fallback) {
          fallback = fallback[fk];
        } else {
          return key; // Return key if not found anywhere
        }
      }
      return typeof fallback === 'string' ? fallback : key;
    }
  }

  return typeof result === 'string' ? result : key;
}
