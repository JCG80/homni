
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from 'lucide-react';
import { CompanyProfile } from '../types/types';
import { PurchasesTab } from './companyDetails/PurchasesTab';
import { StatisticsTab } from './companyDetails/StatisticsTab';
import { NotesTab } from './companyDetails/NotesTab';
import { CompanyHeader } from './companyDetails/CompanyHeader';
import { ErrorState } from './companyDetails/ErrorState';
import { ModuleAccessManager } from './ModuleAccessManager';

interface CompanyDetailViewProps {
  company: CompanyProfile;
  onClose: () => void;
  onUpdate: () => void;
}

export function CompanyDetailView({ company, onClose, onUpdate }: CompanyDetailViewProps) {
  const [activeTab, setActiveTab] = useState('purchases');
  const [notes, setNotes] = useState('');
  
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
      ];
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
      };
    }
  });
  
  // Fetch company's notes and module access
  const { 
    data: companyData,
    isLoading: isLoadingCompany,
    error: companyError,
    refetch: refetchCompanyData
  } = useQuery({
    queryKey: ['company-details', company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from<CompanyProfile>('company_profiles')
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

  // Display error state if there's an error
  if (companyError) {
    return (
      <ErrorState 
        message={`Kunne ikke laste bedriftsdata: ${companyError instanceof Error ? companyError.message : 'Ukjent feil'}`} 
        onRetry={handleRetry}
      />
    );
  }

  // Display loading state if data is loading
  if (isLoadingCompany && !companyData) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="h-8 w-8 animate-spin" />
        <span className="ml-2">Laster bedriftsdata...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CompanyHeader company={company} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="purchases">Kjøpshistorikk</TabsTrigger>
          <TabsTrigger value="statistics">Konverteringsstatistikk</TabsTrigger>
          <TabsTrigger value="notes">Interne notater</TabsTrigger>
          <TabsTrigger value="access">Modultilgang</TabsTrigger>
        </TabsList>
        
        <TabsContent value="purchases">
          <PurchasesTab 
            purchases={purchases} 
            isLoading={isLoadingPurchases} 
          />
        </TabsContent>
        
        <TabsContent value="statistics">
          <StatisticsTab 
            company={company} 
            stats={stats} 
            isLoading={isLoadingStats} 
          />
        </TabsContent>
        
        <TabsContent value="notes">
          <NotesTab 
            company={company} 
            notes={notes} 
            setNotes={setNotes} 
            isLoading={isLoadingCompany} 
            onUpdate={onUpdate} 
          />
        </TabsContent>
        
        <TabsContent value="access">
          {isLoadingCompany ? (
            <div className="flex justify-center py-8">
              <Loader className="h-6 w-6 animate-spin" />
              <span className="ml-2">Laster modultilgang...</span>
            </div>
          ) : company.user_id ? (
            <ModuleAccessManager 
              userId={company.user_id} 
              onUpdate={onUpdate}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Ingen bruker tilknyttet denne bedriften.
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end mt-6">
        <Button variant="outline" onClick={onClose}>Lukk</Button>
      </div>
    </div>
  );
}
