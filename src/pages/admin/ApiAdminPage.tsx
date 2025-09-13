
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IntegrationsList from "./api/IntegrationsList";
import EmailTemplatesList from "./api/EmailTemplatesList";
import EmailEventsList from "./api/EmailEventsList";
import { ApiHealthDashboard } from "./api/ApiHealthDashboard";

const ApiAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Helmet>
        <title>API & Integrasjoner – Admin</title>
        <meta name="description" content="Admin: API-integrasjoner, e-postmaler og hendelser." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">API & Integrasjoner</h1>
        <p className="text-sm text-muted-foreground">
          Komplett API-infrastruktur klar for aktivering. Test tilkoblinger og overvåk ytelse.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="integrations">Integrasjoner</TabsTrigger>
          <TabsTrigger value="email">E-post</TabsTrigger>
          <TabsTrigger value="logs">Hendelser</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ApiHealthDashboard />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <IntegrationsList />
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <EmailTemplatesList />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <EmailEventsList />
        </TabsContent>
      </Tabs>

      <div className="rounded-md border border-border p-4 text-xs text-muted-foreground">
        ✅ <strong>API-infrastruktur klar:</strong> Database schema, Edge Functions, logging og admin-grensesnitt er implementert. 
        Legg inn API-nøkler som Supabase Secrets for å aktivere eksterne tjenester.
      </div>
    </div>
  );
};

export default ApiAdminPage;
