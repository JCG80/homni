import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams, useParams } from 'react-router-dom';
import { PropertyNavigationBar } from '@/components/property/PropertyNavigationBar';
import { PropertyDashboard } from '@/modules/property/components/PropertyDashboard';
import { PropertyDocuments } from '@/modules/property/components/PropertyDocuments';
import { PropertyMaintenance } from '@/modules/property/components/PropertyMaintenance';
import { PropertySettings } from '@/modules/property/components/PropertySettings';
import { ProprSalesModule } from '@/modules/property/components/ProprSalesModule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Settings, Heart, FileText, Home } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';

const PropertyPage = () => {
  const [searchParams] = useSearchParams();
  const { propertyId } = useParams<{ propertyId: string }>();
  const initialTab = searchParams.get('tab') || 'dashboard';

  return (
    <PageLayout 
      title="Mine Eiendommer"
      description="Administrer eiendommer, dokumenter, vedlikehold og DIY-salg på ett sted"
      showBreadcrumbs={true}
    >
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

      <PropertyNavigationBar />
      
      {/* Property Quick Actions */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
              <Link to="?tab=dashboard">
                <Home className="h-5 w-5" />
                <span className="text-sm">Oversikt</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
              <Link to="?tab=documents">
                <FileText className="h-5 w-5" />
                <span className="text-sm">Dokumenter</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
              <Link to="?tab=maintenance">
                <Settings className="h-5 w-5" />
                <span className="text-sm">Vedlikehold</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
              <Link to="?tab=propr">
                <Heart className="h-5 w-5" />
                <span className="text-sm">DIY Salg</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

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
    </PageLayout>
  );
};

export default PropertyPage;