
import { LeadSettings } from '@/types/leads';

/**
 * Parse and validate raw lead settings data into a properly typed LeadSettings object
 * Ensures type safety and consistent data structure
 */
export function parseLeadSettings(item: any): LeadSettings {
  const filters = item.filters || {};
  
  return {
    id: item.id || '',
    strategy: item.strategy || 'category_match',
    globally_paused: Boolean(item.globally_paused),
    global_pause: Boolean(item.global_pause),
    agents_paused: Boolean(item.agents_paused),
    filters: {
      categories: Array.isArray(filters.categories) ? filters.categories : [],
      zipCodes: Array.isArray(filters.zipCodes) ? filters.zipCodes : [],
      ...filters
    },
    budget: item.budget || null,
    daily_budget: item.daily_budget || null,
    monthly_budget: item.monthly_budget || null,
    updated_at: item.updated_at || new Date().toISOString(),
    
    // Properties for direct access
    paused: Boolean(item.globally_paused || item.global_pause),
    categories: Array.isArray(filters.categories) ? filters.categories : [],
    zipCodes: Array.isArray(filters.zipCodes) ? filters.zipCodes : [],
  };
}
