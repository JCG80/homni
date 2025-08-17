
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CompanyProfile } from '../types/types';

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match the Company interface
      return (data as any[]).map(company => ({
        ...company,
        email: company.email || (company.accounts as any)?.email || 'Ikke angitt',
        leads_bought: 0, // These would be calculated from lead statistics
        leads_won: 0,
        leads_lost: 0,
        ads_bought: 0,
        metadata: company.metadata || {}
      })) as CompanyProfile[];
    }
  });
}
