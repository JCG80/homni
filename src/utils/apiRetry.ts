
/**
 * Utility for performing automatic retries of API operations
 */

type RetryOptions = {
  maxAttempts: number;
  delayMs: number;
  backoffFactor: number;
  onRetry?: (attempt: number, error: any) => void;
};

const defaultOptions: RetryOptions = {
  maxAttempts: 3,
  delayMs: 500,
  backoffFactor: 1.5,
};

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
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < config.maxAttempts) {
        const delay = config.delayMs * Math.pow(config.backoffFactor, attempt - 1);
        
        if (config.onRetry) {
          config.onRetry(attempt, error);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
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
