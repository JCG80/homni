import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, TrendingUp, Award, Target } from 'lucide-react';

interface LeadAnalyticsMetrics {
  totalLeads: number;
  leadGrowth: number;
  conversionRate: number;
  conversionTrend: number;
  activeAssignments: number;
  autoAssignments: number;
  manualAssignments: number;
  revenueImpact: number;
  averageResponseTime: number;
  topCategories: Array<{ name: string; count: number; percentage: number }>;
  topSources: Array<{ name: string; count: number; percentage: number }>;
}

interface LeadPerformanceMetricsProps {
  metrics: LeadAnalyticsMetrics | null;
  timeframe: string;
}

export const LeadPerformanceMetrics: React.FC<LeadPerformanceMetricsProps> = ({
  metrics,
  timeframe
}) => {
  if (!metrics) {
    return null;
  }

  const getTimeframeLabel = (tf: string) => {
    switch (tf) {
      case '7d': return 'siste 7 dager';
      case '30d': return 'siste 30 dager';
      case '90d': return 'siste 90 dager';
      case '1y': return 'siste året';
      default: return 'valgt periode';
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Response Time & Efficiency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Responstid og effektivitet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Gjennomsnittlig responstid</span>
                <Badge variant="secondary">
                  {metrics.averageResponseTime}h
                </Badge>
              </div>
              <Progress 
                value={Math.max(0, 100 - (metrics.averageResponseTime / 24) * 100)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mål: Under 2 timer
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Automatisering</span>
                <Badge variant="secondary">
                  {metrics.activeAssignments > 0 
                    ? Math.round((metrics.autoAssignments / metrics.activeAssignments) * 100)
                    : 0}%
                </Badge>
              </div>
              <Progress 
                value={metrics.activeAssignments > 0 
                  ? (metrics.autoAssignments / metrics.activeAssignments) * 100
                  : 0} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.autoAssignments} av {metrics.activeAssignments} tildelinger er automatiske
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Toppkategorier ({getTimeframeLabel(timeframe)})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.topCategories.slice(0, 5).map((category, index) => (
              <div key={category.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {category.count}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {category.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-1.5" />
              </div>
            ))}
            
            {metrics.topCategories.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Ingen kategoridata for valgt periode
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Ytelsessammendrag
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">
                {(metrics.conversionRate * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Konverteringsrate</p>
              <Badge 
                variant={metrics.conversionTrend >= 0 ? "default" : "destructive"} 
                className="mt-1"
              >
                {metrics.conversionTrend >= 0 ? '+' : ''}{(metrics.conversionTrend * 100).toFixed(1)}%
              </Badge>
            </div>

            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{metrics.activeAssignments}</div>
              <p className="text-sm text-muted-foreground">Aktive tildelinger</p>
              <div className="flex justify-center gap-1 mt-1">
                <Badge variant="secondary" className="text-xs">
                  Auto: {metrics.autoAssignments}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Manuell: {metrics.manualAssignments}
                </Badge>
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">
                {metrics.revenueImpact.toLocaleString('no-NO', { 
                  style: 'currency', 
                  currency: 'NOK',
                  maximumFractionDigits: 0 
                })}
              </div>
              <p className="text-sm text-muted-foreground">Estimert verdi</p>
              <Badge variant="secondary" className="mt-1">
                {getTimeframeLabel(timeframe)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};