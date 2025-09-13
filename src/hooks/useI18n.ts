/**
 * Main i18n hook for the application
 * Provides translation function, locale state and locale changing
 */

import { useTranslation } from 'react-i18next';

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider. Make sure your component is wrapped with I18nProvider.');
  }
  return context;
};

export default useI18n;