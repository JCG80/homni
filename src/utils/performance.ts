/**
 * Performance optimization utilities
 */

import { logger } from './logger';

interface PerformanceConfig {
  enableMetrics: boolean;
  logSlowOperations: boolean;
  slowOperationThreshold: number; // milliseconds
}

const defaultConfig: PerformanceConfig = {
  enableMetrics: import.meta.env.MODE === 'development',
  logSlowOperations: true,
  slowOperationThreshold: 100,
};

/**
 * Measure execution time of an async function
 */
export async function measureAsync<T>(
  fn: () => Promise<T>,
  operationName: string,
  config: Partial<PerformanceConfig> = {}
): Promise<T> {
  const finalConfig = { ...defaultConfig, ...config };
  
  if (!finalConfig.enableMetrics) {
    return fn();
  }

  const startTime = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    
    if (finalConfig.logSlowOperations && duration > finalConfig.slowOperationThreshold) {
      logger.warn(`Slow operation detected: ${operationName}`, {
        module: 'performance',
        duration: `${duration.toFixed(2)}ms`,
        operation: operationName,
      });
    } else {
      logger.debug(`Operation completed: ${operationName}`, {
        module: 'performance',
        duration: `${duration.toFixed(2)}ms`,
        operation: operationName,
      });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error(`Operation failed: ${operationName}`, {
      module: 'performance',
      duration: `${duration.toFixed(2)}ms`,
      operation: operationName,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Measure execution time of a sync function
 */
export function measureSync<T>(
  fn: () => T,
  operationName: string,
  config: Partial<PerformanceConfig> = {}
): T {
  const finalConfig = { ...defaultConfig, ...config };
  
  if (!finalConfig.enableMetrics) {
    return fn();
  }

  const startTime = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - startTime;
    
    if (finalConfig.logSlowOperations && duration > finalConfig.slowOperationThreshold) {
      logger.warn(`Slow operation detected: ${operationName}`, {
        module: 'performance',
        duration: `${duration.toFixed(2)}ms`,
        operation: operationName,
      });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error(`Operation failed: ${operationName}`, {
      module: 'performance',
      duration: `${duration.toFixed(2)}ms`,
      operation: operationName,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Debounce function with performance logging
 */
export function createDebouncedFunction<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  operationName?: string
): T {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (operationName) {
        measureSync(() => fn(...args), `debounced-${operationName}`);
      } else {
        fn(...args);
      }
    }, delay);
  }) as T;
}