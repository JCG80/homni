
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { DistributionStrategy } from '../strategies/strategyFactory';

export type LeadSettings = Database['public']['Tables']['lead_settings']['Row'];

/**
 * Loads the current lead settings from the database
 * @returns Promise with the lead settings or null if not found
 */
export async function loadSettings(): Promise<LeadSettings | null> {
  try {
    const { data, error } = await supabase
      .from('lead_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error loading lead settings:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error in loadSettings:', err);
    return null;
  }
}

/**
 * Helper function for getting just the strategy from lead settings
 * @returns Promise with the current distribution strategy
 */
export async function getCurrentStrategyFromSettings(): Promise<DistributionStrategy> {
  const settings = await loadSettings();
  return settings?.strategy as DistributionStrategy || 'category_match';
}

// Example usage:
// import { loadSettings } from '@/modules/leads/utils/loadSettings';
//
// loadSettings()
//   .then((settings) => {
//     console.log('Lead settings:', settings);
//   })
//   .catch((err) => {
//     console.error('Error loading settings:', err);
//   });
