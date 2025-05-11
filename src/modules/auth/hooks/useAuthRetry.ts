
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface AuthRetryOptions {
  maxRetries?: number;
  onSuccess?: () => void;
  onFinalFailure?: (error: Error) => void;
  showToasts?: boolean;
}

export const useAuthRetry = (options: AuthRetryOptions = {}) => {
  const {
    maxRetries = 3,
    onSuccess,
    onFinalFailure,
    showToasts = true
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);

  const executeWithRetry = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T | null> => {
      setIsSubmitting(true);
      setCurrentAttempt(prev => prev + 1);
      
      try {
        const result = await operation();
        // Reset counters on success
        setCurrentAttempt(0);
        setLastError(null);
        
        if (showToasts) {
          toast({
            title: 'Operasjon vellykket',
            description: 'Handlingen ble utført',
          });
        }
        
        if (onSuccess) onSuccess();
        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setLastError(errorObj);
        console.error(`Attempt ${currentAttempt}/${maxRetries} failed:`, errorObj);
        
        if (currentAttempt < maxRetries) {
          // Retry with exponential backoff
          const backoffTime = Math.min(1000 * Math.pow(2, currentAttempt), 8000);
          
          if (showToasts) {
            toast({
              title: `Forsøk ${currentAttempt}/${maxRetries} feilet`,
              description: `Prøver igjen om ${backoffTime / 1000} sekunder...`,
              variant: 'default',
            });
          }
          
          return new Promise((resolve) => {
            setTimeout(async () => {
              const retryResult = await executeWithRetry(operation);
              resolve(retryResult);
            }, backoffTime);
          });
        } else {
          // Log final failure after retries
          console.error(`Operation failed after ${maxRetries} attempts:`, errorObj);
          
          if (showToasts) {
            toast({
              title: 'Operasjonen feilet',
              description: `Kunne ikke fullføre etter ${maxRetries} forsøk: ${errorObj.message}`,
              variant: 'destructive',
            });
          }
          
          setCurrentAttempt(0);
          
          if (onFinalFailure) {
            onFinalFailure(errorObj);
          }
          
          return null;
        }
      } finally {
        if (currentAttempt >= maxRetries || lastError === null) {
          setIsSubmitting(false);
        }
      }
    },
    [currentAttempt, lastError, maxRetries, onFinalFailure, onSuccess, showToasts]
  );

  return {
    executeWithRetry,
    isSubmitting,
    currentAttempt,
    maxRetries,
    lastError,
    resetState: () => {
      setCurrentAttempt(0);
      setIsSubmitting(false);
      setLastError(null);
    }
  };
};
