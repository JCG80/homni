/**
 * i18n (Internationalization) setup for Homni
 * Supports Norwegian (NO) and English (EN)
 */

import { logger } from '@/utils/logger';

export type Locale = 'no' | 'en';

export interface TranslationMessages {
  navigation: Record<string, string>;
  roles: Record<string, string>;
  auth: Record<string, string>;
  leads: Record<string, any>;
  companies: Record<string, any>;
  users: Record<string, any>;
  forms: Record<string, string>;
  messages: Record<string, string>;
  errors: Record<string, string>;
  actions: Record<string, string>;
  status: Record<string, string>;
}

// Default locale
export const DEFAULT_LOCALE: Locale = 'no';

// Available locales
export const SUPPORTED_LOCALES: Locale[] = ['no', 'en'];

// Translation cache
const translationCache = new Map<Locale, TranslationMessages>();

/**
 * Get current locale from browser/storage
 */
export function getCurrentLocale(): Locale {
  // Check localStorage first
  const stored = localStorage.getItem('homni-locale') as Locale;
  if (stored && SUPPORTED_LOCALES.includes(stored)) {
    return stored;
  }

  // Check browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('no') || browserLang.startsWith('nb') || browserLang.startsWith('nn')) {
    return 'no';
  }
  if (browserLang.startsWith('en')) {
    return 'en';
  }

  return DEFAULT_LOCALE;
}

/**
 * Set locale and persist to localStorage
 */
export function setLocale(locale: Locale): void {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    logger.warn(`Unsupported locale: ${locale}, falling back to ${DEFAULT_LOCALE}`, {
      module: 'i18n',
      locale,
      fallback: DEFAULT_LOCALE
    });
    locale = DEFAULT_LOCALE;
  }
  
  localStorage.setItem('homni-locale', locale);
  
  // Update document lang attribute
  document.documentElement.lang = locale === 'no' ? 'nb-NO' : 'en-US';
  
  // Trigger custom event for components that need to react
  window.dispatchEvent(new CustomEvent('localechange', { detail: { locale } }));
}

/**
 * Load translation messages for a locale
 */
export async function loadMessages(locale: Locale): Promise<TranslationMessages> {
  // Return cached if available
  if (translationCache.has(locale)) {
    return translationCache.get(locale)!;
  }

  try {
    // Dynamic import of locale files
    const messages = await import(`../../locales/${locale}/common.json`);
    const translationMessages = messages.default as TranslationMessages;
    
    // Cache the messages
    translationCache.set(locale, translationMessages);
    
    return translationMessages;
  } catch (error) {
    logger.error(`Failed to load locale ${locale}:`, {
      module: 'i18n',
      locale
    }, error as Error);
    
    // Fallback to default locale if loading fails
    if (locale !== DEFAULT_LOCALE) {
      return loadMessages(DEFAULT_LOCALE);
    }
    
    // Return empty structure as last resort
    return {
      navigation: {},
      roles: {},
      auth: {},
      leads: {},
      companies: {},
      users: {},
      forms: {},
      messages: {},
      errors: {},
      actions: {},
      status: {}
    };
  }
}

/**
 * Translation function
 */
export function createTranslator(messages: TranslationMessages) {
  return function t(key: string, params?: Record<string, any>): string {
    // Split key by dots to access nested objects
    const keys = key.split('.');
    let value: any = messages;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Key not found, return the key itself
        logger.warn(`Translation key not found: ${key}`, {
          module: 'i18n',
          key
        });
        return key;
      }
    }
    
    // If value is not a string, return the key
    if (typeof value !== 'string') {
      logger.warn(`Translation value is not a string: ${key}`, {
        module: 'i18n',
        key,
        value
      });
      return key;
    }
    
    // Replace parameters in the string
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }
    
    return value;
  };
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date | string, locale: Locale): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const localeString = locale === 'no' ? 'nb-NO' : 'en-US';
  return new Intl.DateTimeFormat(localeString, options).format(d);
}

/**
 * Format time according to locale
 */
export function formatTime(date: Date | string, locale: Locale): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const localeString = locale === 'no' ? 'nb-NO' : 'en-US';
  return new Intl.DateTimeFormat(localeString, options).format(d);
}

/**
 * Format number according to locale
 */
export function formatNumber(number: number, locale: Locale): string {
  const localeString = locale === 'no' ? 'nb-NO' : 'en-US';
  return new Intl.NumberFormat(localeString).format(number);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(amount: number, locale: Locale, currency: string = 'NOK'): string {
  const localeString = locale === 'no' ? 'nb-NO' : 'en-US';
  
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency
  };
  
  return new Intl.NumberFormat(localeString, options).format(amount);
}

/**
 * Get display name for locale
 */
export function getLocaleDisplayName(locale: Locale, inLocale: Locale = locale): string {
  const names: Record<Locale, Record<Locale, string>> = {
    no: {
      no: 'Norsk',
      en: 'Engelsk'
    },
    en: {
      no: 'Norwegian', 
      en: 'English'
    }
  };
  
  return names[inLocale]?.[locale] || locale;
}

// Export a simple useI18n hook to fix build errors temporarily
export const useI18n = () => {
  const locale = getCurrentLocale();
  return {
    t: (key: string) => key, // Temporary fallback
    locale,
    setLocale
  };
};