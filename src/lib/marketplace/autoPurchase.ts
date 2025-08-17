import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export interface AutoPurchaseOptions {
  leadId: string;
  packageId: string;
  buyerId: string;
  cost: number;
}

export interface AutoPurchaseResult {
  success: boolean;
  assignmentId?: string;
  error?: string;
  budgetExceeded?: boolean;
  capExceeded?: boolean;
}

/**
 * Check if a buyer is eligible for auto-purchase based on their subscription settings
 */
export async function checkAutoPurchaseEligibility(
  buyerId: string, 
  packageId: string, 
  cost: number
): Promise<{ eligible: boolean; reason?: string }> {
  try {
    // Get buyer account and subscription details
    const { data: subscription, error: subError } = await supabase
      .from('buyer_package_subscriptions')
      .select(`
        *,
        buyer_accounts (
          current_budget,
          daily_budget,
          monthly_budget,
          pause_when_budget_exceeded
        )
      `)
      .eq('buyer_id', buyerId)
      .eq('package_id', packageId)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      return { eligible: false, reason: 'No active subscription found' };
    }

    if (!subscription.auto_buy) {
      return { eligible: false, reason: 'Auto-buy is disabled' };
    }

    const buyerAccount = subscription.buyer_accounts;
    if (!buyerAccount) {
      return { eligible: false, reason: 'Buyer account not found' };
    }

    // Check if account is paused
    if (buyerAccount.pause_when_budget_exceeded) {
      return { eligible: false, reason: 'Account is paused' };
    }

    // Check current budget
    if ((buyerAccount.current_budget || 0) < cost) {
      return { eligible: false, reason: 'Insufficient budget' };
    }

    // Check daily spending cap
    if (subscription.daily_cap_cents) {
      const dailySpent = await getDailySpending(buyerId);
      if (dailySpent + (cost * 100) > subscription.daily_cap_cents) {
        return { eligible: false, reason: 'Daily spending cap exceeded' };
      }
    }

    // Check monthly spending cap
    if (subscription.monthly_cap_cents) {
      const monthlySpent = await getMonthlySpending(buyerId);
      if (monthlySpent + (cost * 100) > subscription.monthly_cap_cents) {
        return { eligible: false, reason: 'Monthly spending cap exceeded' };
      }
    }

    // Check account-level daily budget
    if (buyerAccount.daily_budget) {
      const dailySpent = await getDailySpending(buyerId);
      if (dailySpent + (cost * 100) > (buyerAccount.daily_budget * 100)) {
        return { eligible: false, reason: 'Account daily budget exceeded' };
      }
    }

    // Check account-level monthly budget
    if (buyerAccount.monthly_budget) {
      const monthlySpent = await getMonthlySpending(buyerId);
      if (monthlySpent + (cost * 100) > (buyerAccount.monthly_budget * 100)) {
        return { eligible: false, reason: 'Account monthly budget exceeded' };
      }
    }

    return { eligible: true };
  } catch (error: any) {
    console.error('Error checking auto-purchase eligibility:', error);
    return { eligible: false, reason: 'System error during eligibility check' };
  }
}

/**
 * Execute auto-purchase for a lead
 */
export async function executeAutoPurchase(options: AutoPurchaseOptions): Promise<AutoPurchaseResult> {
  const { leadId, packageId, buyerId, cost } = options;

  try {
    // First check eligibility
    const eligibility = await checkAutoPurchaseEligibility(buyerId, packageId, cost);
    if (!eligibility.eligible) {
      return {
        success: false,
        error: eligibility.reason,
        budgetExceeded: eligibility.reason?.includes('budget') || eligibility.reason?.includes('cap'),
        capExceeded: eligibility.reason?.includes('cap')
      };
    }

    // Use database transaction to ensure consistency
    const { data: result, error } = await supabase.rpc('execute_auto_purchase', {
      p_lead_id: leadId,
      p_buyer_id: buyerId,
      p_package_id: packageId,
      p_cost: cost
    });

    if (error) {
      console.error('Auto-purchase database error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    if (!result || result.length === 0) {
      return {
        success: false,
        error: 'Auto-purchase failed - no assignment created'
      };
    }

    const assignment = result[0];
    
    // Log the successful auto-purchase
    console.log(`Auto-purchase successful: Lead ${leadId} assigned to buyer ${buyerId} for NOK ${cost}`);
    
    return {
      success: true,
      assignmentId: assignment.assignment_id
    };

  } catch (error: any) {
    console.error('Auto-purchase execution error:', error);
    return {
      success: false,
      error: error.message || 'Failed to execute auto-purchase'
    };
  }
}

/**
 * Get daily spending for a buyer (in cents)
 */
async function getDailySpending(buyerId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data, error } = await supabase
    .from('buyer_spend_ledger')
    .select('amount')
    .eq('buyer_id', buyerId)
    .gte('created_at', today.toISOString())
    .eq('transaction_type', 'lead_purchase');

  if (error) {
    console.error('Error fetching daily spending:', error);
    return 0;
  }

  return data?.reduce((sum, record) => sum + Math.abs(record.amount * 100), 0) || 0;
}

/**
 * Get monthly spending for a buyer (in cents)
 */
async function getMonthlySpending(buyerId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const { data, error } = await supabase
    .from('buyer_spend_ledger')
    .select('amount')
    .eq('buyer_id', buyerId)
    .gte('created_at', startOfMonth.toISOString())
    .eq('transaction_type', 'lead_purchase');

  if (error) {
    console.error('Error fetching monthly spending:', error);
    return 0;
  }

  return data?.reduce((sum, record) => sum + Math.abs(record.amount * 100), 0) || 0;
}

/**
 * Process auto-purchases for multiple eligible buyers
 */
export async function processMultipleAutoPurchases(
  leadId: string,
  eligibleBuyers: Array<{ buyerId: string; packageId: string; cost: number }>
): Promise<AutoPurchaseResult[]> {
  const results: AutoPurchaseResult[] = [];

  // Process purchases sequentially to avoid race conditions
  for (const buyer of eligibleBuyers) {
    const result = await executeAutoPurchase({
      leadId,
      packageId: buyer.packageId,
      buyerId: buyer.buyerId,
      cost: buyer.cost
    });
    
    results.push(result);
    
    // If we successfully assigned the lead, we can stop processing
    if (result.success) {
      break;
    }
  }

  return results;
}

/**
 * Get auto-purchase statistics for a buyer
 */
export async function getAutoPurchaseStats(buyerId: string, dateRange?: { from: Date; to: Date }) {
  try {
    let query = supabase
      .from('lead_assignments')
      .select('*')
      .eq('buyer_id', buyerId)
      .not('auto_purchased_at', 'is', null); // Only auto-purchased leads

    if (dateRange) {
      query = query
        .gte('assigned_at', dateRange.from.toISOString())
        .lte('assigned_at', dateRange.to.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      totalAutoPurchases: data?.length || 0,
      totalSpent: data?.reduce((sum, assignment) => sum + (assignment.cost || 0), 0) || 0,
      averageCost: data?.length ? (data.reduce((sum, assignment) => sum + (assignment.cost || 0), 0) / data.length) : 0
    };
  } catch (error: any) {
    console.error('Failed to get auto-purchase stats:', error);
    throw error;
  }
}