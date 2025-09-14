/**
 * Language switcher component for the navigation
 * Updated to use the new comprehensive i18n system
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type SupportedLanguage, changeLanguage, getCurrentLanguage } from '@/lib/i18n';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLanguage = getCurrentLanguage();

  const handleLanguageChange = (language: SupportedLanguage) => {
    changeLanguage(language);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">
            {SUPPORTED_LANGUAGES[currentLanguage]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.entries(SUPPORTED_LANGUAGES) as [SupportedLanguage, string][]).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={currentLanguage === code ? 'bg-accent' : ''}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};