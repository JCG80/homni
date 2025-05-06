
import { supabase } from "@/integrations/supabase/client";

/**
 * Selects a provider using a simple round-robin distribution strategy.
 * 
 * This strategy finds the provider who hasn't received a lead for the longest time
 * and assigns the new lead to them.
 *
 * @returns Promise<string | null> - Provider ID or null if no providers found
 */
export async function selectProviderByRoundRobin(): Promise<string | null> {
  try {
    // For now, we're using the leads table as we don't have a providers table.
    // In a real implementation, this would query a dedicated providers table.
    const { data: leads, error } = await supabase
      .from('leads')
      .select('company_id')
      .not('company_id', 'is', null)
      .order('updated_at', { ascending: true })
      .limit(1);
    
    if (error) {
      console.error('Error finding provider by round robin:', error);
      return null;
    }
    
    // If we found a provider, return their ID
    if (leads && leads.length > 0 && leads[0].company_id) {
      // In a real implementation, we would update the last_lead_assigned_at timestamp
      return leads[0].company_id;
    }
    
    console.log('No providers found for round robin assignment');
    return null;
  } catch (err) {
    console.error('Unexpected error in round robin selection:', err);
    return null;
  }
}
