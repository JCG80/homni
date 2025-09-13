import { supabase } from '@/lib/supabaseClient';
import { ApiError, dedupeByKey } from '@/utils/apiHelpers';
import { toast } from '@/components/ui/use-toast';
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

    const { data, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', userId || supabase.auth.getUser().then(u => u.data.user?.id))
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApiError('fetchCompanyProfile', error);
    }

    return data;
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

    return data;
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
 * Get company statistics
 */
export async function fetchCompanyStats(companyId: string) {
  try {
    logger.info('Fetching company statistics', { module: 'companyProfilesApi', companyId });

    const { data, error } = await supabase
      .rpc('get_company_lead_stats', { company_id_param: companyId });

    if (error) {
      throw new ApiError('fetchCompanyStats', error);
    }

    return data;
  } catch (error) {
    logger.error('Failed to fetch company stats', { module: 'companyProfilesApi' }, error);
    throw new ApiError('fetchCompanyStats', error);
  }
}