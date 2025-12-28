/**
 * Language Context
 * Çoklu dil desteği ve çeviri yönetimi
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import trTranslations from '../locales/tr.json';
import enTranslations from '../locales/en.json';

type Language = 'tr' | 'en';

type TranslationKey = string;
type Translations = typeof trTranslations;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

const translations: Record<Language, Translations> = {
  tr: trTranslations,
  en: enTranslations,
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // localStorage'dan dil tercihini al
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) {
      return savedLanguage;
    }
    // Tarayıcı dilini kontrol et
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'tr' || browserLang === 'en') {
      return browserLang as Language;
    }
    return 'tr'; // Varsayılan Türkçe
  });

  useEffect(() => {
    // HTML elementine lang attribute'u ekle
    document.documentElement.setAttribute('lang', language);
    // localStorage'a kaydet
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  // Çeviri fonksiyonu - nested key'leri destekler (örn: "common.search", "sidebar.nav.dashboard")
  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k as keyof typeof value];
      } else {
        // Çeviri bulunamazsa anahtar döndür
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

