/**
 * LocaleSwitcher component for changing application language
 */

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/hooks/useI18n';
import { SUPPORTED_LOCALES, getLocaleDisplayName } from '@/lib/i18n';
import { Globe } from 'lucide-react';

export const LocaleSwitcher: React.FC = () => {
  const { locale, setLocale } = useI18n();

  return (
    <Select value={locale} onValueChange={setLocale}>
      <SelectTrigger className="w-auto min-w-[120px] gap-2">
        <Globe className="h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LOCALES.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {getLocaleDisplayName(loc, locale)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};