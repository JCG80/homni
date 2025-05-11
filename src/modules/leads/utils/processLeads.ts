
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
 * Checks if lead distribution is paused via settings
 * @param companyId Optional company ID for company-specific settings
 * @returns Promise<boolean> indicating if distribution is paused
 */
export async function isDistributionPaused(companyId?: string): Promise<boolean> {
  try {
    const settings = await withRetry(() => fetchLeadSettings(companyId), {
      maxAttempts: 3,
      delayMs: 500,
      backoffFactor: 2,
      onRetry: (attempt) => console.log(`Retrying fetching lead settings (attempt ${attempt})`)
    });
    
    if (!settings) {
      console.warn('No lead settings found, assuming not paused');
      return false;
    }
    
    return settings.paused;
  } catch (error) {
    console.error('Error checking pause status:', error);
    return false; // Assume not paused on error
  }
}

/**
 * Determines which distribution strategy to use
 * @param strategy Explicitly provided strategy (optional)
 * @param settings Lead settings (optional)
 * @param companyId Company ID for company-specific settings (optional)
 * @returns Promise<DistributionStrategy> with the strategy to use
 */
export async function determineDistributionStrategy(
  strategy?: DistributionStrategy,
  settings?: any,
  companyId?: string
): Promise<DistributionStrategy> {
  // Use provided strategy or get from settings or fallback to default
  if (strategy) {
    return strategy;
  }
  
  // Try to get strategy from settings, or load from database if not available
  return settings?.strategy as DistributionStrategy || await getCurrentStrategy(companyId);
}

/**
 * Process a single lead against filters and assign to provider
 * @param lead The lead to process
 * @param settings Lead settings with filtering rules
 * @param strategy Distribution strategy to use
 * @returns boolean indicating if lead was successfully processed
 */
export async function processSingleLead(
  lead: any, 
  settings: any, 
  strategy: DistributionStrategy
): Promise<boolean> {
  // Apply filters from lead settings
  if (!applyLeadFilters(lead, settings)) {
    console.log(`Lead ${lead.id} filtered out`);
    return false;
  }

  // Assign lead to provider
  return await assignLeadToProvider(lead, strategy);
}

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
    // Check if the system is paused via settings
    const isPaused = await isDistributionPaused(companyId);
    if (isPaused) {
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
    
    // Get settings
    const settings = await withRetry(() => fetchLeadSettings(companyId), {
      maxAttempts: 3,
      delayMs: 500,
      backoffFactor: 2,
      onRetry: (attempt) => console.log(`Retrying fetching lead settings (attempt ${attempt})`)
    });
    
    // Determine which strategy to use
    const distributionStrategy = await determineDistributionStrategy(strategy, settings, companyId);
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
      const assigned = await processSingleLead(lead, settings, distributionStrategy);
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
