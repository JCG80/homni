import React, { createContext } from 'react';
import type { SupportedLocale } from '@/lib/i18n';

export type { SupportedLocale };

export interface Translation {
  [key: string]: Translation | string;
}

export interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextType | null>(null);