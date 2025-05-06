
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadInsertTest } from '../tests/LeadInsertTest';
import { LeadStatusUpdateTest } from '../tests/LeadStatusUpdateTest';
import { LeadSettingsTest } from '../tests/components/LeadSettingsTest';

export const LeadTestPage = () => {
  const [activeTab, setActiveTab] = useState('insert');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Lead Test Page</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="insert">Insert Test</TabsTrigger>
          <TabsTrigger value="status">Status Update</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="insert" className="space-y-4">
          <LeadInsertTest />
        </TabsContent>
        
        <TabsContent value="status" className="space-y-4">
          <LeadStatusUpdateTest />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <LeadSettingsTest />
        </TabsContent>
      </Tabs>
    </div>
  );
};
