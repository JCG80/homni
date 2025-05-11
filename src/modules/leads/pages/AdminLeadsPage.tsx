
import React from 'react';
import { LeadsTable } from '../components/LeadsTable';
import { useLeads } from '../hooks/useLeads';
import { LeadsFilterBar } from '../components/LeadsFilterBar';
import { LeadsTabs } from '../components/LeadsTabs';
import { AdminNavigation } from '@/modules/admin/components/AdminNavigation';

export const AdminLeadsPage: React.FC = () => {
  const { leads, isLoading, error, refresh } = useLeads();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin: Leads</h1>
      
      <AdminNavigation />
      
      <LeadsTabs activeTab="all" />
      
      <div className="my-6">
        <LeadsFilterBar />
      </div>
      
      <LeadsTable 
        leads={leads} 
        isLoading={isLoading} 
        error={error} 
        onRefresh={refresh}
      />
    </div>
  );
};
