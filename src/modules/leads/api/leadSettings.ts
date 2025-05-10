
import { supabase } from '@/integrations/supabase/client';
import { mapDbToLeadSettings } from '../types/lead-settings';
import { LeadSettings } from '../types/lead-settings';

/**
 * Fetches the latest lead settings from the database
 */
export async function fetchLeadSettings(): Promise<LeadSettings | null> {
  const { data, error } = await supabase
    .from('lead_settings')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching lead settings:', error);
    throw error;
  }
  
  return data ? mapDbToLeadSettings(data) : null;
}

/**
 * Updates lead settings in the database by creating a new record
 * Note: This creates a new record rather than updating an existing one to maintain history
 */
export async function updateLeadSettings(updates: {
  filters?: {
    categories?: string[];
    zipCodes?: string[];
    [key: string]: any;
  };
  daily_budget?: number | null;
  monthly_budget?: number | null;
  budget?: number | null;
  strategy?: string;
  global_pause?: boolean;
  agents_paused?: boolean;
  globally_paused?: boolean;
}): Promise<void> {
  const { error } = await supabase
    .from('lead_settings')
    .insert({
      ...updates,
      updated_at: new Date().toISOString()
    });
    
  if (error) {
    console.error('Error updating lead settings:', error);
    throw error;
  }
}

/**
 * Specifically toggles the pause state for agents
 */
export async function pauseForAgents(paused: boolean) {
  await updateLeadSettings({ agents_paused: paused });
}

/**
 * Specifically toggles the global pause state for the entire lead system
 */
export async function globalPause(paused: boolean) {
  await updateLeadSettings({ globally_paused: paused });
}

export type { LeadSettings };
