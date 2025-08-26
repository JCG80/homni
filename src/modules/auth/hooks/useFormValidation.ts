import { useState, useCallback } from 'react';

interface ValidationOptions {
  type: 'text' | 'email' | 'password' | 'tel';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

interface ValidationResult {
  isValid: boolean;
  error: string | null;
  hasInteracted: boolean;
  validate: (value: string) => void;
  reset: () => void;
}

export const useFormValidation = ({
  type,
  required = false,
  minLength,
  maxLength
}: ValidationOptions): ValidationResult => {
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const validateValue = useCallback((value: string): { isValid: boolean; error: string | null } => {
    // If not required and empty, it's valid
    if (!required && !value.trim()) {
      return { isValid: true, error: null };
    }

    // Required field validation
    if (required && !value.trim()) {
      return { isValid: false, error: 'Dette feltet er påkrevd' };
    }

    // Type-specific validation
    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return { isValid: false, error: 'Ugyldig e-postadresse' };
        }
        break;

      case 'password':
        if (minLength && value.length < minLength) {
          return { 
            isValid: false, 
            error: `Passordet må være minst ${minLength} tegn langt` 
          };
        }
        if (value.length < 6) {
          return { 
            isValid: false, 
            error: 'Passordet må være minst 6 tegn langt' 
          };
        }
        break;

      case 'tel':
        // Basic phone number validation (Norwegian format)
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
        if (value && !phoneRegex.test(value.replace(/\s/g, ''))) {
          return { 
            isValid: false, 
            error: 'Ugyldig telefonnummer' 
          };
        }
        break;

      case 'text':
        if (minLength && value.length < minLength) {
          return { 
            isValid: false, 
            error: `Minimum ${minLength} tegn` 
          };
        }
        break;
    }

    // Length validation
    if (maxLength && value.length > maxLength) {
      return { 
        isValid: false, 
        error: `Maksimum ${maxLength} tegn` 
      };
    }

    return { isValid: true, error: null };
  }, [type, required, minLength, maxLength]);

  const validate = useCallback((value: string) => {
    setHasInteracted(true);
    const result = validateValue(value);
    setIsValid(result.isValid);
    setError(result.error);
  }, [validateValue]);

  const reset = useCallback(() => {
    setIsValid(false);
    setError(null);
    setHasInteracted(false);
  }, []);

  return {
    isValid,
    error,
    hasInteracted,
    validate,
    reset
  };
};