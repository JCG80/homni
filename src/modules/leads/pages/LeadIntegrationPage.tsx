import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebhookManager } from '../components/integration/WebhookManager';
import { LeadExporter } from '../components/integration/LeadExporter';
import { BulkLeadImporter } from '../components/integration/BulkLeadImporter';

export const LeadIntegrationPage = () => {
  const [activeTab, setActiveTab] = useState('webhooks');

  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
      <Helmet>
        <title>Lead Integration – Homni</title>
        <meta name="description" content="Integrer eksterne systemer med Homni's lead management system" />
        <link rel="canonical" href="/leads/integration" />
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Lead Integration</h1>
        <p className="text-muted-foreground mt-2">
          Administrer eksterne integrasjoner, eksporter data og importer leads i bulk
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="export">Eksporter</TabsTrigger>
          <TabsTrigger value="import">Importer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="webhooks">
          <WebhookManager />
        </TabsContent>
        
        <TabsContent value="export">
          <LeadExporter />
        </TabsContent>
        
        <TabsContent value="import">
          <BulkLeadImporter />
        </TabsContent>
      </Tabs>
    </div>
  );
};