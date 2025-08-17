import React, { useState, useCallback, useMemo } from 'react';
import { I18nContext, SupportedLocale, defaultTranslations, Translation } from './index';

interface I18nProviderProps {
  children: React.ReactNode;
  defaultLocale?: SupportedLocale;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ 
  children, 
  defaultLocale = 'no' 
}) => {
  const [locale, setLocale] = useState<SupportedLocale>(defaultLocale);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let translation: Translation | string = defaultTranslations[locale];
    
    for (const k of keys) {
      if (typeof translation === 'object' && translation[k] !== undefined) {
        translation = translation[k];
      } else {
        // Fallback to English, then to key itself
        let fallback: Translation | string = defaultTranslations.en;
        for (const fk of keys) {
          if (typeof fallback === 'object' && fallback[fk] !== undefined) {
            fallback = fallback[fk];
          } else {
            return key; // Return key if no translation found
          }
        }
        translation = fallback;
        break;
      }
    }
    
    if (typeof translation !== 'string') {
      return key;
    }
    
    // Replace parameters in translation
    if (params) {
      let result = translation;
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
      });
      return result;
    }
    
    return translation;
  }, [locale]);

  const contextValue = useMemo(() => ({
    locale,
    setLocale,
    t
  }), [locale, t]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};