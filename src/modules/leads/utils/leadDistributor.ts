
import { supabase } from "@/integrations/supabase/client";
import { DistributionStrategy } from "../strategies/strategyFactory";
import { getCurrentStrategy } from "./getCurrentStrategy";

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

// Re-export the functions from getCurrentStrategy.ts
export { getCurrentStrategy, updateDistributionStrategy } from './getCurrentStrategy';
