
import { distributeLeadToProvider, DistributionStrategy } from '../strategies/strategyFactory';
import { supabase } from "@/integrations/supabase/client";
import { fetchLeadSettings } from '../api/leadSettings';
import { toast } from '@/hooks/use-toast';

/**
 * Processes unassigned leads using the specified distribution strategy
 * @param strategy - Which distribution strategy to use (will use the one from settings if not provided)
 * @returns Promise<number> - Number of leads processed
 */
export async function processUnassignedLeads(
  strategy?: DistributionStrategy
): Promise<number> {
  try {
    // First check if the system is paused via settings
    const settings = await fetchLeadSettings();
    
    if (!settings) {
      console.warn('No lead settings found, using default strategy');
    } else if (settings.paused) {
      console.log('Lead distribution is paused in settings');
      toast({
        title: 'Distribution paused',
        description: 'Lead distribution is currently paused in system settings',
        variant: 'destructive',
      });
      return 0;
    }
    
    // Use provided strategy or get from settings
    const distributionStrategy = strategy || (settings?.strategy as DistributionStrategy || 'roundRobin');
    
    // Get unassigned leads (those with status "new" and no company_id)
    const { data: unassignedLeads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('status', 'new')
      .is('company_id', null);
    
    if (error) {
      console.error('Error fetching unassigned leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch unassigned leads',
        variant: 'destructive',
      });
      return 0;
    }
    
    if (!unassignedLeads || unassignedLeads.length === 0) {
      console.log('No unassigned leads to process');
      toast({
        title: 'No leads',
        description: 'No unassigned leads to process',
        variant: 'default',
      });
      return 0;
    }
    
    let assignedCount = 0;
    
    // Process each lead
    for (const lead of unassignedLeads) {
      // Apply filters from lead settings if they exist
      if (settings?.categories && settings.categories.length > 0) {
        // Simple filtering logic based on category
        if (!settings.categories.includes(lead.category)) {
          console.log(`Lead ${lead.id} skipped due to category filter`);
          continue;
        }
      }
      
      // Check zip code filters if they exist
      if (settings?.zipCodes && settings.zipCodes.length > 0) {
        // Extract zip code from lead using any available property
        const zipCode = 
          (lead as any).postal_code || 
          (lead as any).zip_code || 
          (lead as any).zipCode;
          
        if (zipCode && !settings.zipCodes.includes(zipCode)) {
          console.log(`Lead ${lead.id} skipped due to zip code filter`);
          continue;
        }
      }
      
      // Get provider based on selected strategy
      const providerId = await distributeLeadToProvider(
        distributionStrategy, 
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
    
    if (assignedCount > 0) {
      toast({
        title: 'Leads distributed',
        description: `Successfully assigned ${assignedCount} of ${unassignedLeads.length} leads`,
        variant: 'default',
      });
    } else if (unassignedLeads.length > 0) {
      toast({
        title: 'No matches found',
        description: 'Found leads but could not find matching companies',
        variant: 'destructive',
      });
    }
    
    return assignedCount;
  } catch (error) {
    console.error('Error in processUnassignedLeads:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'An unknown error occurred',
      variant: 'destructive',
    });
    return 0;
  }
}
