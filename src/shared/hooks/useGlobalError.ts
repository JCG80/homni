import { useState, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface ErrorContext {
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
  originalError?: any;
}

export interface GlobalError extends Error {
  errorId: string;
  timestamp: string;
  context?: ErrorContext;
}

/**
 * Hook for programmatic error handling in functional components
 * Integrates with GlobalErrorBoundary for consistent error management
 */
export function useGlobalError() {
  const [error, setError] = useState<GlobalError | null>(null);

  const throwError = useCallback((
    message: string, 
    context?: ErrorContext
  ) => {
    const errorId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const enhancedError = new Error(message) as GlobalError;
    enhancedError.errorId = errorId;
    enhancedError.timestamp = new Date().toISOString();
    enhancedError.context = context;

    // Log the error with context
    logger.error('Manual error thrown via useGlobalError:', {
      errorId,
      message,
      context,
      stack: enhancedError.stack,
      timestamp: enhancedError.timestamp,
    });

    setError(enhancedError);
    
    // Throw to trigger ErrorBoundary
    throw enhancedError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const throwAsyncError = useCallback(async (
    asyncOperation: () => Promise<any>,
    context?: ErrorContext
  ) => {
    try {
      return await asyncOperation();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Async operation failed';
      throwError(message, { ...context, originalError: err });
    }
  }, [throwError]);

  return {
    error,
    throwError,
    throwAsyncError,
    clearError,
    hasError: !!error,
  };
}

// Utility function for throwing errors outside of React components
export const createGlobalError = (
  message: string, 
  context?: ErrorContext
): GlobalError => {
  const errorId = `util_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const error = new Error(message) as GlobalError;
  error.errorId = errorId;
  error.timestamp = new Date().toISOString();
  error.context = context;

  logger.error('Global error created:', {
    errorId,
    message,
    context,
    stack: error.stack,
    timestamp: error.timestamp,
  });

  return error;
};