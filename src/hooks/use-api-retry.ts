
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

interface ApiRetryOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  maxRetries?: number;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successToastMessage?: string;
  errorToastMessage?: string;
}

/**
 * Hook for making API calls with automatic retry and toast notifications
 */
export function useApiRetry<T>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const call = async (
    apiFunction: () => Promise<T>,
    options: ApiRetryOptions<T> = {}
  ): Promise<T | null> => {
    const {
      onSuccess,
      onError,
      maxRetries = 2,
      showSuccessToast = false,
      showErrorToast = true,
      successToastMessage = 'Operasjonen var vellykket',
      errorToastMessage = 'Det oppstod en feil. Vennligst prøv igjen senere.'
    } = options;

    setIsLoading(true);
    setError(null);

    let retryCount = 0;

    const attemptCall = async (): Promise<T | null> => {
      try {
        const result = await apiFunction();
        setData(result);

        if (showSuccessToast) {
          toast({
            title: 'Suksess',
            description: successToastMessage,
          });
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error(`API call failed (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);

        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying API call (${retryCount}/${maxRetries})...`);
          // Exponential backoff
          const delay = Math.min(1000 * 2 ** retryCount, 8000);
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptCall();
        }

        setError(error);

        if (showErrorToast) {
          toast({
            title: 'Feil',
            description: errorToastMessage,
            variant: 'destructive',
          });
        }

        if (onError) {
          onError(error);
        }

        return null;
      } finally {
        if (retryCount >= maxRetries) {
          setIsLoading(false);
        }
      }
    };

    return attemptCall();
  };

  return { call, isLoading, error, data };
}
