
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart3, Loader } from 'lucide-react';
import { CompanyProfile } from '../../types/types';

interface StatisticsTabProps {
  company: CompanyProfile;
  stats: {
    leadsWonPercentage?: number;
    avgResponseTime?: string;
    customerRating?: number;
    monthlyTrend?: string;
  };
  isLoading: boolean;
}

export function StatisticsTab({ company, stats, isLoading }: StatisticsTabProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="h-6 w-6 animate-spin" />
        <span className="ml-2">Laster statistikk...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Konverteringsrate for leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">
            {company.leadsWonPercentage ?? stats.leadsWonPercentage ?? 0}%
          </div>
          <p className="text-sm text-muted-foreground">
            Prosent av mottatte leads som resulterte i vunnet oppdrag
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Gjennomsnittlig responstid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">
            {company.avgResponseTime ?? stats.avgResponseTime ?? 'N/A'}
          </div>
          <p className="text-sm text-muted-foreground">
            Hvor raskt bedriften vanligvis svarer på nye leads
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Kundetilfredshet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">
            {company.customerRating ?? stats.customerRating ?? 0}/5
          </div>
          <p className="text-sm text-muted-foreground">
            Gjennomsnittlig rating fra kunder
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Månedlig trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2 capitalize">
            {company.monthlyTrend ?? stats.monthlyTrend ?? 'Stabil'}
          </div>
          <p className="text-sm text-muted-foreground">
            Trend for konverteringsrate den siste måneden
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
