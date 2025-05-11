
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CompanyProfile } from '../types/types';

type CompanyStats = {
  leadsWonPercentage?: number;
  avgResponseTime?: string;
  customerRating?: number;
  monthlyTrend?: string;
};

type Purchase = {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
};

export function useCompanyDetails(
  company: CompanyProfile, 
  setNotes: (notes: string) => void
) {
  // Fetch company's purchase history
  const { 
    data: purchases = [], 
    isLoading: isLoadingPurchases,
    refetch: refetchPurchases
  } = useQuery({
    queryKey: ['company-purchases', company.id],
    queryFn: async () => {
      // This would be populated from a real purchases table
      // For demonstration, returning mock data
      return [
        { 
          id: '1', 
          type: 'lead', 
          amount: 1500, 
          date: new Date().toISOString(), 
          description: 'Kjøp av 5 leads innen kategori: Bolig' 
        },
        { 
          id: '2', 
          type: 'ad', 
          amount: 3000, 
          date: new Date(Date.now() - 86400000).toISOString(), 
          description: 'Kjøp av 10 annonsevisninger i 30 dager' 
        }
      ] as Purchase[];
    }
  });
  
  // Fetch company's statistics
  const { 
    data: stats = {}, 
    isLoading: isLoadingStats,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['company-stats', company.id],
    queryFn: async () => {
      // This would be calculated from real data
      // For demonstration, returning mock data that matches our type
      return {
        leadsWonPercentage: 65,
        avgResponseTime: '2.5 timer',
        customerRating: 4.2,
        monthlyTrend: 'increasing'
      } as CompanyStats;
    }
  });
  
  // Fetch company's notes and module access
  const { 
    data: companyData,
    isLoading,
    error: companyError,
    refetch: refetchCompanyData
  } = useQuery({
    queryKey: ['company-details', company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('id', company.id)
        .single();
      
      if (error) throw error;
      
      // Set the notes if available
      if (data?.metadata?.admin_notes) {
        setNotes(data.metadata.admin_notes);
      }
      
      return data as CompanyProfile;
    }
  });

  // Handle error retry
  const handleRetry = () => {
    refetchCompanyData();
    refetchPurchases();
    refetchStats();
  };

  return {
    companyData,
    purchases,
    stats,
    isLoading,
    isLoadingPurchases,
    isLoadingStats,
    companyError,
    handleRetry
  };
}
