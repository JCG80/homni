import { supabase } from '@/lib/supabaseClient';
import { ApiError } from '@/utils/apiHelpers';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';
import { BudgetStatus, SpendingHistory, BudgetAlert, BudgetSettings } from '@/types/company-types';

/**
 * Company Billing API - Budget tracking and Stripe integration preparation
 */

/**
 * Get current budget status for company
 */
export async function fetchBudgetStatus(companyId: string): Promise<BudgetStatus> {
  try {
    logger.info('Fetching budget status', { module: 'companyBillingApi', companyId });

    const { data: profile, error } = await supabase
      .from('company_profiles')
      .select('current_budget, daily_budget, monthly_budget')
      .eq('id', companyId)
      .single();

    if (error) {
      throw new ApiError('fetchBudgetStatus', error);
    }

    // Calculate basic budget status from profile data
    const today = new Date();
    const nextReset = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    return {
      current_budget: profile.current_budget || 0,
      daily_budget: profile.daily_budget || 1000,
      monthly_budget: profile.monthly_budget || 30000,
      daily_spent: 0, // TODO: Calculate from transactions
      monthly_spent: 0, // TODO: Calculate from transactions
      remaining_daily: (profile.daily_budget || 1000) - 0,
      remaining_monthly: (profile.monthly_budget || 30000) - 0,
      is_budget_exceeded: (profile.current_budget || 0) <= 0,
      next_reset_date: nextReset.toISOString(),
    };
  } catch (error) {
    logger.error('Failed to fetch budget status', { module: 'companyBillingApi' }, error);
    throw new ApiError('fetchBudgetStatus', error);
  }
}

/**
 * Add budget to company account
 */
export async function addBudget(companyId: string, amount: number, description?: string): Promise<boolean> {
  try {
    logger.info('Adding budget', { module: 'companyBillingApi', companyId, amount });

    // Get current budget first
    const { data: profile } = await supabase
      .from('company_profiles')
      .select('current_budget')
      .eq('id', companyId)
      .single();

    const currentBudget = profile?.current_budget || 0;
    const newBalance = currentBudget + amount;

    const { error } = await supabase
      .from('company_budget_transactions')
      .insert({
        company_id: companyId,
        transaction_type: 'credit',
        amount: amount,
        balance_before: currentBudget,
        balance_after: newBalance,
        description: description || 'Budget added',
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw new ApiError('addBudget', error);
    }

    // Update current budget
    const { error: updateError } = await supabase
      .from('company_profiles')
      .update({
        current_budget: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId);

    if (updateError) {
      throw new ApiError('updateCurrentBudget', updateError);
    }

    toast({
      title: "Budsjett lagt til",
      description: `NOK ${amount.toLocaleString()} er lagt til kontoen din`,
    });

    return true;
  } catch (error) {
    logger.error('Failed to add budget', { module: 'companyBillingApi' }, error);
    toast({
      title: "Feil",
      description: "Kunne ikke legge til budsjett",
      variant: "destructive",
    });
    throw new ApiError('addBudget', error);
  }
}

/**
 * Get spending history for analysis
 */
export async function fetchSpendingHistory(
  companyId: string,
  days = 30
): Promise<SpendingHistory[]> {
  try {
    logger.info('Fetching spending history', { module: 'companyBillingApi', companyId, days });

    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const { data, error } = await supabase
      .from('company_budget_transactions')
      .select('created_at, amount, description')
      .eq('company_id', companyId)
      .eq('transaction_type', 'debit')
      .gte('created_at', dateLimit.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError('fetchSpendingHistory', error);
    }

    // Group by date and calculate totals
    const groupedData: { [key: string]: { amount: number; count: number } } = {};
    
    data?.forEach((transaction) => {
      const date = new Date(transaction.created_at).toISOString().split('T')[0];
      if (!groupedData[date]) {
        groupedData[date] = { amount: 0, count: 0 };
      }
      groupedData[date].amount += Math.abs(transaction.amount);
      groupedData[date].count += 1;
    });

    return Object.entries(groupedData).map(([date, stats]) => ({
      date,
      amount: stats.amount,
      lead_count: stats.count,
      average_cost: stats.count > 0 ? stats.amount / stats.count : 0,
    }));
  } catch (error) {
    logger.error('Failed to fetch spending history', { module: 'companyBillingApi' }, error);
    throw new ApiError('fetchSpendingHistory', error);
  }
}

/**
 * Get budget alerts for company
 */
export async function fetchBudgetAlerts(companyId: string): Promise<BudgetAlert[]> {
  try {
    logger.info('Fetching budget alerts', { module: 'companyBillingApi', companyId });

    // Generate alerts based on current budget status
    const budgetStatus = await fetchBudgetStatus(companyId);
    const alerts: BudgetAlert[] = [];

    if (budgetStatus.is_budget_exceeded) {
      alerts.push({
        id: `budget-exceeded-${companyId}`,
        type: 'budget_exceeded',
        message: 'Budsjettet er oppbrukt. Legg til mer budsjett for å motta leads.',
        threshold: 0,
        current_value: budgetStatus.current_budget,
        created_at: new Date().toISOString(),
      });
    } else if (budgetStatus.current_budget <= 100) {
      alerts.push({
        id: `low-budget-${companyId}`,
        type: 'low_budget',
        message: 'Lavt budsjett. Vurder å legge til mer budsjett snart.',
        threshold: 100,
        current_value: budgetStatus.current_budget,
        created_at: new Date().toISOString(),
      });
    }

    return alerts;
  } catch (error) {
    logger.error('Failed to fetch budget alerts', { module: 'companyBillingApi' }, error);
    throw new ApiError('fetchBudgetAlerts', error);
  }
}

/**
 * Update budget settings
 */
export async function updateBudgetSettings(
  companyId: string,
  settings: BudgetSettings
): Promise<boolean> {
  try {
    logger.info('Updating budget settings', { module: 'companyBillingApi', companyId, settings });

    const { error } = await supabase
      .from('company_profiles')
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId);

    if (error) {
      throw new ApiError('updateBudgetSettings', error);
    }

    toast({
      title: "Innstillinger oppdatert",
      description: "Budsjettinnstillingene er oppdatert",
    });

    return true;
  } catch (error) {
    logger.error('Failed to update budget settings', { module: 'companyBillingApi' }, error);
    toast({
      title: "Feil",
      description: "Kunne ikke oppdatere innstillinger",
      variant: "destructive",
    });
    throw new ApiError('updateBudgetSettings', error);
  }
}

/**
 * Check if company can afford lead purchase
 */
export async function checkBudgetAvailability(
  companyId: string,
  leadCost: number
): Promise<{ canAfford: boolean; reason?: string }> {
  try {
    logger.info('Checking budget availability', { module: 'companyBillingApi', companyId, leadCost });

    const { data: profile, error } = await supabase
      .from('company_profiles')
      .select('current_budget, daily_budget')
      .eq('id', companyId)
      .single();

    if (error) {
      throw new ApiError('checkBudgetAvailability', error);
    }

    const currentBudget = profile.current_budget || 0;
    
    if (currentBudget < leadCost) {
      return {
        canAfford: false,
        reason: `Insufficient budget. Current: ${currentBudget}, Required: ${leadCost}`
      };
    }

    return { canAfford: true };
  } catch (error) {
    logger.error('Failed to check budget availability', { module: 'companyBillingApi' }, error);
    throw new ApiError('checkBudgetAvailability', error);
  }
}

/**
 * Prepare Stripe integration data
 */
export async function prepareStripeIntegration(companyId: string) {
  try {
    logger.info('Preparing Stripe integration', { module: 'companyBillingApi', companyId });

    const { data: company, error } = await supabase
      .from('company_profiles')
      .select('name, email, phone, metadata')
      .eq('id', companyId)
      .single();

    if (error) {
      throw new ApiError('prepareStripeIntegration', error);
    }

    return {
      companyName: company.name,
      email: company.email,
      phone: company.phone,
      stripeCustomerId: (company.metadata as any)?.stripe_customer_id,
      subscriptionId: (company.metadata as any)?.stripe_subscription_id,
    };
  } catch (error) {
    logger.error('Failed to prepare Stripe integration', { module: 'companyBillingApi' }, error);
    throw new ApiError('prepareStripeIntegration', error);
  }
}