import React from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/modules/auth/hooks';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Download, 
  RefreshCw, 
  Calendar,
  Filter,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

import { HeatMapByPostcode } from '../components/HeatMapByPostcode';
import { TrendByServiceType } from '../components/TrendByServiceType';
import { LeadConversionStats } from '../components/LeadConversionStats';
import { UnmatchedNeedsTable } from '../components/UnmatchedNeedsTable';
import { useInsightsData } from '../hooks/useInsightsData';

export const InsightsDashboard = () => {
  const { user, role } = useAuth();
  const { isEnabled: insightsEnabled } = useFeatureFlag('ENABLE_SMART_INSIGHTS');
  const {
    data,
    postcodeStats,
    serviceStats,
    isLoading,
    error,
    refresh
  } = useInsightsData();

  // Access control - only admin and master_admin can see insights
  const hasAccess = role === 'admin' || role === 'master_admin';

  if (!insightsEnabled) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">SmartStart Insights</h2>
            <p className="text-muted-foreground mb-4">
              Denne funksjonen er ikke aktivert for ditt miljø.
            </p>
            <Badge variant="outline">Feature flag: ENABLE_SMART_INSIGHTS</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
            <h2 className="text-xl font-semibold mb-2">Ingen tilgang</h2>
            <p className="text-muted-foreground mb-4">
              Du har ikke tilgang til SmartStart Insights. Kun administratorer kan se denne siden.
            </p>
            <Badge variant="secondary">Krever admin- eller master_admin-rolle</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Feil ved innlasting</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Prøv igjen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting insights data...');
  };

  const handleRecruitCompany = (postcode: string, service: string) => {
    // TODO: Implement company recruitment functionality
    console.log(`Recruiting company for ${service} in ${postcode}`);
  };

  return (
    <>
      <Helmet>
        <title>SmartStart Insights - Homni Admin Dashboard</title>
        <meta name="description" content="Markedsinnsikt og etterspørselsanalyse fra SmartStart søk" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">SmartStart Insights</h1>
              <p className="text-muted-foreground">
                Markedsinnsikt og etterspørselsanalyse basert på brukerdata
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Periode
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Eksporter
              </Button>
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Oppdater
              </Button>
            </div>
          </div>

          {/* Quick stats */}
          {data && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>{data.totalSubmissions} totale søk</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>{data.totalLeads} leads generert</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {data.conversionRate.toFixed(1)}% konvertering
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Conversion Stats - Full width on top */}
          <div className="lg:col-span-2">
            <LeadConversionStats data={data} isLoading={isLoading} />
          </div>

          {/* Service Type Trends */}
          <TrendByServiceType data={serviceStats} isLoading={isLoading} />

          {/* Postcode Heatmap */}
          <HeatMapByPostcode data={postcodeStats} isLoading={isLoading} />
        </div>

        {/* Unmatched Needs - Full width at bottom */}
        <UnmatchedNeedsTable 
          data={data?.unmatchedNeeds || []} 
          isLoading={isLoading}
          onRecruitCompany={handleRecruitCompany}
        />

        {/* Footer info */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground text-center">
          Data oppdateres hver time • Sist oppdatert: {new Date().toLocaleString('no-NO')}
        </div>
      </div>
    </>
  );
};