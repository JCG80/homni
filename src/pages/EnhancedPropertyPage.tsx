import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { PropertyNavigationBar } from '@/components/property/PropertyNavigationBar';
import { PropertyDashboard } from '@/modules/property/components/PropertyDashboard';
import { PropertyDocuments } from '@/modules/property/components/PropertyDocuments';
import { PropertyMaintenance } from '@/modules/property/components/PropertyMaintenance';
import { PropertySettings } from '@/modules/property/components/PropertySettings';
import { ProprSalesModule } from '@/modules/property/components/ProprSalesModule';
import { PropertyOverviewCard } from '@/components/property/PropertyOverviewCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProperty } from '@/modules/property/hooks/useProperty';
import { PageLayout } from '@/components/layout/PageLayout';

const EnhancedPropertyPage = () => {
  const [searchParams] = useSearchParams();
  const { properties, loading } = useProperty();
  const initialTab = searchParams.get('tab') || 'dashboard';

  // Mock data for overview - replace with actual API calls
  const overviewData = {
    totalProperties: properties?.length || 0,
    totalValue: properties?.reduce((sum, p) => sum + (p.current_value || 0), 0) || 0,
    pendingMaintenance: Math.floor(Math.random() * 5),
    documentsCount: Math.floor(Math.random() * 25),
    upcomingTasks: Math.floor(Math.random() * 3),
    completionRate: 75 + Math.floor(Math.random() * 20)
  };

  return (
    <PageLayout 
      title="Mine Eiendommer" 
      description="Administrer eiendommer, dokumenter, vedlikehold og DIY-salg på ett sted"
      showBreadcrumbs={true}
    >
      <Helmet>
        <title>Mine Eiendommer - Homni</title>
        <meta 
          name="description" 
          content="Administrer eiendommer, dokumenter, vedlikehold og DIY-salg. Din komplette eiendomsplattform." 
        />
        <meta name="keywords" content="eiendommer, boligmappa, vedlikehold, dokumenter, DIY salg, eiendomsadministrasjon" />
        <meta property="og:title" content="Mine Eiendommer - Homni" />
        <meta property="og:description" content="Din komplette eiendomsplattform for administrasjon og vedlikehold" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://homni.no/properties" />
      </Helmet>

      <PropertyNavigationBar />
      
      {/* Main Content */}
      <Tabs defaultValue={initialTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="text-sm">
            Oversikt
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-sm">
            Dokumenter
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="text-sm">
            Vedlikehold
          </TabsTrigger>
          <TabsTrigger value="propr" className="text-sm">
            DIY Salg
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-sm">
            Innstillinger
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <PropertyOverviewCard data={overviewData} isLoading={loading} />
          <PropertyDashboard />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <PropertyDocuments propertyId="" />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <PropertyMaintenance propertyId="" />
        </TabsContent>

        <TabsContent value="propr" className="space-y-6">
          <ProprSalesModule propertyId="" />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <PropertySettings propertyId="" />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default EnhancedPropertyPage;