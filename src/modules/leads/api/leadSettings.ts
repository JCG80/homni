
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type LeadSettings = Database['public']['Tables']['lead_settings']['Row'];

/**
 * Fetches the latest lead settings from the database
 */
export async function fetchLeadSettings(): Promise<LeadSettings | null> {
  const { data, error } = await supabase
    .from('lead_settings')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
    
  if (error) {
    console.error('Error fetching lead settings:', error);
    throw error;
  }
  
  return data;
}

/**
 * Updates lead settings in the database by creating a new record
 * Note: This creates a new record rather than updating an existing one to maintain history
 */
export async function updateLeadSettings(updates: {
  filters?: Record<string, any>;
  daily_budget?: number | null;
  monthly_budget?: number | null;
  budget?: number | null;
  strategy?: string;
  global_pause?: boolean;
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
