import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFormValidation } from '../../hooks/useFormValidation';

interface MobileOptimizedInputProps {
  label: string;
  type: 'text' | 'email' | 'password' | 'tel';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  required?: boolean;
  optional?: boolean;
  minLength?: number;
  className?: string;
}

export const MobileOptimizedInput = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  autoFocus,
  required = false,
  optional = false,
  minLength,
  className
}: MobileOptimizedInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { isValid, error, hasInteracted, validate } = useFormValidation({
    type,
    required,
    minLength
  });

  // Auto-focus on mobile devices
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // Delay to ensure proper mounting
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    validate(newValue);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  // Get appropriate input mode for mobile keyboards
  const getInputMode = () => {
    switch (type) {
      case 'email':
        return 'email';
      case 'tel':
        return 'tel';
      default:
        return 'text';
    }
  };

  const showValidation = hasInteracted && value.length > 0;
  const isError = showValidation && !isValid;
  const isSuccess = showValidation && isValid;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label 
          htmlFor={`input-${label}`}
          className="text-sm font-medium flex items-center gap-2"
        >
          {label}
          {optional && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              Valgfritt
            </Badge>
          )}
        </Label>
        
        {showValidation && (
          <div className="flex items-center gap-1">
            {isSuccess && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {isError && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
        )}
      </div>

      <div className="relative">
        <Input
          ref={inputRef}
          id={`input-${label}`}
          type={inputType}
          inputMode={getInputMode()}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          className={cn(
            "h-12 text-base", // Larger height and text for mobile
            "transition-all duration-200",
            isFocused && "border-primary ring-1 ring-primary",
            isError && "border-destructive ring-1 ring-destructive",
            isSuccess && "border-green-500 ring-1 ring-green-500",
            type === 'password' && "pr-12"
          )}
          // Mobile-specific attributes
          autoCapitalize={type === 'email' ? 'none' : 'words'}
          autoCorrect={type === 'email' || type === 'password' ? 'off' : 'on'}
          spellCheck={type === 'email' || type === 'password' ? false : true}
        />

        {type === 'password' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {showValidation && error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {type === 'password' && value.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-1 flex-1 rounded-full bg-muted",
              value.length >= 6 && "bg-green-500",
              value.length >= 4 && value.length < 6 && "bg-yellow-500",
              value.length < 4 && "bg-red-500"
            )} />
            <span>
              {value.length < 4 && "Svakt"}
              {value.length >= 4 && value.length < 6 && "OK"}  
              {value.length >= 6 && "Sterkt"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};