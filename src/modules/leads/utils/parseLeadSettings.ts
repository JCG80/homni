
import { Database } from '@/integrations/supabase/types';
import { LeadSettings } from '@/types/leads';

/**
 * Parses lead settings from database format to application format
 * @param data Raw data from database
 * @returns LeadSettings object
 */
export function parseLeadSettings(data: Database['public']['Tables']['lead_settings']['Row']): LeadSettings {
  // Ensure filters is an object (not a string or other non-object type)
  const filters = typeof data.filters === 'object' && data.filters !== null
    ? data.filters 
    : {};

  return {
    id: data.id,
    strategy: data.strategy,
    globally_paused: data.globally_paused,
    global_pause: data.global_pause,
    agents_paused: data.agents_paused,
    filters: filters,
    budget: data.budget,
    daily_budget: data.daily_budget,
    monthly_budget: data.monthly_budget,
    updated_at: data.updated_at,
    auto_distribute: data.auto_distribute || false,
    
    // Computed properties
    paused: data.globally_paused || data.global_pause,
    categories: Array.isArray(filters.categories) ? filters.categories : [],
    zipCodes: Array.isArray(filters.zipCodes) ? filters.zipCodes : [],
    lead_types: Array.isArray(filters.lead_types) ? filters.lead_types : []
  };
}
