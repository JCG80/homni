
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadsTable } from './LeadsTable';
import { InsuranceLeadsTab } from './tabs/InsuranceLeadsTab';
import { useLeadsList } from '../hooks/useLeads';
import { Lead } from '@/types/leads';

export const LeadsTabs = () => {
  // Create empty leads array as a fallback
  const emptyLeads: Lead[] = [];
  
  return (
    <Tabs defaultValue="all">
      <TabsList className="mb-4">
        <TabsTrigger value="all">Alle leads</TabsTrigger>
        <TabsTrigger value="insurance">Forsikrings-leads</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all">
        <LeadsTable leads={emptyLeads} />
      </TabsContent>
      
      <TabsContent value="insurance">
        <InsuranceLeadsTab />
      </TabsContent>
    </Tabs>
  );
};
