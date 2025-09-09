/**
 * Enhanced error handling utilities
 */

import { logger } from './logger';
import { toast } from "@/components/ui/use-toast";

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', context);
    this.name = 'NetworkError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'AUTH_ERROR', context);
    this.name = 'AuthError';
  }
}

/**
 * Enhanced error handler with logging and user feedback
 */
export function handleError(error: unknown, context?: { module?: string; component?: string; action?: string }) {
  const errorInfo = {
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : 'Unknown',
    code: error instanceof AppError ? error.code : 'UNKNOWN_ERROR',
    context: error instanceof AppError ? error.context : undefined,
    stack: error instanceof Error ? error.stack : undefined,
  };

  // Log the error
  logger.error('Error occurred', {
    module: context?.module || 'unknown',
    component: context?.component,
    action: context?.action,
    ...errorInfo,
  });

  // Show user-friendly error message
  if (error instanceof ValidationError) {
    toast({
      title: 'Validering feilet',
      description: error.message,
      variant: 'destructive',
    });
  } else if (error instanceof NetworkError) {
    toast({
      title: 'Nettverksfeil',
      description: 'Kunne ikke koble til serveren. Prøv igjen senere.',
      variant: 'destructive',
    });
  } else if (error instanceof AuthError) {
    toast({
      title: 'Autorisasjonsfeil',
      description: 'Du må logge inn på nytt.',
      variant: 'destructive',
    });
  } else {
    toast({
      title: 'Noe gikk galt',
      description: 'En uventet feil oppstod. Prøv igjen senere.',
      variant: 'destructive',
    });
  }
}

/**
 * Async function wrapper with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: { module?: string; component?: string; action?: string }
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      throw error; // Re-throw for component error boundaries
    }
  }) as T;
}

/**
 * React error boundary error handler
 */
export function handleReactError(error: Error, errorInfo: { componentStack?: string }) {
  logger.error('React component error', {
    module: 'react',
    component: 'ErrorBoundary',
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack || 'unknown',
  });
}