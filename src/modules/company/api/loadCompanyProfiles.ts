
import { supabase } from '@/lib/supabaseClient';
import { CompanyProfile } from '@/types/leads-canonical';
import { parseCompanyProfile } from '../utils/parseCompanyProfile';
import { logger } from '@/utils/logger';

export async function loadCompanyProfiles(): Promise<CompanyProfile[]> {
  const { data, error } = await supabase
    .from('company_profiles')
    .select('*');

  if (error || !data) {
    logger.error('Failed to load company profiles:', {
      module: 'loadCompanyProfiles'
    }, error || new Error('No data returned'));
    return [];
  }

  return data.map(item => parseCompanyProfile(item));
}
