
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { DistributionStrategy } from '../strategies/strategyFactory';
import { logger } from '@/utils/logger';

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
      logger.error('Error loading lead settings', {
        module: 'loadSettings',
        action: 'loadSettings'
      }, error);
      return null;
    }

    return data;
  } catch (err) {
    logger.error('Unexpected error in loadSettings', {
      module: 'loadSettings',
      action: 'loadSettings'
    }, err);
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
