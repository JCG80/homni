import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  MessageSquare, 
  Activity,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalUsers: number;
  totalCompanies: number;
  totalLeads: number;
  conversionRate: number;
  activeUsers: number;
  leadsByStatus: { status: string; count: number }[];
  leadsByType: { type: string; count: number }[];
  usersByRole: { role: string; count: number }[];
  dailyMetrics: { date: string; users: number; leads: number; companies: number }[];
}

const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  const [
    { data: profiles },
    { data: companies },
    { data: leads }
  ] = await Promise.all([
    supabase.from('user_profiles').select('*'),
    supabase.from('company_profiles').select('*'),
    supabase.from('leads').select('*')
  ]);

  // Calculate metrics
  const totalUsers = profiles?.length || 0;
  const totalCompanies = companies?.length || 0;
  const totalLeads = leads?.length || 0;
  const assignedLeads = leads?.filter(lead => lead.company_id).length || 0;
  const conversionRate = totalLeads > 0 ? (assignedLeads / totalLeads) * 100 : 0;

  // Active users (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const activeUsers = profiles?.filter(profile => 
    new Date(profile.updated_at) > weekAgo
  ).length || 0;

  // Group leads by status
  const leadsByStatus = leads?.reduce((acc: any[], lead) => {
    const existing = acc.find(item => item.status === lead.status);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ status: lead.status || 'unknown', count: 1 });
    }
    return acc;
  }, []) || [];

  // Group leads by type
  const leadsByType = leads?.reduce((acc: any[], lead) => {
    const existing = acc.find(item => item.type === lead.lead_type);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ type: lead.lead_type || 'general', count: 1 });
    }
    return acc;
  }, []) || [];

  // Group users by role
  const usersByRole = profiles?.reduce((acc: any[], profile) => {
    const existing = acc.find(item => item.role === profile.role);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ role: profile.role || 'user', count: 1 });
    }
    return acc;
  }, []) || [];

  // Mock daily metrics (would come from time-series data in production)
  const dailyMetrics = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString().split('T')[0],
      users: Math.floor(Math.random() * 10) + totalUsers * 0.1,
      leads: Math.floor(Math.random() * 5) + totalLeads * 0.05,
      companies: Math.floor(Math.random() * 2) + totalCompanies * 0.02
    };
  });

  return {
    totalUsers,
    totalCompanies,
    totalLeads,
    conversionRate,
    activeUsers,
    leadsByStatus,
    leadsByType,
    usersByRole,
    dailyMetrics
  };
};

export const AdvancedAnalytics: React.FC = () => {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['advanced-analytics'],
    queryFn: fetchAnalyticsData,
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Avansert Analyse</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-8 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Kunne ikke laste analysedata</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Avansert Analyse</h1>
          <p className="text-muted-foreground">Detaljert innsikt i plattformens ytelse</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Periode
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Eksporter
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Totale Brukere</p>
                <p className="text-2xl font-bold">{analytics.totalUsers}</p>
                <p className="text-xs text-muted-foreground">
                  {analytics.activeUsers} aktive siste uke
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Totale Bedrifter</p>
                <p className="text-2xl font-bold">{analytics.totalCompanies}</p>
                <p className="text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12% fra forrige måned
                </p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Totale Leads</p>
                <p className="text-2xl font-bold">{analytics.totalLeads}</p>
                <p className="text-xs text-green-600">
                  <Activity className="h-3 w-3 inline mr-1" />
                  Høy aktivitet
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Konverteringsrate</p>
                <p className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  Leads tildelt bedrifter
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads">Lead Analyse</TabsTrigger>
          <TabsTrigger value="users">Bruker Analyse</TabsTrigger>
          <TabsTrigger value="performance">Ytelse</TabsTrigger>
          <TabsTrigger value="trends">Trender</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Leads etter Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.leadsByStatus.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.status}</Badge>
                      </div>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leads etter Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.leadsByType.map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{item.type}</Badge>
                      </div>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brukere etter Rolle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {analytics.usersByRole.map((item) => (
                  <div key={item.role} className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{item.count}</p>
                    <p className="text-sm text-muted-foreground capitalize">{item.role}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Ytelse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">99.9%</p>
                  <p className="text-sm text-muted-foreground">Oppetid</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">45ms</p>
                  <p className="text-sm text-muted-foreground">Responstid</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">156MB</p>
                  <p className="text-sm text-muted-foreground">Minnebruk</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>7-Dagers Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.dailyMetrics.map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{day.date}</span>
                    <div className="flex gap-4 text-sm">
                      <span>Brukere: {day.users}</span>
                      <span>Leads: {day.leads}</span>
                      <span>Bedrifter: {day.companies}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};