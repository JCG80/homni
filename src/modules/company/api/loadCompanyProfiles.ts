
import { supabase } from '@/lib/supabaseClient';
import { CompanyProfile } from '@/types/leads-canonical';
import { parseCompanyProfile } from '../utils/parseCompanyProfile';

export async function loadCompanyProfiles(): Promise<CompanyProfile[]> {
  const { data, error } = await supabase
    .from('company_profiles')
    .select('*');

  if (error || !data) {
    console.error('Failed to load company profiles:', error);
    return [];
  }

  return data.map(item => parseCompanyProfile(item));
}
