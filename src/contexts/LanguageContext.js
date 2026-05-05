"use client";
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { LANGUAGES, DEFAULT_LANGUAGE, getTranslation } from '@/i18n';
import { setupLanguageInterceptor } from '@/utils/languageInterceptor';
import api from '@/services/api';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);

  // Setup axios interceptor once on mount
  useEffect(() => {
    setupLanguageInterceptor(api);
  }, []);

  // Load saved language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('appLanguage');
      if (saved && LANGUAGES[saved]) {
        setLanguage(saved);
        document.documentElement.lang = saved;
      }
    }
  }, []);

  const changeLanguage = useCallback((langCode) => {
    if (LANGUAGES[langCode]) {
      setLanguage(langCode);
      if (typeof window !== 'undefined') {
        localStorage.setItem('appLanguage', langCode);
        // Update <html lang="..."> attribute
        document.documentElement.lang = langCode;
      }
    }
  }, []);

  // Translation function - supports "section.key" dot notation
  const t = useCallback((key) => {
    return getTranslation(language, key);
  }, [language]);

  const value = useMemo(() => ({
    language,
    changeLanguage,
    t,
    languages: LANGUAGES,
    currentLanguage: LANGUAGES[language],
  }), [language, changeLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Convenience alias
export const useTranslation = useLanguage;
