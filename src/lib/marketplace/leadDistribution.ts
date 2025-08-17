import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LeadDistributionOptions {
  leadId: string;
  strategy?: 'auto' | 'manual';
  preferredBuyers?: string[];
}

export interface DistributionResult {
  success: boolean;
  buyerId?: string;
  assignmentId?: string;
  cost?: number;
  error?: string;
}

/**
 * Distribute a lead to eligible buyers using the automated system
 */
export async function distributeLeadToBuyer(options: LeadDistributionOptions): Promise<DistributionResult> {
  try {
    const { data, error } = await supabase.rpc('distribute_new_lead', {
      lead_id_param: options.leadId
    });

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'No eligible buyers found for this lead'
      };
    }

    const result = data[0];
    return {
      success: true,
      buyerId: result.buyer_id,
      assignmentId: result.assignment_id,
      cost: result.cost
    };
  } catch (error: any) {
    console.error('Lead distribution failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to distribute lead'
    };
  }
}

/**
 * Get distribution statistics for leads
 */
export async function getDistributionStats(dateRange?: { from: Date; to: Date }) {
  try {
    let query = supabase
      .from('lead_assignments')
      .select(`
        *,
        leads (title, category),
        buyer_accounts (company_name)
      `)
      .order('assigned_at', { ascending: false });

    if (dateRange) {
      query = query
        .gte('assigned_at', dateRange.from.toISOString())
        .lte('assigned_at', dateRange.to.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      totalAssignments: data?.length || 0,
      totalRevenue: data?.reduce((sum, assignment) => sum + (assignment.cost || 0), 0) || 0,
      assignmentsByStatus: {
        assigned: data?.filter(a => a.status === 'assigned').length || 0,
        accepted: data?.filter(a => a.status === 'accepted').length || 0,
        rejected: data?.filter(a => a.status === 'rejected').length || 0,
        expired: data?.filter(a => a.status === 'expired').length || 0
      }
    };
  } catch (error: any) {
    console.error('Failed to get distribution stats:', error);
    throw error;
  }
}

/**
 * Auto-distribute new leads based on lead settings
 */
export async function processNewLeadDistribution(leadId: string) {
  try {
    // Check if auto-distribution is enabled
    const { data: settings } = await supabase
      .from('lead_settings')
      .select('auto_distribute, globally_paused')
      .single();

    if (!settings?.auto_distribute || settings.globally_paused) {
      console.log('Auto-distribution is disabled or paused');
      return null;
    }

    // Distribute the lead
    const result = await distributeLeadToBuyer({
      leadId,
      strategy: 'auto'
    });

    if (result.success) {
      toast.success(`Lead distributed to buyer for NOK ${result.cost}`);
    } else {
      console.warn('Lead distribution failed:', result.error);
    }

    return result;
  } catch (error: any) {
    console.error('Auto-distribution process failed:', error);
    toast.error('Failed to auto-distribute lead');
    return null;
  }
}

/**
 * Get buyer eligibility for a specific lead
 */
export async function getBuyerEligibility(leadId: string) {
  try {
    const { data: lead } = await supabase
      .from('leads')
      .select('category')
      .eq('id', leadId)
      .single();

    if (!lead) throw new Error('Lead not found');

    // Get active packages
    const { data: packages } = await supabase
      .from('lead_packages')
      .select(`
        *,
        buyer_package_subscriptions (
          buyer_id,
          status,
          buyer_accounts (
            company_name,
            current_budget,
            daily_budget,
            pause_when_budget_exceeded
          )
        )
      `)
      .eq('is_active', true);

    if (!packages) return [];

    // Calculate eligible buyers
    const eligibleBuyers = packages.flatMap(pkg => 
      pkg.buyer_package_subscriptions
        ?.filter(sub => 
          sub.status === 'active' && 
          sub.buyer_accounts &&
          !sub.buyer_accounts.pause_when_budget_exceeded &&
          (sub.buyer_accounts.current_budget || 0) >= pkg.price_per_lead
        )
        .map(sub => ({
          buyerId: sub.buyer_id,
          companyName: sub.buyer_accounts?.company_name,
          packageName: pkg.name,
          cost: pkg.price_per_lead,
          currentBudget: sub.buyer_accounts?.current_budget
        })) || []
    );

    return eligibleBuyers;
  } catch (error: any) {
    console.error('Failed to get buyer eligibility:', error);
    throw error;
  }
}