
import { Database } from '@/integrations/supabase/types';
import { LeadSettings } from '@/types/leads';

/**
 * Parses lead settings from database format to application format
 * @param data Raw data from database
 * @returns LeadSettings object
 */
export function parseLeadSettings(data: Database['public']['Tables']['lead_settings']['Row']): LeadSettings {
  return {
    id: data.id,
    strategy: data.strategy,
    globally_paused: data.globally_paused,
    global_pause: data.global_pause,
    agents_paused: data.agents_paused,
    filters: data.filters || { categories: [], zipCodes: [], lead_types: [] },
    budget: data.budget,
    daily_budget: data.daily_budget,
    monthly_budget: data.monthly_budget,
    updated_at: data.updated_at,
    auto_distribute: data.auto_distribute || false,
    
    // Computed properties
    paused: data.globally_paused || data.global_pause,
    categories: data.filters?.categories || [],
    zipCodes: data.filters?.zipCodes || [],
    lead_types: data.filters?.lead_types || []
  };
}
