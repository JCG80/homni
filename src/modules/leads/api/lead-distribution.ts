import { supabase } from '@/lib/supabaseClient';
import { ApiError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

/**
 * Lead Distribution API - Matching engine and assignment logic
 */

export interface DistributionCriteria {
  category: string;
  location?: string;
  urgency?: 'low' | 'medium' | 'high';
  budget_range?: string;
  service_type?: string;
}

export interface DistributionResult {
  success: boolean;
  companyId?: string;
  assignmentId?: string;
  cost?: number;
  message: string;
  fallbackReason?: string;
}

export interface CompanyMatch {
  company_id: string;
  company_name: string;
  match_score: number;
  available_budget: number;
  tags: string[];
  auto_accept: boolean;
  distance_km?: number;
}

/**
 * Distribute lead to best matching company
 */
export async function distributeLead(leadId: string): Promise<DistributionResult> {
  try {
    logger.info('Distributing lead', { module: 'leadDistributionApi', leadId });

    const { data, error } = await supabase
      .rpc('distribute_new_lead_v3', { lead_id_param: leadId });

    if (error) {
      throw new ApiError('distributeLead', error);
    }

    if (data && data.length > 0 && data[0].success) {
      return {
        success: true,
        companyId: data[0].company_id,
        cost: data[0].assignment_cost,
        message: 'Lead successfully assigned to company',
      };
    }

    return {
      success: false,
      message: 'No matching company found',
      fallbackReason: 'No companies available or match criteria',
    };
  } catch (error) {
    logger.error('Failed to distribute lead', { module: 'leadDistributionApi' }, error);
    throw new ApiError('distributeLead', error);
  }
}

/**
 * Find potential company matches for a lead
 */
export async function findCompanyMatches(
  leadId: string,
  criteria: DistributionCriteria
): Promise<CompanyMatch[]> {
  try {
    logger.info('Finding company matches', { module: 'leadDistributionApi', leadId, criteria });

    const { data, error } = await supabase
      .rpc('find_matching_companies', {
        lead_category: criteria.category,
        lead_location: criteria.location || null,
        min_budget: 500, // Default minimum budget
      });

    if (error) {
      throw new ApiError('findCompanyMatches', error);
    }

    return data || [];
  } catch (error) {
    logger.error('Failed to find company matches', { module: 'leadDistributionApi' }, error);
    throw new ApiError('findCompanyMatches', error);
  }
}

/**
 * Manual lead assignment by admin
 */
export async function manualLeadAssignment(
  leadId: string,
  companyId: string,
  cost: number
): Promise<DistributionResult> {
  try {
    logger.info('Manual lead assignment', { 
      module: 'leadDistributionApi', 
      leadId, 
      companyId, 
      cost 
    });

    const { data, error } = await supabase
      .rpc('assign_lead_with_budget', {
        p_lead_id: leadId,
        p_company_id: companyId,
      });

    if (error) {
      throw new ApiError('manualLeadAssignment', error);
    }

    if (data.success) {
      return {
        success: true,
        companyId,
        cost: data.cost,
        message: 'Lead manually assigned successfully',
      };
    }

    return {
      success: false,
      message: data.error || 'Manual assignment failed',
    };
  } catch (error) {
    logger.error('Failed to manually assign lead', { module: 'leadDistributionApi' }, error);
    throw new ApiError('manualLeadAssignment', error);
  }
}

/**
 * Get distribution statistics
 */
export async function fetchDistributionStats(dateRange?: {
  from: Date;
  to: Date;
}) {
  try {
    logger.info('Fetching distribution statistics', { module: 'leadDistributionApi', dateRange });

    const { data, error } = await supabase
      .rpc('get_lead_distribution_stats', {
        start_date: dateRange?.from?.toISOString() || null,
        end_date: dateRange?.to?.toISOString() || null,
      });

    if (error) {
      throw new ApiError('fetchDistributionStats', error);
    }

    return data;
  } catch (error) {
    logger.error('Failed to fetch distribution stats', { module: 'leadDistributionApi' }, error);
    throw new ApiError('fetchDistributionStats', error);
  }
}

/**
 * Process queued leads (for scheduled jobs)
 */
export async function processQueuedLeads(): Promise<{
  processed: number;
  successful: number;
  failed: number;
}> {
  try {
    logger.info('Processing queued leads', { module: 'leadDistributionApi' });

    const { data, error } = await supabase
      .rpc('process_queued_leads');

    if (error) {
      throw new ApiError('processQueuedLeads', error);
    }

    return data;
  } catch (error) {
    logger.error('Failed to process queued leads', { module: 'leadDistributionApi' }, error);
    throw new ApiError('processQueuedLeads', error);
  }
}

/**
 * Get fallback queue status
 */
export async function fetchFallbackQueue(): Promise<{
  total_queued: number;
  oldest_lead_age_hours: number;
  categories: Record<string, number>;
}> {
  try {
    logger.info('Fetching fallback queue status', { module: 'leadDistributionApi' });

    const { data, error } = await supabase
      .from('leads')
      .select('id, category, created_at')
      .is('company_id', null)
      .eq('status', 'new');

    if (error) {
      throw new ApiError('fetchFallbackQueue', error);
    }

    const now = new Date();
    const categories: Record<string, number> = {};
    let oldestLeadAge = 0;

    data.forEach(lead => {
      categories[lead.category] = (categories[lead.category] || 0) + 1;
      
      const leadAge = (now.getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60);
      if (leadAge > oldestLeadAge) {
        oldestLeadAge = leadAge;
      }
    });

    return {
      total_queued: data.length,
      oldest_lead_age_hours: Math.floor(oldestLeadAge),
      categories,
    };
  } catch (error) {
    logger.error('Failed to fetch fallback queue', { module: 'leadDistributionApi' }, error);
    throw new ApiError('fetchFallbackQueue', error);
  }
}

/**
 * Update distribution strategy settings
 */
export async function updateDistributionStrategy(
  strategy: 'roundRobin' | 'category_match' | 'budget_priority' | 'geographic',
  settings?: Record<string, any>
): Promise<boolean> {
  try {
    logger.info('Updating distribution strategy', { 
      module: 'leadDistributionApi', 
      strategy, 
      settings 
    });

    const { error } = await supabase
      .from('lead_settings')
      .upsert({
        id: 'global',
        strategy,
        filters: settings || {},
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new ApiError('updateDistributionStrategy', error);
    }

    return true;
  } catch (error) {
    logger.error('Failed to update distribution strategy', { module: 'leadDistributionApi' }, error);
    throw new ApiError('updateDistributionStrategy', error);
  }
}