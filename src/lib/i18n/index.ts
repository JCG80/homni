/**
 * i18n Configuration for React-i18next
 * Part of Phase 3B Step 3: Unified Navigation Experience
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files - using require for JSON compatibility
const commonNO = require('../../locales/no/common.json');
const commonEN = require('../../locales/en/common.json');

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

export default i18n;