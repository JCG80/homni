import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type SupportedLanguage, changeLanguage } from '@/lib/i18n';

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'ghost',
  size = 'default',
  showLabel = false,
  className = ''
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = (i18n.language || 'no') as SupportedLanguage;

  const handleLanguageChange = (language: SupportedLanguage) => {
    changeLanguage(language);
  };

  const currentLanguageName = SUPPORTED_LANGUAGES[currentLanguage];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`gap-2 ${className}`}
          aria-label={`Current language: ${currentLanguageName}. Click to change language`}
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          {showLabel && (
            <span className="hidden sm:inline">
              {currentLanguage.toUpperCase()}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-40">
        {(Object.entries(SUPPORTED_LANGUAGES) as [SupportedLanguage, string][]).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code as SupportedLanguage)}
            className={`cursor-pointer ${
              currentLanguage === code 
                ? 'bg-accent text-accent-foreground font-medium' 
                : ''
            }`}
            aria-current={currentLanguage === code ? 'true' : 'false'}
          >
            <div className="flex items-center justify-between w-full">
              <span>{name}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {code.toUpperCase()}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;