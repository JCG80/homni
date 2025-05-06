
import { Lead } from '../types/types';
import { supabase } from "@/integrations/supabase/client";
import { distributeLeadToProvider, DistributionStrategy } from '../strategies/strategyFactory';

/**
 * Processes unassigned leads using the specified distribution strategy
 * @param strategy - Which distribution strategy to use
 * @returns Promise<number> - Number of leads processed
 */
export async function processUnassignedLeads(
  strategy: DistributionStrategy = 'roundRobin'
): Promise<number> {
  // Get unassigned leads (those with status "new" and no company_id)
  const { data: unassignedLeads, error } = await supabase
    .from('leads')
    .select('*')
    .eq('status', 'new')
    .is('company_id', null);
  
  if (error) {
    console.error('Error fetching unassigned leads:', error);
    return 0;
  }
  
  if (!unassignedLeads || unassignedLeads.length === 0) {
    console.log('No unassigned leads to process');
    return 0;
  }
  
  let assignedCount = 0;
  
  // Process each lead
  for (const lead of unassignedLeads) {
    // Get provider based on selected strategy
    const providerId = await distributeLeadToProvider(
      strategy, 
      lead.category
    );
    
    if (providerId) {
      // Update lead with the selected provider
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          company_id: providerId,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id);
      
      if (updateError) {
        console.error(`Error assigning lead ${lead.id}:`, updateError);
      } else {
        assignedCount++;
      }
    }
  }
  
  console.log(`Processed ${unassignedLeads.length} leads, assigned ${assignedCount}`);
  return assignedCount;
}
