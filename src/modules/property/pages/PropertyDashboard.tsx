import React, { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { PropertyList } from '../components/PropertyList';
import { PropertyStats } from '../components/PropertyStats';
import { PropertyAnalytics } from '../components/PropertyAnalytics';
import { PropertySearch } from '../components/PropertySearch';
import { PropertyMaintenance } from '../components/PropertyMaintenance';
import { PropertyExport } from '../components/PropertyExport';
import { QuickActions } from '../components/QuickActions';
import { useProperties } from '../hooks/useProperties';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Home, FileText, DollarSign, BarChart, Search, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PropertyDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { properties, isLoading, error } = useProperties();
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Update filtered properties when properties change
  React.useEffect(() => {
    if (properties) {
      setFilteredProperties(properties);
    }
  }, [properties]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mine Eiendommer</h1>
          <p className="text-muted-foreground">
            Administrer dine eiendommer, dokumenter og vedlikehold
          </p>
        </div>
        <Button onClick={() => navigate('/properties/new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ny Eiendom
        </Button>
      </div>

      <PropertyStats />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Oversikt
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Analyse
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Vedlikehold
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Søk & Filter
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Eksport
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Mine Eiendommer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PropertyList properties={properties || []} isLoading={isLoading} error={error} />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <QuickActions />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Siste Dokumenter
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-8">
                  Ingen dokumenter ennå
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Siste Utgifter
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-8">
                  Ingen utgifter registrert
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <PropertyAnalytics />
        </TabsContent>

        <TabsContent value="maintenance">
          <PropertyMaintenance />
        </TabsContent>

        <TabsContent value="search">
          <div className="space-y-6">
            <PropertySearch 
              properties={properties as any[] || []} 
              onFilteredPropertiesChange={setFilteredProperties}
            />
            <Card>
              <CardHeader>
                <CardTitle>Søkeresultater</CardTitle>
              </CardHeader>
              <CardContent>
                <PropertyList 
                  properties={filteredProperties} 
                  isLoading={isLoading} 
                  error={error} 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export">
          <PropertyExport />
        </TabsContent>
      </Tabs>
    </div>
  );
}