
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CompanyProfile } from '@/modules/admin/types/types';
import { PurchasesTab } from './companyDetails/PurchasesTab';
import { StatisticsTab } from './companyDetails/StatisticsTab';
import { NotesTab } from './companyDetails/NotesTab';
import { CompanyHeader } from './companyDetails/CompanyHeader';
import { ModuleAccessTab } from './companyDetails/ModuleAccessTab';
import { BudgetManagementTab } from './companyDetails/BudgetManagementTab';
import { ErrorState } from './companyDetails/ErrorState';
import { useCompanyDetails } from '@/modules/admin/hooks/useCompanyDetails';

interface CompanyDetailViewProps {
  company: CompanyProfile;
  onClose: () => void;
  onUpdate: () => void;
}

export function CompanyDetailView({ company, onClose, onUpdate }: CompanyDetailViewProps) {
  const [activeTab, setActiveTab] = useState('budget');
  // Initialize notes from company admin_notes if available, otherwise empty string
  const initialNotes = company.admin_notes || '';
  
  const [notes, setNotes] = useState(initialNotes);
  
  const { 
    companyData, 
    purchases, 
    stats, 
    isLoading, 
    isLoadingPurchases, 
    isLoadingStats, 
    companyError, 
    handleRetry 
  } = useCompanyDetails(company, setNotes);

  // Display error state if there's an error
  if (companyError) {
    return (
      <ErrorState 
        message={`Kunne ikke laste bedriftsdata: ${companyError instanceof Error ? companyError.message : 'Ukjent feil'}`} 
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="space-y-4">
      <CompanyHeader company={company} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="budget">Budsjett</TabsTrigger>
          <TabsTrigger value="purchases">Kjøpshistorikk</TabsTrigger>
          <TabsTrigger value="statistics">Konverteringsstatistikk</TabsTrigger>
          <TabsTrigger value="notes">Interne notater</TabsTrigger>
          <TabsTrigger value="access">Modultilgang</TabsTrigger>
        </TabsList>
        
        <TabsContent value="budget">
          <BudgetManagementTab 
            company={company}
            onUpdate={onUpdate}
          />
        </TabsContent>
        
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
            isLoading={isLoading} 
            onUpdate={onUpdate} 
          />
        </TabsContent>
        
        <TabsContent value="access">
          <ModuleAccessTab 
            company={company}
            isLoading={isLoading}
            onUpdate={onUpdate}
          />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end mt-6">
        <Button variant="outline" onClick={onClose}>Lukk</Button>
      </div>
    </div>
  );
}
