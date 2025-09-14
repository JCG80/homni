import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// Simple language detector without external dependency
const languageDetector = {
  type: 'languageDetector' as const,
  init: () => {},
  detect: () => {
    const saved = localStorage.getItem('homni-language');
    if (saved && Object.keys(SUPPORTED_LANGUAGES).includes(saved)) {
      return saved;
    }
    const browserLang = navigator.language.split('-')[0];
    return Object.keys(SUPPORTED_LANGUAGES).includes(browserLang) ? browserLang : 'no';
  },
  cacheUserLanguage: (lng: string) => {
    localStorage.setItem('homni-language', lng);
  }
};

// Import translation files
import enTranslations from '@/locales/en.json';
import noTranslations from '@/locales/no.json';

// Define supported languages
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  no: 'Norsk'
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Backward compatibility exports
export const SUPPORTED_LOCALES = Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[];
export const getLocaleDisplayName = (locale: SupportedLanguage, currentLocale?: SupportedLanguage): string => {
  return SUPPORTED_LANGUAGES[locale] || locale;
};

// Language detection is handled above

// Initialize i18next with language detection
i18n
  .use(initReactI18next)
  .init({
    // Available languages
    supportedLngs: Object.keys(SUPPORTED_LANGUAGES),
    fallbackLng: 'no', // Default to Norwegian
    
    // Language detection
    lng: languageDetector.detect(),

    // Resources
    resources: {
      en: {
        translation: enTranslations
      },
      no: {
        translation: noTranslations
      }
    },

    // Interpolation
    interpolation: {
      escapeValue: false, // React already escapes values
      format: (value, format) => {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        if (format === 'capitalize') {
          return value.charAt(0).toUpperCase() + value.slice(1);
        }
        return value;
      }
    },

    // React specific options
    react: {
      useSuspense: false, // We'll handle loading states ourselves
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em', 'b', 'u'],
    },

    // Development options
    debug: import.meta.env.MODE === 'development',
    
    // Key separator
    keySeparator: '.',
    nsSeparator: false, // We're not using namespaces
    
    // Missing key handling
    saveMissing: import.meta.env.MODE === 'development',
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (import.meta.env.MODE === 'development') {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      }
    },

    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',

    // Performance
    load: 'languageOnly', // Don't load country-specific variations
    preload: ['no', 'en'], // Preload main languages
    
    // Backend options (for future dynamic loading)
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    }
  });

// Helper functions
export const changeLanguage = (lng: SupportedLanguage) => {
  i18n.changeLanguage(lng);
};

export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language || 'no') as SupportedLanguage;
};

export const getLanguageDirection = (lng?: SupportedLanguage): 'ltr' | 'rtl' => {
  // All supported languages are left-to-right
  return 'ltr';
};

export const formatTranslationKey = (key: string): string => {
  // Helper to format translation keys consistently
  return key.toLowerCase().replace(/\s+/g, '_');
};

export default i18n;