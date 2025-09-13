/**
 * i18n (Internationalization) setup for Homni
 * Supports Norwegian (NO) and English (EN)
 */

import { logger } from '@/utils/logger';

export type SupportedLocale = 'no' | 'en' | 'se' | 'dk';

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
export const DEFAULT_LOCALE: SupportedLocale = 'no';

// Available locales
export const SUPPORTED_LOCALES: SupportedLocale[] = ['no', 'en', 'se', 'dk'];

// Translation cache
const translationCache = new Map<SupportedLocale, TranslationMessages>();

/**
 * Get current locale from browser/storage
 */
export function getCurrentLocale(): SupportedLocale {
  // Check localStorage first
  const stored = localStorage.getItem('homni-locale') as SupportedLocale;
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
  if (browserLang.startsWith('se') || browserLang.startsWith('sv')) {
    return 'se';
  }
  if (browserLang.startsWith('dk') || browserLang.startsWith('da')) {
    return 'dk';
  }

  return DEFAULT_LOCALE;
}

/**
 * Set locale and persist to localStorage
 */
export function setLocale(locale: SupportedLocale): void {
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
  const langMap: Record<SupportedLocale, string> = {
    no: 'nb-NO',
    en: 'en-US', 
    se: 'sv-SE',
    dk: 'da-DK'
  };
  document.documentElement.lang = langMap[locale];
  
  // Trigger custom event for components that need to react
  window.dispatchEvent(new CustomEvent('localechange', { detail: { locale } }));
}

/**
 * Load translation messages for a locale
 */
export async function loadMessages(locale: SupportedLocale): Promise<TranslationMessages> {
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
export function formatDate(date: Date | string, locale: SupportedLocale): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const localeMap: Record<SupportedLocale, string> = {
    no: 'nb-NO',
    en: 'en-US',
    se: 'sv-SE', 
    dk: 'da-DK'
  };
  
  return new Intl.DateTimeFormat(localeMap[locale], options).format(d);
}

/**
 * Format time according to locale
 */
export function formatTime(date: Date | string, locale: SupportedLocale): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const localeMap: Record<SupportedLocale, string> = {
    no: 'nb-NO',
    en: 'en-US',
    se: 'sv-SE',
    dk: 'da-DK'
  };
  
  return new Intl.DateTimeFormat(localeMap[locale], options).format(d);
}

/**
 * Format number according to locale
 */
export function formatNumber(number: number, locale: SupportedLocale): string {
  const localeMap: Record<SupportedLocale, string> = {
    no: 'nb-NO',
    en: 'en-US',
    se: 'sv-SE',
    dk: 'da-DK'
  };
  return new Intl.NumberFormat(localeMap[locale]).format(number);
}

/**
 * Format currency according to locale  
 */
export function formatCurrency(amount: number, locale: SupportedLocale, currency: string = 'NOK'): string {
  const localeMap: Record<SupportedLocale, string> = {
    no: 'nb-NO',
    en: 'en-US',
    se: 'sv-SE',
    dk: 'da-DK'
  };
  
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency
  };
  
  return new Intl.NumberFormat(localeMap[locale], options).format(amount);
}

/**
 * Get display name for locale
 */
export function getLocaleDisplayName(locale: SupportedLocale, inLocale: SupportedLocale = locale): string {
  const names: Record<SupportedLocale, Record<SupportedLocale, string>> = {
    no: {
      no: 'Norsk',
      en: 'Engelsk',
      se: 'Svensk', 
      dk: 'Dansk'
    },
    en: {
      no: 'Norwegian', 
      en: 'English',
      se: 'Swedish',
      dk: 'Danish'
    },
    se: {
      no: 'Norska',
      en: 'Engelska',
      se: 'Svenska',
      dk: 'Danska'
    },
    dk: {
      no: 'Norsk',
      en: 'Engelsk', 
      se: 'Svensk',
      dk: 'Dansk'
    }
  };
  
  return names[inLocale]?.[locale] || locale;
}

// Remove temporary hook - will be replaced by proper hook from I18nProvider