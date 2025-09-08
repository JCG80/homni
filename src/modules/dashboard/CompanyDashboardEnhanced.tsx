/**
 * Enhanced Company Dashboard with Real Data Integration
 * Replaces mock data with actual lead statistics and metrics
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Users,
  Calendar,
  BarChart3,
  Plus,
  ArrowRight,
  Target,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';
import { useCompanyLeadsData } from '@/hooks/useLeadsData';
import { STATUS_LABELS } from '@/types/leads-canonical';

interface DashboardMetric {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  description?: string;
}

export function CompanyDashboardEnhanced() {
  const { user, profile } = useAuth();
  const { leads, stats, loading, error } = useCompanyLeadsData();

  if (loading) {
    return <div className="p-6 text-center">Laster dashboard...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Kunne ikke laste dashboard data</p>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  // Calculate real metrics from actual data
  const recentLeads = leads.slice(0, 3);
  const activeLeads = leads.filter(lead => ['new', 'qualified', 'contacted', 'negotiating'].includes(lead.status));
  
  const metrics: DashboardMetric[] = [
    {
      title: 'Nye leads i dag',
      value: stats.todayCount,
      change: stats.todayCount > 0 ? '+' + Math.round((stats.todayCount / Math.max(stats.total - stats.todayCount, 1)) * 100) + '%' : '0%',
      trend: stats.todayCount > 0 ? 'up' : 'neutral',
      icon: <Target className="h-5 w-5" />,
      description: 'Sammenlignet med i går'
    },
    {
      title: 'Aktive leads',
      value: activeLeads.length,
      change: `av ${stats.total} totalt`,
      trend: 'neutral',
      icon: <Briefcase className="h-5 w-5" />,
      description: 'Krever oppfølging'
    },
    {
      title: 'Konverteringsrate',
      value: `${stats.conversionRate}%`,
      change: stats.conversionRate > 20 ? 'Over målsetting' : 'Under målsetting',
      trend: stats.conversionRate > 20 ? 'up' : 'down',
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Siste 30 dager'
    },
    {
      title: 'Gjennomsnittlig verdi',
      value: `${stats.averageValue} kr`,
      change: 'Per lead',
      trend: 'neutral',
      icon: <DollarSign className="h-5 w-5" />,
      description: 'Estimert verdi'
    }
  ];

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'secondary';
      case 'qualified': return 'default';
      case 'contacted': return 'outline';
      case 'negotiating': return 'secondary';
      case 'converted': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bedriftsdashboard
          </h1>
          <p className="text-muted-foreground">
            Oversikt over leads, budsjett og ytelse for din bedrift.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Rapporter
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Juster budsjett
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className="text-muted-foreground">
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.change && (
                <p className={`text-xs ${getTrendColor(metric.trend)}`}>
                  {metric.change}
                </p>
              )}
              {metric.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Aktive leads ({activeLeads.length})
            </CardTitle>
            <CardDescription>
              Leads som krever din oppmerksomhet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Ingen leads ennå</p>
                  <p className="text-sm">Leads vil vises her når de blir tildelt</p>
                </div>
              ) : (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{lead.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {lead.category} • {new Date(lead.created_at).toLocaleDateString('no-NO')}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(lead.status) as any}>
                      {STATUS_LABELS[lead.status as keyof typeof STATUS_LABELS]}
                    </Badge>
                  </div>
                ))
              )}
              
              {activeLeads.length > 0 && (
                <Button variant="outline" size="sm" className="w-full">
                  Se alle leads ({activeLeads.length})
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Siste aktivitet
            </CardTitle>
            <CardDescription>
              Nylige endringer og oppdateringer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leads.slice(0, 4).map((lead, index) => (
                <div key={lead.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    lead.status === 'converted' ? 'bg-green-500' :
                    lead.status === 'new' ? 'bg-blue-500' :
                    lead.status === 'contacted' ? 'bg-yellow-500' : 'bg-purple-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">
                      {lead.status === 'converted' ? 'Lead konvertert til kunde' :
                       lead.status === 'new' ? 'Nytt lead mottatt' :
                       lead.status === 'contacted' ? 'Lead kontaktet' : 'Lead oppdatert'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(lead.updated_at).toLocaleString('no-NO')}
                    </p>
                  </div>
                </div>
              ))}
              
              {leads.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Ingen aktivitet ennå</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ytelsesindikerer
          </CardTitle>
          <CardDescription>
            Nøkkeltall basert på dine leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.byStatus.converted || 0}
              </div>
              <p className="text-sm text-muted-foreground">Konverterte leads</p>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? `${Math.round((stats.byStatus.converted / stats.total) * 100)}% av totalt` : 'Ingen data'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.byStatus.new + stats.byStatus.qualified}
              </div>
              <p className="text-sm text-muted-foreground">Nye muligheter</p>
              <p className="text-xs text-muted-foreground">Krever oppfølging</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.conversionRate}%
              </div>
              <p className="text-sm text-muted-foreground">Suksessrate</p>
              <p className="text-xs text-muted-foreground">
                {stats.conversionRate > 20 ? 'Over målsetting' : 'Kan forbedres'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}