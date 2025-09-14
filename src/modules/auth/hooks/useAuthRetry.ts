
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface AuthRetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  backoffFactor?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showToasts?: boolean;
}

type AuthRetryOperation<T> = () => Promise<T>;

export const useAuthRetry = (options: AuthRetryOptions = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffFactor = 2,
    onSuccess,
    onError,
    showToasts = true
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);

  const executeWithRetry = useCallback(async <T>(operation: AuthRetryOperation<T>, attempt: number = 0): Promise<T | null> => {
    setIsSubmitting(true);
    setCurrentAttempt(attempt + 1);
    
    try {
      logger.info('Auth retry attempt', { attempt: attempt + 1, maxRetries });
      const result = await operation();
      
      // Success
      setCurrentAttempt(0);
      setLastError(null);
      setIsSubmitting(false);
      
      if (showToasts) {
        toast({
          title: "Vellykket",
          description: "Operasjonen var vellykket",
        });
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Ukjent feil");
      logger.error('Auth retry attempt failed', { attempt: attempt + 1, error });
      setLastError(error);
      
      // Check if we should retry
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(backoffFactor, attempt);
        logger.info('Auth retry delay', { delay });
        
        // Wait and try again
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(executeWithRetry(operation, attempt + 1));
          }, delay);
        });
      } else {
        // Max retries reached
        setIsSubmitting(false);
        
        if (showToasts) {
          toast({
            title: "Feil",
            description: `Kunne ikke fullføre operasjonen etter ${maxRetries} forsøk: ${error.message}`,
            variant: "destructive",
          });
        }
        
        if (onError) {
          onError(error);
        }
        
        return null;
      }
    }
  }, [maxRetries, initialDelay, backoffFactor, onSuccess, onError, showToasts]);

  return {
    isSubmitting,
    currentAttempt,
    maxRetries,
    executeWithRetry,
    lastError,
  };
};
