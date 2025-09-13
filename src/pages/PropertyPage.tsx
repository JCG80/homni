import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams, useParams } from 'react-router-dom';
import { BreadcrumbNavigation } from '@/components/navigation/BreadcrumbNavigation';
import { PropertyDashboard } from '@/modules/property/components/PropertyDashboard';
import { PropertyDocuments } from '@/modules/property/components/PropertyDocuments';
import { PropertyMaintenance } from '@/modules/property/components/PropertyMaintenance';
import { PropertySettings } from '@/modules/property/components/PropertySettings';
import { ProprSalesModule } from '@/modules/property/components/ProprSalesModule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PropertyPage = () => {
  const [searchParams] = useSearchParams();
  const { propertyId } = useParams<{ propertyId: string }>();
  const initialTab = searchParams.get('tab') || 'dashboard';

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Boligmappa - Homni</title>
        <meta 
          name="description" 
          content="Organiser og administrer all informasjon om dine eiendommer. Dokumenter, vedlikehold, og verdivurderinger på ett sted." 
        />
        <meta name="keywords" content="boligmappa, eiendom, dokumenter, vedlikehold, bolig, hus, leilighet" />
        <meta property="og:title" content="Boligmappa - Homni" />
        <meta property="og:description" content="Din komplette digitale boligmappe for alle eiendommer" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://homni.no/property" />
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        <BreadcrumbNavigation 
          customItems={[
            { label: 'Forside', href: '/', isActive: false },
            { label: 'Boligmappa', href: '/property', isActive: true }
          ]}
          showOnMobile
        />

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Din Digitale Boligmappe
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Organiser dokumenter, planlegg vedlikehold, og hold oversikt over alle dine eiendommer på ett sted
            </p>
          </div>

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
                Propr
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-sm">
                Innstillinger
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <PropertyDashboard />
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <PropertyDocuments propertyId={propertyId || ''} />
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-6">
              <PropertyMaintenance propertyId={propertyId} />
            </TabsContent>

            <TabsContent value="propr" className="space-y-6">
              <ProprSalesModule propertyId={propertyId} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <PropertySettings propertyId={propertyId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PropertyPage;