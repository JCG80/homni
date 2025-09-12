
import { supabase } from "@/integrations/supabase/client";
import { distributeLeadToProvider, DistributionStrategy } from '../strategies/strategyFactory';
import { withRetry } from '@/utils/apiRetry';
import { logger } from '@/utils/logger';
// Removed emoji mapping - DB now enforces slug statuses only
// import { mapToEmojiStatus } from '@/types/leads';

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
        onRetry: (attempt) => logger.info('Retrying provider selection for lead', {
          module: 'leadAssignment',
          action: 'assignLeadToProvider',
          leadId: lead.id,
          attempt
        })
      }
    );
    
    if (!providerId) {
      logger.warn('No provider found for lead', {
        module: 'leadAssignment',
        action: 'assignLeadToProvider',
        leadId: lead.id,
        category: lead.category
      });
      return false;
    }
    
    // Update lead with the selected provider and ensure slug status (DB now enforces slugs)
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        company_id: providerId,
        status: 'qualified', // use slug (previously mapped from "assigned" -> "qualified")
        updated_at: new Date().toISOString()
      })
      .eq('id', lead.id);
    
    if (updateError) {
      logger.error('Error assigning lead', {
        module: 'leadAssignment',
        action: 'assignLeadToProvider',
        leadId: lead.id
      }, updateError);
      return false;
    }
    
    // Log the assignment in lead_history with enhanced tracking
    const { error: historyError } = await supabase
      .from('lead_history')
      .insert({
        lead_id: lead.id,
        assigned_to: providerId,
        method: 'auto',
        previous_status: 'new',
        new_status: 'qualified',
        metadata: {
          strategy_used: strategy,
          assignment_timestamp: new Date().toISOString(),
          lead_category: lead.category,
          reasoning: strategy === 'category_match' 
            ? `Category match: ${lead.category}` 
            : 'Round-robin assignment'
        }
      });
      
    if (historyError) {
      logger.error('Error logging lead history', {
        module: 'leadAssignment',
        action: 'assignLeadToProvider',
        leadId: lead.id
      }, historyError);
      // We still consider the assignment successful even if history logging fails
    }
    
    return true;
  } catch (error) {
    logger.error('Error processing lead', {
      module: 'leadAssignment',
      action: 'assignLeadToProvider',
      leadId: lead.id
    }, error);
    return false;
  }
}
