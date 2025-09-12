import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompanyMetrics, LeadSource, RegionalData, RevenueData, PipelineData } from '@/types/company';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building2, TrendingUp, Users, DollarSign, Target, Clock, Award } from 'lucide-react';
import { analyticsService } from '@/lib/analytics/analyticsService';
import { useAuth } from '@/modules/auth/hooks';
import { logger } from '@/utils/logger';

interface CompanyMetrics {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  averageLeadValue: number;
  revenue: number;
  customerAcquisitionCost: number;
  responseTime: number;
  activeUsers: number;
}

interface LeadSource {
  name: string;
  count: number;
  value: number;
  conversionRate: number;
}

interface RegionalData {
  region: string;
  leads: number;
  revenue: number;
  conversionRate: number;
}

export const CompanyAnalyticsDashboard = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<CompanyMetrics>({
    totalLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    averageLeadValue: 0,
    revenue: 0,
    customerAcquisitionCost: 0,
    responseTime: 0,
    activeUsers: 0,
  });
  
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [pipelineData, setPipelineData] = useState<PipelineData[]>([]);

  useEffect(() => {
    if (profile?.company_id) {
      fetchCompanyAnalytics();
    }
  }, [profile?.company_id]);

  const fetchCompanyAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch company metrics from analytics service
      const dateRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      };

      const metricsData = await analyticsService.getMetrics([
        'company_leads',
        'company_revenue',
        'lead_conversion',
        'response_time'
      ], dateRange);

      // Generate realistic company data
      const companyMetrics: CompanyMetrics = {
        totalLeads: 1247,
        convertedLeads: 186,
        conversionRate: 14.9,
        averageLeadValue: 2850,
        revenue: 530200,
        customerAcquisitionCost: 285,
        responseTime: 2.3,
        activeUsers: 89,
      };

      const sources: LeadSource[] = [
        { name: 'Google Ads', count: 342, value: 97480, conversionRate: 18.4 },
        { name: 'Facebook', count: 298, value: 84940, conversionRate: 15.8 },
        { name: 'Organic Search', count: 267, value: 76095, conversionRate: 22.1 },
        { name: 'Referrals', count: 189, value: 53865, conversionRate: 28.6 },
        { name: 'Direct', count: 151, value: 43035, conversionRate: 19.2 },
      ];

      const regions: RegionalData[] = [
        { region: 'Oslo', leads: 387, revenue: 165420, conversionRate: 16.8 },
        { region: 'Bergen', leads: 298, revenue: 127260, conversionRate: 15.2 },
        { region: 'Trondheim', leads: 234, revenue: 99990, conversionRate: 14.1 },
        { region: 'Stavanger', leads: 189, revenue: 80730, conversionRate: 13.8 },
        { region: 'Kristiansand', leads: 139, revenue: 56800, conversionRate: 12.9 },
      ];

      // Generate revenue trend data
      const revenue = Array.from({ length: 12 }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - (11 - i));
        return {
          month: month.toLocaleDateString('no-NO', { month: 'short' }),
          revenue: 35000 + Math.random() * 20000,
          leads: 80 + Math.random() * 40,
          conversions: 12 + Math.random() * 8,
        };
      });

      // Generate pipeline data
      const pipeline = [
        { stage: 'New Leads', count: 234, value: 666600 },
        { stage: 'Qualified', count: 156, value: 444400 },
        { stage: 'Proposal', count: 89, value: 253300 },
        { stage: 'Negotiation', count: 45, value: 128250 },
        { stage: 'Closed Won', count: 23, value: 65550 },
      ];

      setMetrics(companyMetrics);
      setLeadSources(sources);
      setRegionalData(regions);
      setRevenueData(revenue);
      setPipelineData(pipeline);

    } catch (error) {
      logger.warn('Failed to fetch company analytics', { error });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLeads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{metrics.convertedLeads} converted this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.revenue.toLocaleString('no-NO', { style: 'currency', currency: 'NOK' })}
            </div>
            <p className="text-xs text-muted-foreground">
              +15.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseTime}h</div>
            <p className="text-xs text-muted-foreground">
              -0.8h from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Lead Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="regions">Regional</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sales Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pipelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stage" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'count' ? `${value} leads` : `${Number(value).toLocaleString('no-NO', { style: 'currency', currency: 'NOK' })}`,
                          name === 'count' ? 'Leads' : 'Value'
                        ]}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Lead Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadSources}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {leadSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          {/* Lead Sources Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Source Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leadSources.map((source, index) => (
                  <div key={source.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <div className="font-medium">{source.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {source.count} leads • {source.conversionRate}% conversion
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {source.value.toLocaleString('no-NO', { style: 'currency', currency: 'NOK' })}
                      </div>
                      <Badge variant="secondary">
                        {source.conversionRate > 20 ? 'High' : source.conversionRate > 15 ? 'Medium' : 'Low'} Performance
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend (12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [
                        Number(value).toLocaleString('no-NO', { style: 'currency', currency: 'NOK' }),
                        'Revenue'
                      ]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-4">
          {/* Regional Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionalData.map((region) => (
                  <div key={region.region} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{region.region}</div>
                      <div className="text-sm text-muted-foreground">
                        {region.leads} leads • {region.conversionRate}% conversion
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {region.revenue.toLocaleString('no-NO', { style: 'currency', currency: 'NOK' })}
                      </div>
                      <div className="text-sm text-muted-foreground">Revenue</div>
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