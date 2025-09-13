/**
 * Localization Provider - Internationalization support
 * Part of Homni platform development plan
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

type Locale = 'no' | 'en' | 'se' | 'dk';

interface LocalizationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
  isLoading: boolean;
  translations: Record<string, string>;
}

const LocalizationContext = createContext<LocalizationContextType | null>(null);

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

interface LocalizationProviderProps {
  children: React.ReactNode;
  defaultLocale?: Locale;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ 
  children, 
  defaultLocale = 'no' 
}) => {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations from database
  const loadTranslations = async (targetLocale: Locale) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('localization_entries')
        .select('key, value')
        .eq('locale', targetLocale);

      if (error) {
        logger.error('Failed to load translations:', error);
        return;
      }

      if (data) {
        const translationMap = data.reduce((acc, entry) => {
          acc[entry.key] = entry.value;
          return acc;
        }, {} as Record<string, string>);

        setTranslations(translationMap);
        logger.debug(`Loaded ${data.length} translations for locale: ${targetLocale}`);
      }
    } catch (error) {
      logger.error('Error loading translations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set locale and load translations
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('homni-locale', newLocale);
    loadTranslations(newLocale);
  };

  // Translation function
  const t = (key: string, fallback?: string): string => {
    const translation = translations[key];
    if (translation) {
      return translation;
    }

    // Try fallback to English if not Norwegian
    if (locale !== 'en' && translations[`${key}_en`]) {
      return translations[`${key}_en`];
    }

    // Return fallback or key as last resort
    return fallback || key;
  };

  // Initialize locale from localStorage and load translations
  useEffect(() => {
    const savedLocale = localStorage.getItem('homni-locale') as Locale;
    if (savedLocale && ['no', 'en', 'se', 'dk'].includes(savedLocale)) {
      setLocaleState(savedLocale);
      loadTranslations(savedLocale);
    } else {
      loadTranslations(defaultLocale);
    }
  }, [defaultLocale]);

  const value: LocalizationContextType = {
    locale,
    setLocale,
    t,
    isLoading,
    translations
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};