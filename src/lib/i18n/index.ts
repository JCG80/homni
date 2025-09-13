/**
 * i18n Configuration for React-i18next
 * Part of Phase 3B Step 3: Unified Navigation Experience
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import React, { createContext, useContext } from 'react';

// Supported locales
export type SupportedLocale = 'no' | 'en' | 'se' | 'dk';

export const SUPPORTED_LOCALES: SupportedLocale[] = ['no', 'en', 'se', 'dk'];

// Translation type
export interface Translation {
  [key: string]: string | Translation;
}

// I18n Context type
export interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

// Create context
export const I18nContext = createContext<I18nContextType | null>(null);

// Import translation files - using ES module imports for Vite compatibility
import commonNO from '../../locales/no/common.json';
import commonEN from '../../locales/en/common.json';

const resources = {
  no: {
    common: commonNO,
  },
  en: {
    common: commonEN,
  },
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'no', // default language
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common'],
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    react: {
      useSuspense: false, // Disable suspense for now to avoid loading issues
    },
  });

// Utility functions
export const getCurrentLocale = (): SupportedLocale => {
  const stored = localStorage.getItem('locale');
  return (stored && SUPPORTED_LOCALES.includes(stored as SupportedLocale)) 
    ? (stored as SupportedLocale) 
    : 'no';
};

export const setLocale = (locale: SupportedLocale) => {
  localStorage.setItem('locale', locale);
  i18n.changeLanguage(locale);
};

export const getLocaleDisplayName = (locale: SupportedLocale, currentLocale: SupportedLocale): string => {
  const names = {
    no: { no: 'Norsk', en: 'Norwegian', se: 'Norska', dk: 'Norsk' },
    en: { no: 'Engelsk', en: 'English', se: 'Engelska', dk: 'Engelsk' },
    se: { no: 'Svensk', en: 'Swedish', se: 'Svenska', dk: 'Svensk' },
    dk: { no: 'Dansk', en: 'Danish', se: 'Danska', dk: 'Dansk' }
  };
  return names[locale][currentLocale] || locale;
};

export const loadMessages = async (locale: SupportedLocale): Promise<Translation> => {
  try {
    // For now, return from already loaded resources
    return resources[locale as keyof typeof resources]?.common || {};
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    return {};
  }
};

export const createTranslator = (messages: Translation) => {
  return (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = messages;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    if (typeof value !== 'string') {
      return key; // Return key if translation not found
    }
    
    // Simple parameter replacement
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param]?.toString() || match;
      });
    }
    
    return value;
  };
};

export default i18n;