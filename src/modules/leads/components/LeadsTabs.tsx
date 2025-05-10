
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadsTable } from './LeadsTable';
import { InsuranceLeadsTab } from './tabs/InsuranceLeadsTab';

export const LeadsTabs = () => {
  return (
    <Tabs defaultValue="all">
      <TabsList className="mb-4">
        <TabsTrigger value="all">Alle leads</TabsTrigger>
        <TabsTrigger value="insurance">Forsikrings-leads</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all">
        <LeadsTable />
      </TabsContent>
      
      <TabsContent value="insurance">
        <InsuranceLeadsTab />
      </TabsContent>
    </Tabs>
  );
};
