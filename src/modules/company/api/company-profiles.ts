import { supabase } from '@/lib/supabaseClient';
import { ApiError, dedupeByKey } from '@/utils/apiHelpers';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import type { CompanyProfile } from '@/types/leads-canonical';

/**
 * Company Profile API - CRUD operations and budget management
 */

export interface CompanyProfileData {
  name: string;
  email?: string;
  phone?: string;
  industry?: string;
  tags?: string[];
  contact_name?: string;
  status?: 'active' | 'inactive' | 'suspended';
  subscription_plan?: 'free' | 'basic' | 'premium';
  daily_budget?: number;
  monthly_budget?: number;
  current_budget?: number;
  auto_accept_leads?: boolean;
  lead_cost_per_unit?: number;
  budget_alerts_enabled?: boolean;
  low_budget_threshold?: number;
}

export interface BudgetUpdateData {
  daily_budget?: number;
  monthly_budget?: number;
  current_budget?: number;
  auto_accept_leads?: boolean;
  lead_cost_per_unit?: number;
}

/**
 * Fetch company profile by user ID
 */
export async function fetchCompanyProfile(userId?: string): Promise<CompanyProfile | null> {
  try {
    logger.info('Fetching company profile', { module: 'companyProfilesApi', userId });

    let targetUserId = userId;
    if (!targetUserId) {
      const { data: user } = await supabase.auth.getUser();
      targetUserId = user.user?.id;
    }

    if (!targetUserId) {
      return null;
    }

    const { data, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApiError('fetchCompanyProfile', error);
    }

    return data ? {
      ...data,
      metadata: (typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata) || {},
      notification_preferences: (typeof data.notification_preferences === 'string' ? JSON.parse(data.notification_preferences) : data.notification_preferences) || {},
      ui_preferences: (typeof data.ui_preferences === 'string' ? JSON.parse(data.ui_preferences) : data.ui_preferences) || {},
      feature_overrides: (typeof data.feature_overrides === 'string' ? JSON.parse(data.feature_overrides) : data.feature_overrides) || {}
    } : null;
  } catch (error) {
    logger.error('Failed to fetch company profile', { module: 'companyProfilesApi' }, error);
    throw new ApiError('fetchCompanyProfile', error);
  }
}

/**
 * Create or update company profile
 */
export async function upsertCompanyProfile(profileData: CompanyProfileData): Promise<CompanyProfile> {
  try {
    logger.info('Upserting company profile', { module: 'companyProfilesApi' });

    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.id) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('company_profiles')
      .upsert({
        user_id: user.user.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new ApiError('upsertCompanyProfile', error);
    }

    toast({
      title: "Profil oppdatert",
      description: "Bedriftsprofilen din er oppdatert",
    });

    return {
      ...data,
      metadata: (typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata) || {},
      notification_preferences: (typeof data.notification_preferences === 'string' ? JSON.parse(data.notification_preferences) : data.notification_preferences) || {},
      ui_preferences: (typeof data.ui_preferences === 'string' ? JSON.parse(data.ui_preferences) : data.ui_preferences) || {},
      feature_overrides: (typeof data.feature_overrides === 'string' ? JSON.parse(data.feature_overrides) : data.feature_overrides) || {}
    };
  } catch (error) {
    logger.error('Failed to upsert company profile', { module: 'companyProfilesApi' }, error);
    toast({
      title: "Feil",
      description: "Kunne ikke oppdatere bedriftsprofil",
      variant: "destructive",
    });
    throw new ApiError('upsertCompanyProfile', error);
  }
}

/**
 * Update company budget settings
 */
export async function updateCompanyBudget(budgetData: BudgetUpdateData): Promise<boolean> {
  try {
    logger.info('Updating company budget', { module: 'companyProfilesApi', budgetData });

    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.id) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('company_profiles')
      .update({
        ...budgetData,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.user.id);

    if (error) {
      throw new ApiError('updateCompanyBudget', error);
    }

    toast({
      title: "Budsjett oppdatert",
      description: "Budsjettinnstillingene er oppdatert",
    });

    return true;
  } catch (error) {
    logger.error('Failed to update company budget', { module: 'companyProfilesApi' }, error);
    toast({
      title: "Feil",
      description: "Kunne ikke oppdatere budsjett",
      variant: "destructive",
    });
    throw new ApiError('updateCompanyBudget', error);
  }
}

/**
 * Fetch company budget transactions
 */
export async function fetchBudgetTransactions(companyId: string, limit = 50) {
  try {
    logger.info('Fetching budget transactions', { module: 'companyProfilesApi', companyId });

    const { data, error } = await supabase
      .from('company_budget_transactions')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new ApiError('fetchBudgetTransactions', error);
    }

    return dedupeByKey(data || [], 'id');
  } catch (error) {
    logger.error('Failed to fetch budget transactions', { module: 'companyProfilesApi' }, error);
    throw new ApiError('fetchBudgetTransactions', error);
  }
}

/**
 * Get company statistics (using existing data)
 */
export async function fetchCompanyStats(companyId: string) {
  try {
    logger.info('Fetching company statistics', { module: 'companyProfilesApi', companyId });

    // Query existing tables for basic stats
    const [leadsData, transactionsData] = await Promise.all([
      supabase
        .from('leads')
        .select('id, status, created_at')
        .eq('company_id', companyId),
      supabase
        .from('company_budget_transactions')
        .select('amount, transaction_type')
        .eq('company_id', companyId)
    ]);

    const leads = leadsData.data || [];
    const transactions = transactionsData.data || [];

    return {
      total_leads: leads.length,
      active_leads: leads.filter(l => ['new', 'qualified', 'contacted'].includes(l.status)).length,
      completed_leads: leads.filter(l => l.status === 'converted').length,
      total_spent: transactions
        .filter(t => t.transaction_type === 'debit')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      success_rate: leads.length > 0 
        ? (leads.filter(l => l.status === 'converted').length / leads.length) * 100 
        : 0
    };
  } catch (error) {
    logger.error('Failed to fetch company stats', { module: 'companyProfilesApi' }, error);
    throw new ApiError('fetchCompanyStats', error);
  }
}