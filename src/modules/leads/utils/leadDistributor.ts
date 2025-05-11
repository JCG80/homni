
import { supabase } from "@/integrations/supabase/client";
import { DistributionStrategy } from "../strategies/strategyFactory";
import { getCurrentStrategy } from "./getCurrentStrategy";
import { processUnassignedLeads } from "./processLeads";

/**
 * Helper function to check if a specific strategy is currently active
 * @param strategy Strategy to check
 * @param companyId Optional company ID
 * @returns Promise<boolean> indicating if the strategy is active
 */
export async function isStrategyActive(
  strategy: DistributionStrategy,
  companyId?: string
): Promise<boolean> {
  const currentStrategy = await getCurrentStrategy(companyId);
  return currentStrategy === strategy;
}

/**
 * Enhanced lead distribution with retry capability and additional options
 * @param options Configuration options for lead processing
 * @returns Promise<number> Number of leads processed successfully
 */
export async function processLeads(options: {
  strategy?: DistributionStrategy;
  showToasts?: boolean;
  companyId?: string;
  onlyNew?: boolean;
  maxRetries?: number;
}): Promise<number> {
  const { 
    strategy, 
    showToasts = true, 
    companyId, 
    onlyNew = true,
    maxRetries = 3 
  } = options;

  // Track attempt number
  let attempt = 1;
  let lastError: Error | null = null;
  let processedCount = 0;

  while (attempt <= maxRetries) {
    try {
      // Try to process leads
      processedCount = await processUnassignedLeads(strategy, {
        showToasts: attempt === maxRetries ? showToasts : false, // Only show toasts on the last attempt
        companyId,
        leadType: onlyNew ? 'new' : undefined
      });
      
      // If successful, break out of retry loop
      if (processedCount > 0 || attempt === maxRetries) {
        break;
      }
      
      // If no leads were processed but we have more attempts, wait before retrying
      console.log(`No leads processed on attempt ${attempt}. Retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Backoff strategy
      
    } catch (error) {
      console.error(`Error processing leads (attempt ${attempt}/${maxRetries}):`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Wait before retrying with exponential backoff
      if (attempt < maxRetries) {
        const backoffMs = 1000 * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
    
    attempt++;
  }
  
  // If we've exhausted retries and still have an error, log it but don't throw
  if (attempt > maxRetries && lastError && processedCount === 0) {
    console.error('Lead processing failed after all retry attempts:', lastError);
  }
  
  return processedCount;
}

// Re-export the functions from getCurrentStrategy.ts
export { getCurrentStrategy, updateDistributionStrategy } from './getCurrentStrategy';
