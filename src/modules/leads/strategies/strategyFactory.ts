
import { selectProviderByRoundRobin } from './roundRobin';
import { selectProviderByCategory } from './categoryMatch';

export type DistributionStrategy = 'roundRobin' | 'category_match';

export const DISTRIBUTION_STRATEGIES = ['roundRobin', 'category_match'] as const;

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
    
    case 'category_match':
      if (!category) {
        console.error('Category is required for category_match strategy');
        return null;
      }
      return selectProviderByCategory(category);
    
    default:
      console.error(`Unknown distribution strategy: ${strategy}`);
      return null;
  }
}
