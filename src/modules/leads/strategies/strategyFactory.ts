
import { selectProviderByRoundRobin } from './roundRobin';
import { selectProviderByCategory } from './categoryMatch';

export type DistributionStrategy = 'roundRobin' | 'categoryMatch';

export const DISTRIBUTION_STRATEGIES = ['roundRobin', 'categoryMatch'] as const;

/**
 * Factory function that returns the appropriate lead distribution strategy
 * @param strategy - The distribution strategy to use
 * @param category - The category of the lead (required for categoryMatch)
 * @returns Promise<string | null> - The provider ID or null if no match
 */
export async function distributeLeadToProvider(
  strategy: DistributionStrategy, 
  category?: string
): Promise<string | null> {
  switch (strategy) {
    case 'roundRobin':
      return selectProviderByRoundRobin();
    
    case 'categoryMatch':
      if (!category) {
        console.error('Category is required for categoryMatch strategy');
        return null;
      }
      return selectProviderByCategory(category);
    
    default:
      console.error(`Unknown distribution strategy: ${strategy}`);
      return null;
  }
}
