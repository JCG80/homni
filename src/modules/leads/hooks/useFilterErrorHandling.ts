
import { useCallback } from 'react';
import { toast } from "@/hooks/use-toast";

/**
 * Hook for standardized filter error handling
 */
export function useFilterErrorHandling() {
  /**
   * Handle fetch errors consistently
   */
  const handleFetchError = useCallback((err: any, setError: (error: string | null) => void) => {
    console.error('Error loading user filters after retry attempts:', err);
    setError(err instanceof Error ? err.message : 'Unknown error');
    
    toast({
      title: 'Error loading filters',
      description: err instanceof Error ? err.message : 'An unexpected error occurred',
      variant: 'destructive',
    });
  }, []);

  /**
   * Notify user of retry attempts
   */
  const notifyRetryAttempt = useCallback((attempt: number, error: any) => {
    console.log(`Retrying filter fetch (attempt ${attempt}):`, error);
    toast({
      title: `Attempt ${attempt} failed`,
      description: "Retrying to load filters...",
      variant: "default"
    });
  }, []);

  return {
    handleFetchError,
    notifyRetryAttempt
  };
}
