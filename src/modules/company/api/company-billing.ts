import { supabase } from '@/lib/supabaseClient';
import { ApiError } from '@/utils/apiHelpers';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

/**
 * Company Billing API - Budget tracking and Stripe integration preparation
 */

export interface BudgetStatus {
  current_budget: number;
  daily_budget: number;
  monthly_budget: number;
  daily_spent: number;
  monthly_spent: number;
  remaining_daily: number;
  remaining_monthly: number;
  is_budget_exceeded: boolean;
  next_reset_date: string;
}

export interface SpendingHistory {
  date: string;
  amount: number;
  lead_count: number;
  average_cost: number;
}

export interface BudgetAlert {
  id: string;
  type: 'low_budget' | 'budget_exceeded' | 'high_spending';
  message: string;
  threshold: number;
  current_value: number;
  created_at: string;
}

/**
 * Get current budget status for company
 */
export async function fetchBudgetStatus(companyId: string): Promise<BudgetStatus> {
  try {
    logger.info('Fetching budget status', { module: 'companyBillingApi', companyId });

    const { data, error } = await supabase
      .rpc('get_company_budget_status', { company_id_param: companyId });

    if (error) {
      throw new ApiError('fetchBudgetStatus', error);
    }

    return data;
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

    const { error } = await supabase
      .from('company_budget_transactions')
      .insert({
        company_id: companyId,
        transaction_type: 'credit',
        amount: amount,
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
        current_budget: supabase.sql`current_budget + ${amount}`,
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

    const { data, error } = await supabase
      .rpc('get_company_spending_history', {
        company_id_param: companyId,
        days_param: days
      });

    if (error) {
      throw new ApiError('fetchSpendingHistory', error);
    }

    return data || [];
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

    const { data, error } = await supabase
      .from('company_budget_alerts')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError('fetchBudgetAlerts', error);
    }

    return data || [];
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
  settings: {
    daily_budget?: number;
    monthly_budget?: number;
    auto_accept_leads?: boolean;
    budget_alerts_enabled?: boolean;
    low_budget_threshold?: number;
  }
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

    const { data, error } = await supabase
      .rpc('check_company_budget_availability', {
        company_id_param: companyId,
        lead_cost_param: leadCost
      });

    if (error) {
      throw new ApiError('checkBudgetAvailability', error);
    }

    return data;
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
      stripeCustomerId: company.metadata?.stripe_customer_id,
      subscriptionId: company.metadata?.stripe_subscription_id,
    };
  } catch (error) {
    logger.error('Failed to prepare Stripe integration', { module: 'companyBillingApi' }, error);
    throw new ApiError('prepareStripeIntegration', error);
  }
}