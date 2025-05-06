
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '../types/types';
import { distributeLeadToProvider, DistributionStrategy } from '../strategies/strategyFactory';
import { toast } from '@/hooks/use-toast';

/**
 * Process and distribute leads using the specified strategy
 * @param options Configuration options for lead processing
 * @returns Promise with count of processed leads 
 */
export async function processLeads(options: {
  strategy?: DistributionStrategy;
  showToasts?: boolean;
  onlyNew?: boolean;
} = {}): Promise<number> {
  const {
    strategy = 'categoryMatch',
    showToasts = true,
    onlyNew = true
  } = options;
  
  try {
    // Build query for leads
    let query = supabase
      .from('leads')
      .select('*');
    
    // Filter by status if onlyNew is true
    if (onlyNew) {
      query = query.eq('status', 'new');
    }
    
    // Add company_id filter to only get unassigned leads
    query = query.is('company_id', null);
    
    const { data: leads, error } = await query;

    if (error) {
      console.error('Error fetching leads:', error);
      if (showToasts) {
        toast({
          title: 'Error fetching leads',
          description: error.message,
          variant: 'destructive',
        });
      }
      return 0;
    }

    if (!leads || leads.length === 0) {
      console.log('No leads to distribute.');
      if (showToasts) {
        toast({
          title: 'No leads to distribute',
          description: 'There are no unassigned leads to process.',
          variant: 'default',
        });
      }
      return 0;
    }

    let successCount = 0;
    
    for (const lead of leads) {
      // Use strategy to select company
      const matchedCompanyId = await distributeLeadToProvider(strategy, lead.category);

      if (!matchedCompanyId) {
        console.log(`❌ No match found for lead ${lead.id} (${lead.category})`);
        continue;
      }

      // Update lead with matched company and status
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          company_id: matchedCompanyId,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id);

      if (updateError) {
        console.error(`🚫 Failed to update lead ${lead.id}:`, updateError);
      } else {
        console.log(`✅ Lead ${lead.id} assigned to company ${matchedCompanyId}`);
        successCount++;
      }
    }
    
    if (showToasts) {
      toast({
        title: 'Lead distribution completed',
        description: `Successfully assigned ${successCount} of ${leads.length} leads.`,
        variant: successCount > 0 ? 'default' : 'destructive',
      });
    }
    
    return successCount;
  } catch (err) {
    console.error('Unexpected error during lead processing:', err);
    if (showToasts) {
      toast({
        title: 'Lead processing failed',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
    return 0;
  }
}
