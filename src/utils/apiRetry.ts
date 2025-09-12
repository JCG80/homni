
/**
 * Utility for performing automatic retries of API operations with enhanced error handling
 */

import { logger } from './logger';

type RetryOptions = {
  maxAttempts: number;
  delayMs: number;
  backoffFactor: number;
  onRetry?: (attempt: number, error: any) => void;
  retryableErrors?: string[] | ((error: any) => boolean);
};

const defaultOptions: RetryOptions = {
  maxAttempts: 3,
  delayMs: 500,
  backoffFactor: 1.5,
};

/**
 * Determines if an error should trigger a retry
 * @param error The error to check
 * @param retryableErrors Optional configuration specifying which errors are retryable
 * @returns True if the error should trigger a retry
 */
function shouldRetry(error: any, retryableErrors?: string[] | ((error: any) => boolean)): boolean {
  // If no retryable errors are specified, retry on any error
  if (!retryableErrors) return true;
  
  // If retryableErrors is a function, use it to determine if we should retry
  if (typeof retryableErrors === 'function') {
    return retryableErrors(error);
  }
  
  // If retryableErrors is an array of error messages, check if the error message matches any of them
  const errorMessage = error?.message || String(error);
  return retryableErrors.some(retryableError => errorMessage.includes(retryableError));
}

/**
 * Executes an async function with automatic retry
 * @param fn The async function to execute
 * @param options Retry configuration options
 * @returns The result of the function or throws an error if all attempts fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...defaultOptions, ...options };
  let lastError: any;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      // Log the attempt number if it's not the first attempt
      if (attempt > 1) {
        logger.info(`Retry attempt ${attempt}/${config.maxAttempts}`);
      }
      
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Log the error
      logger.error(`Attempt ${attempt} failed`, { error });
      
      if (attempt < config.maxAttempts && shouldRetry(error, config.retryableErrors)) {
        const delay = config.delayMs * Math.pow(config.backoffFactor, attempt - 1);
        
        if (config.onRetry) {
          config.onRetry(attempt, error);
        }
        
        logger.info(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else if (!shouldRetry(error, config.retryableErrors)) {
        logger.info('Error not retryable, giving up');
        throw lastError;
      } else {
        logger.info(`All ${config.maxAttempts} attempts failed, giving up`);
        throw lastError;
      }
    }
  }
  
  throw lastError;
}

/**
 * Creates a wrapper function that automatically retries the given function
 * @param fn The function to wrap with retry logic
 * @param options Retry configuration options
 * @returns A function with retry logic built in
 */
export function createRetryWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: Partial<RetryOptions> = {}
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return withRetry(() => fn(...args), options);
  }) as T;
}

/**
 * Simple utility to add a timeout to a promise
 * @param promise The promise to add a timeout to
 * @param timeoutMs The timeout in milliseconds
 * @param timeoutError The error to throw if the timeout is reached
 * @returns A promise that will reject if the timeout is reached
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError: Error = new Error(`Operation timed out after ${timeoutMs}ms`)
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(timeoutError);
    }, timeoutMs);
    
    promise
      .then(result => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}
