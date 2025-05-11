
import { supabase } from "@/integrations/supabase/client";
import { distributeLeadToProvider, DistributionStrategy } from '../strategies/strategyFactory';
import { withRetry } from '@/utils/apiRetry';

/**
 * Assign a lead to a provider using the specified strategy
 * @param lead The lead to assign
 * @param strategy The distribution strategy to use
 * @returns boolean indicating if the assignment was successful
 */
export async function assignLeadToProvider(lead: any, strategy: DistributionStrategy): Promise<boolean> {
  try {
    // Get provider based on selected strategy with retry logic
    const providerId = await withRetry(
      () => distributeLeadToProvider(strategy, lead.category),
      {
        maxAttempts: 3,
        delayMs: 500,
        backoffFactor: 1.5,
        onRetry: (attempt) => console.log(`Retrying provider selection for lead ${lead.id} (attempt ${attempt})`)
      }
    );
    
    if (!providerId) {
      console.log(`No provider found for lead ${lead.id} with category ${lead.category}`);
      return false;
    }
    
    // Update lead with the selected provider and ensure valid status
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
      return false;
    }
    
    // Log the assignment in lead_history
    const { error: historyError } = await supabase
      .from('lead_history')
      .insert({
        lead_id: lead.id,
        assigned_to: providerId,
        method: 'auto',
        previous_status: 'new',
        new_status: 'assigned'
      });
      
    if (historyError) {
      console.error(`Error logging lead history for ${lead.id}:`, historyError);
      // We still consider the assignment successful even if history logging fails
    }
    
    return true;
  } catch (error) {
    console.error(`Error processing lead ${lead.id}:`, error);
    return false;
  }
}
