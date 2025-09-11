import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Target, Activity } from 'lucide-react';
import { useLeadAnalytics } from '../../hooks/useLeadAnalytics';
import { LeadConversionChart } from './LeadConversionChart';
import { LeadSourceChart } from './LeadSourceChart';
import { LeadPerformanceMetrics } from './LeadPerformanceMetrics';

interface LeadAnalyticsDashboardProps {
  className?: string;
  timeframe?: '7d' | '30d' | '90d' | '1y';
}

export const LeadAnalyticsDashboard: React.FC<LeadAnalyticsDashboardProps> = ({
  className,
  timeframe = '30d'
}) => {
  const { 
    metrics, 
    conversionData, 
    sourceData, 
    isLoading, 
    error 
  } = useLeadAnalytics(timeframe);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardContent className="pt-6">
          <p className="text-destructive">Feil ved lasting av analytics: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalLeads || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.leadGrowth ? (
                <span className={metrics.leadGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {metrics.leadGrowth >= 0 ? '+' : ''}{metrics.leadGrowth.toFixed(1)}% fra forrige periode
                </span>
              ) : (
                'Ingen endring'
              )}
            </p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Konverteringsrate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.conversionRate ? `${(metrics.conversionRate * 100).toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.conversionTrend ? (
                <span className={metrics.conversionTrend >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {metrics.conversionTrend >= 0 ? '+' : ''}{(metrics.conversionTrend * 100).toFixed(1)}% endring
                </span>
              ) : (
                'Stabil trend'
              )}
            </p>
          </CardContent>
        </Card>

        {/* Active Assignments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive tildelinger</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeAssignments || 0}</div>
            <div className="flex gap-1 mt-2">
              <Badge variant="secondary" className="text-xs">
                Auto: {metrics?.autoAssignments || 0}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Manuell: {metrics?.manualAssignments || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Impact */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Omsetning påvirkning</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.revenueImpact ? `${metrics.revenueImpact.toLocaleString('no-NO')} kr` : '0 kr'}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimert månedlig verdi
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Konverteringstrakt</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadConversionChart data={conversionData} />
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Lead-kilder</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadSourceChart data={sourceData} />
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <LeadPerformanceMetrics 
        metrics={metrics} 
        timeframe={timeframe}
      />
    </div>
  );
};