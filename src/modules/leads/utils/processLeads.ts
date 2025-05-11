
import { DistributionStrategy } from '../strategies/strategyFactory';
import { supabase } from "@/integrations/supabase/client";
import { fetchLeadSettings } from '../api/leadSettings';
import { toast } from '@/hooks/use-toast';
import { getCurrentStrategy } from './getCurrentStrategy';
import { withRetry } from '@/utils/apiRetry';
import { fetchUnassignedLeads } from './leadQuery';
import { applyLeadFilters } from './leadFiltering';
import { assignLeadToProvider } from './leadAssignment';
import { showLeadProcessingNotifications } from './leadNotifications';

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
    const settings = await withRetry(() => fetchLeadSettings(companyId), {
      maxAttempts: 3,
      delayMs: 500,
      backoffFactor: 2,
      onRetry: (attempt) => console.log(`Retrying fetching lead settings (attempt ${attempt})`)
    });
    
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
    
    // Fetch unassigned leads
    const unassignedLeads = await fetchUnassignedLeads({ leadType });
    
    if (!unassignedLeads || unassignedLeads.length === 0) {
      console.log('No unassigned leads to process');
      showLeadProcessingNotifications({
        showToasts,
        totalLeads: 0,
        assignedCount: 0
      });
      return 0;
    }
    
    let assignedCount = 0;
    
    // Process each lead
    for (const lead of unassignedLeads) {
      // Apply filters from lead settings
      if (!applyLeadFilters(lead, settings)) {
        continue;
      }

      // Assign lead to provider
      const assigned = await assignLeadToProvider(lead, distributionStrategy!);
      if (assigned) {
        assignedCount++;
      }
    }
    
    console.log(`Processed ${unassignedLeads.length} leads, assigned ${assignedCount}`);
    
    // Show notifications based on results
    showLeadProcessingNotifications({
      showToasts,
      totalLeads: unassignedLeads.length,
      assignedCount
    });
    
    return assignedCount;
  } catch (error) {
    console.error('Error in processUnassignedLeads:', error);
    showLeadProcessingNotifications({
      showToasts,
      totalLeads: 0,
      assignedCount: 0,
      error: error instanceof Error ? error : new Error(String(error))
    });
    return 0;
  }
}
