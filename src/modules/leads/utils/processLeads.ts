
import { distributeLeadToProvider, DistributionStrategy } from '../strategies/strategyFactory';
import { supabase } from "@/integrations/supabase/client";
import { fetchLeadSettings } from '../api/leadSettings';
import { toast } from '@/hooks/use-toast';
import { isValidLeadStatus } from '@/types/leads';
import { getCurrentStrategy } from './getCurrentStrategy';

/**
 * Processes unassigned leads using the specified distribution strategy
 * @param strategy - Which distribution strategy to use (will use the one from settings if not provided)
 * @param options - Additional options for processing
 * @returns Promise<number> - Number of leads processed
 */
export async function processUnassignedLeads(
  strategy?: DistributionStrategy,
  options: {
    leadType?: string;
    showToasts?: boolean;
    companyId?: string;
  } = {}
): Promise<number> {
  const { leadType, showToasts = true, companyId } = options;
  
  try {
    // First check if the system is paused via settings
    const settings = await fetchLeadSettings(companyId);
    
    if (!settings) {
      console.warn('No lead settings found, using default strategy');
    } else if (settings.paused) {
      console.log('Lead distribution is paused in settings');
      if (showToasts) {
        toast({
          title: 'Distribution paused',
          description: 'Lead distribution is currently paused in system settings',
          variant: 'destructive',
        });
      }
      return 0;
    }
    
    // Use provided strategy or get from settings or fallback to default
    let distributionStrategy = strategy;
    
    if (!distributionStrategy) {
      // Try to get strategy from settings, or load from database if not available
      distributionStrategy = settings?.strategy as DistributionStrategy || 
        await getCurrentStrategy(companyId);
    }
    
    console.log(`Using distribution strategy: ${distributionStrategy}`);
    
    // Build query for unassigned leads
    let query = supabase
      .from('leads')
      .select('*')
      .eq('status', 'new')
      .is('company_id', null);
    
    // Filter by lead type if specified
    if (leadType) {
      query = query.eq('lead_type', leadType);
    }
    
    // Execute query
    const { data: unassignedLeads, error } = await query;
    
    if (error) {
      console.error('Error fetching unassigned leads:', error);
      if (showToasts) {
        toast({
          title: 'Error',
          description: 'Failed to fetch unassigned leads',
          variant: 'destructive',
        });
      }
      return 0;
    }
    
    if (!unassignedLeads || unassignedLeads.length === 0) {
      console.log('No unassigned leads to process');
      if (showToasts) {
        toast({
          title: 'No leads',
          description: 'No unassigned leads to process',
          variant: 'default',
        });
      }
      return 0;
    }
    
    let assignedCount = 0;
    
    // Process each lead
    for (const lead of unassignedLeads) {
      // Validate lead status - if it's not valid, skip this lead
      if (!isValidLeadStatus(lead.status)) {
        console.warn(`Lead ${lead.id} has invalid status ${lead.status}, skipping`);
        continue;
      }

      // Apply filters from lead settings if they exist
      if (settings?.filters) {
        // Filter by categories
        if (settings.categories && settings.categories.length > 0) {
          if (!settings.categories.includes(lead.category)) {
            console.log(`Lead ${lead.id} skipped due to category filter`);
            continue;
          }
        }
        
        // Filter by lead types
        if (settings.lead_types && settings.lead_types.length > 0) {
          if (!settings.lead_types.includes(lead.lead_type)) {
            console.log(`Lead ${lead.id} skipped due to lead_type filter`);
            continue;
          }
        }
        
        // Filter by zip codes
        if (settings.zipCodes && settings.zipCodes.length > 0) {
          // Fixed postcode access - properly handle different ways it might be stored
          const zipCode = typeof lead.metadata === 'object' && lead.metadata 
            ? (lead.metadata as any).postal_code || 
              (lead.metadata as any).zip_code || 
              (lead.metadata as any).zipCode || 
              (lead.metadata as any).postcode
            : null;
            
          if (zipCode && !settings.zipCodes.includes(zipCode)) {
            console.log(`Lead ${lead.id} skipped due to zip code filter`);
            continue;
          }
        }
      }
      
      // Get provider based on selected strategy
      const providerId = await distributeLeadToProvider(
        distributionStrategy, 
        lead.category
      );
      
      if (providerId) {
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
        } else {
          assignedCount++;
          
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
          }
        }
      }
    }
    
    console.log(`Processed ${unassignedLeads.length} leads, assigned ${assignedCount}`);
    
    if (showToasts) {
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
    }
    
    return assignedCount;
  } catch (error) {
    console.error('Error in processUnassignedLeads:', error);
    if (showToasts) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
    return 0;
  }
}
