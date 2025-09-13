import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { I18nContext, SupportedLocale, Translation } from './index';
import { getCurrentLocale, setLocale as persistLocale, loadMessages, createTranslator } from '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
  defaultLocale?: SupportedLocale;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ 
  children, 
  defaultLocale = 'no' 
}) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => getCurrentLocale());
  const [messages, setMessages] = useState<any>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load messages when locale changes
  useEffect(() => {
    loadMessages(locale).then((loadedMessages) => {
      setMessages(loadedMessages);
      setIsLoaded(true);
    });
  }, [locale]);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    persistLocale(newLocale);
    setLocaleState(newLocale);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    if (!isLoaded) {
      return key; // Return key while loading
    }
    
    const translator = createTranslator(messages);
    return translator(key, params);
  }, [messages, isLoaded]);

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