import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { InsightsData } from '../types';

interface LeadConversionStatsProps {
  data: InsightsData | null;
  isLoading?: boolean;
}

export const LeadConversionStats: React.FC<LeadConversionStatsProps> = ({
  data,
  isLoading = false
}) => {
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Konverteringsstatistikk</CardTitle>
          <CardDescription>SmartStart til lead-konvertering</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-8 bg-muted rounded w-16" />
                <div className="h-2 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const conversionRate = data.conversionRate;
  const completionRate = data.totalSubmissions > 0 ? (data.totalLeads / data.totalSubmissions) * 100 : 0;
  
  // Determine performance status
  const getPerformanceStatus = (rate: number) => {
    if (rate >= 70) return { status: 'excellent', color: 'success', icon: CheckCircle };
    if (rate >= 50) return { status: 'good', color: 'primary', icon: TrendingUp };
    if (rate >= 30) return { status: 'average', color: 'warning', icon: Clock };
    return { status: 'needs-improvement', color: 'destructive', icon: AlertCircle };
  };

  const conversionStatus = getPerformanceStatus(conversionRate);
  
  const stats = [
    {
      label: 'Totale søk',
      value: data.totalSubmissions,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: null
    },
    {
      label: 'Leads generert',
      value: data.totalLeads,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+12%'
    },
    {
      label: 'Konverteringsrate',
      value: `${conversionRate.toFixed(1)}%`,
      icon: conversionStatus.icon,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: conversionRate > 50 ? '+5.2%' : '-2.1%'
    },
    {
      label: 'Fullføringsrate',
      value: `${completionRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+3.4%'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Konverteringsstatistikk
        </CardTitle>
        <CardDescription>
          SmartStart til lead-konvertering og performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} mb-2`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                  {stat.change && (
                    <Badge 
                      variant={stat.change.startsWith('+') ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Performance indicator */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Konverteringsytelse</span>
            <Badge 
              variant={conversionStatus.color === 'success' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {conversionStatus.status.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
          
          <Progress 
            value={Math.min(conversionRate, 100)} 
            className="h-3"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="font-medium">{conversionRate.toFixed(1)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Performance insights */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Innsikt og anbefalinger</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            {conversionRate > 70 && (
              <p>✅ Utmerket konverteringsrate! SmartStart fungerer svært godt.</p>
            )}
            {conversionRate >= 50 && conversionRate <= 70 && (
              <p>📈 God konverteringsrate med rom for forbedring i brukeropplevelsen.</p>
            )}
            {conversionRate < 50 && (
              <p>🎯 Konverteringsraten kan forbedres. Vurder å optimalisere flyten eller tilbudet.</p>
            )}
            
            {data.totalSubmissions > 0 && data.totalLeads === 0 && (
              <p>⚠️ Ingen leads generert ennå. Sjekk at lead-genereringsprosessen fungerer.</p>
            )}
            
            {data.totalSubmissions > 100 && conversionRate > 60 && (
              <p>🚀 Høyt volum og god konvertering - vurder å skalere markedsføringen!</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};