import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nContext, SupportedLocale, getCurrentLocale, setLocale as persistLocale } from './index';

interface I18nProviderProps {
  children: React.ReactNode;
  defaultLocale?: SupportedLocale;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ 
  children, 
  defaultLocale = 'no' 
}) => {
  const { t, i18n } = useTranslation();
  const [locale, setLocaleState] = useState<SupportedLocale>(() => getCurrentLocale());

  // Update i18n language when locale changes
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale, i18n]);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    persistLocale(newLocale);
    setLocaleState(newLocale);
  }, []);

  const contextValue = useMemo(() => ({
    locale,
    setLocale,
    t
  }), [locale, setLocale, t]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};