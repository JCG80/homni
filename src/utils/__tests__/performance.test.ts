/**
 * Tests for performance utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { measureAsync, measureSync, createDebouncedFunction } from '../performance';

// Mock logger
vi.mock('../logger', () => ({
  logger: {
    warn: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

import { logger } from '../logger';

beforeEach(() => {
  vi.clearAllMocks();
  // Mock performance.now()
  vi.spyOn(performance, 'now')
    .mockReturnValueOnce(0)  // Start time
    .mockReturnValueOnce(50); // End time
});

describe('measureAsync', () => {
  it('should measure async function execution time', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');
    
    const result = await measureAsync(mockFn, 'test-operation');
    
    expect(result).toBe('result');
    expect(mockFn).toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalledWith(
      'Operation completed: test-operation',
      expect.objectContaining({
        module: 'performance',
        duration: '50.00ms',
        operation: 'test-operation',
      })
    );
  });

  it('should log slow operations', async () => {
    // Mock slow operation (200ms)
    vi.spyOn(performance, 'now')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(200);
    
    const mockFn = vi.fn().mockResolvedValue('result');
    
    await measureAsync(mockFn, 'slow-operation');
    
    expect(logger.warn).toHaveBeenCalledWith(
      'Slow operation detected: slow-operation',
      expect.objectContaining({
        duration: '200.00ms',
      })
    );
  });

  it('should handle async function errors', async () => {
    const error = new Error('Test error');
    const mockFn = vi.fn().mockRejectedValue(error);
    
    await expect(measureAsync(mockFn, 'error-operation')).rejects.toThrow(error);
    
    expect(logger.error).toHaveBeenCalledWith(
      'Operation failed: error-operation',
      expect.objectContaining({
        error: 'Test error',
      })
    );
  });

  it('should not measure when metrics disabled', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');
    
    const result = await measureAsync(mockFn, 'test-operation', { enableMetrics: false });
    
    expect(result).toBe('result');
    expect(logger.debug).not.toHaveBeenCalled();
  });
});

describe('measureSync', () => {
  it('should measure sync function execution time', () => {
    const mockFn = vi.fn().mockReturnValue('result');
    
    const result = measureSync(mockFn, 'sync-operation');
    
    expect(result).toBe('result');
    expect(mockFn).toHaveBeenCalled();
  });

  it('should handle sync function errors', () => {
    const error = new Error('Sync error');
    const mockFn = vi.fn().mockImplementation(() => { throw error; });
    
    expect(() => measureSync(mockFn, 'error-operation')).toThrow(error);
    
    expect(logger.error).toHaveBeenCalledWith(
      'Operation failed: error-operation',
      expect.objectContaining({
        error: 'Sync error',
      })
    );
  });
});

describe('createDebouncedFunction', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce function calls', () => {
    const mockFn = vi.fn();
    const debouncedFn = createDebouncedFunction(mockFn, 100);
    
    debouncedFn('arg1');
    debouncedFn('arg2');
    debouncedFn('arg3');
    
    expect(mockFn).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(100);
    
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('arg3');
  });

  it('should measure debounced operations', () => {
    const mockFn = vi.fn();
    const debouncedFn = createDebouncedFunction(mockFn, 100, 'debounced-test');
    
    debouncedFn();
    vi.advanceTimersByTime(100);
    
    expect(mockFn).toHaveBeenCalled();
  });
});