/**
 * LocaleSwitcher component for changing application language
 * Updated to use the new comprehensive i18n system
 */

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type SupportedLanguage, changeLanguage, getCurrentLanguage } from '@/lib/i18n';
import { Globe } from 'lucide-react';

export const LocaleSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLanguage = getCurrentLanguage();

  const handleLanguageChange = (language: SupportedLanguage) => {
    changeLanguage(language);
  };

  return (
    <Select value={currentLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-auto min-w-[120px] gap-2">
        <Globe className="h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(SUPPORTED_LANGUAGES) as [SupportedLanguage, string][]).map(([code, name]) => (
          <SelectItem key={code} value={code}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};