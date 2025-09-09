/**
 * Tests for error handling utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  AppError, 
  ValidationError, 
  NetworkError, 
  AuthError,
  handleError,
  withErrorHandling,
  handleReactError 
} from '../errorHandling';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('../logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

import { toast } from "@/components/ui/use-toast";
import { logger } from '../logger';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Error Classes', () => {
  it('should create AppError with context', () => {
    const error = new AppError('Test error', 'TEST_ERROR', { key: 'value' });
    
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.context).toEqual({ key: 'value' });
    expect(error.name).toBe('AppError');
  });

  it('should create ValidationError', () => {
    const error = new ValidationError('Invalid input');
    
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.name).toBe('ValidationError');
  });

  it('should create NetworkError', () => {
    const error = new NetworkError('Connection failed');
    
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.name).toBe('NetworkError');
  });

  it('should create AuthError', () => {
    const error = new AuthError('Unauthorized');
    
    expect(error.code).toBe('AUTH_ERROR');
    expect(error.name).toBe('AuthError');
  });
});

describe('handleError', () => {
  it('should log error with context', () => {
    const error = new AppError('Test error', 'TEST_ERROR');
    const context = { module: 'test', component: 'TestComponent' };
    
    handleError(error, context);
    
    expect(logger.error).toHaveBeenCalledWith(
      'Error occurred',
      expect.objectContaining({
        module: 'test',
        component: 'TestComponent',
        message: 'Test error',
        code: 'TEST_ERROR',
      })
    );
  });

  it('should show validation error toast', () => {
    const error = new ValidationError('Invalid data');
    
    handleError(error);
    
    expect(toast).toHaveBeenCalledWith({
      title: 'Validering feilet',
      description: 'Invalid data',
      variant: 'destructive',
    });
  });

  it('should show network error toast', () => {
    const error = new NetworkError('Connection failed');
    
    handleError(error);
    
    expect(toast).toHaveBeenCalledWith({
      title: 'Nettverksfeil',
      description: 'Kunne ikke koble til serveren. Prøv igjen senere.',
      variant: 'destructive',
    });
  });

  it('should show auth error toast', () => {
    const error = new AuthError('Unauthorized');
    
    handleError(error);
    
    expect(toast).toHaveBeenCalledWith({
      title: 'Autorisasjonsfeil',
      description: 'Du må logge inn på nytt.',
      variant: 'destructive',
    });
  });

  it('should handle generic errors', () => {
    const error = new Error('Generic error');
    
    handleError(error);
    
    expect(toast).toHaveBeenCalledWith({
      title: 'Noe gikk galt',
      description: 'En uventet feil oppstod. Prøv igjen senere.',
      variant: 'destructive',
    });
  });

  it('should handle non-Error objects', () => {
    handleError('String error');
    
    expect(logger.error).toHaveBeenCalledWith(
      'Error occurred',
      expect.objectContaining({
        message: 'String error',
        name: 'Unknown',
        code: 'UNKNOWN_ERROR',
      })
    );
  });
});

describe('withErrorHandling', () => {
  it('should wrap async function and handle success', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');
    const wrappedFn = withErrorHandling(mockFn, { module: 'test' });
    
    const result = await wrappedFn('arg1', 'arg2');
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should wrap async function and handle errors', async () => {
    const error = new ValidationError('Test error');
    const mockFn = vi.fn().mockRejectedValue(error);
    const wrappedFn = withErrorHandling(mockFn, { module: 'test' });
    
    await expect(wrappedFn()).rejects.toThrow(error);
    expect(logger.error).toHaveBeenCalled();
    expect(toast).toHaveBeenCalled();
  });
});

describe('handleReactError', () => {
  it('should log React errors with component stack', () => {
    const error = new Error('Component error');
    const errorInfo = { componentStack: 'Component stack trace' };
    
    handleReactError(error, errorInfo);
    
    expect(logger.error).toHaveBeenCalledWith(
      'React component error',
      expect.objectContaining({
        module: 'react',
        component: 'ErrorBoundary',
        message: 'Component error',
        componentStack: 'Component stack trace',
      })
    );
  });

  it('should handle missing component stack', () => {
    const error = new Error('Component error');
    const errorInfo = {};
    
    handleReactError(error, errorInfo);
    
    expect(logger.error).toHaveBeenCalledWith(
      'React component error',
      expect.objectContaining({
        componentStack: 'unknown',
      })
    );
  });
});