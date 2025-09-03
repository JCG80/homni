import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UserActivityChart } from './UserActivityChart';
import { ConversionFunnelChart } from './ConversionFunnelChart';
import { PerformanceMetricsCard } from './PerformanceMetricsCard';
import { RealtimeMetrics } from './RealtimeMetrics';
import { BusinessIntelligenceReports } from './BusinessIntelligenceReports';
import { LeadAnalyticsEnhanced } from './LeadAnalyticsEnhanced';
import { Building2, Shield, Users, TrendingUp, BarChart3, Activity, Clock } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '@/lib/analytics/analyticsService';
import { logger } from '@/utils/logger';

interface AnalyticsData {
  totalEvents: number;
  uniqueUsers: number;
  conversionRate: number;
  avgSessionTime: number;
  topFeatures: { name: string; usage: number }[];
  recentActivity: any[];
}

export const AnalyticsDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalEvents: 0,
    uniqueUsers: 0,
    conversionRate: 0,
    avgSessionTime: 0,
    topFeatures: [],
    recentActivity: [],
  });

  useEffect(() => {
    if (user?.id) {
      fetchAnalyticsData();
    }
  }, [user?.id]);

  const fetchAnalyticsData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Get date range for last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const dateRange = {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      };

      // Fetch user activity summary
      const activitySummary = await analyticsService.getUserActivitySummary(user.id, dateRange);
      
      // Calculate analytics data
      const totalEvents = activitySummary.reduce((sum, day) => sum + day.total_events, 0);
      const uniqueSessions = activitySummary.reduce((sum, day) => sum + day.session_count, 0);
      const totalTime = activitySummary.reduce((sum, day) => sum + day.time_spent_minutes, 0);
      const conversions = activitySummary.reduce((sum, day) => sum + day.conversion_events, 0);

      setAnalyticsData({
        totalEvents,
        uniqueUsers: uniqueSessions,
        conversionRate: totalEvents > 0 ? (conversions / totalEvents) * 100 : 0,
        avgSessionTime: uniqueSessions > 0 ? totalTime / uniqueSessions : 0,
        topFeatures: [
          { name: 'Lead Generation', usage: 234 },
          { name: 'Property Search', usage: 189 },
          { name: 'Analytics', usage: 156 }
        ],
        recentActivity: activitySummary.slice(0, 7),
      });
    } catch (error) {
      logger.warn('Failed to fetch analytics data', { error });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {(profile?.role === 'company' || profile?.role === 'admin' || profile?.role === 'master_admin') && (
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/company-analytics')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Advanced lead analytics, revenue tracking, and business insights</p>
              <Button variant="outline" size="sm" className="mt-2">
                View Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {(profile?.role === 'admin' || profile?.role === 'master_admin') && (
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin-analytics')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Platform-wide analytics, system health, and business intelligence</p>
              <Button variant="outline" size="sm" className="mt-2">
                View Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Real-time Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Live system performance and user activity monitoring</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setActiveTab('realtime')}>
              View Metrics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.uniqueUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Goal completions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analyticsData.avgSessionTime)}m</div>
            <p className="text-xs text-muted-foreground">Minutes per session</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
          <TabsTrigger value="leads">Lead Analytics</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <UserActivityChart />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <UserActivityChart />
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <LeadAnalyticsEnhanced />
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <ConversionFunnelChart />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceMetricsCard />
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <RealtimeMetrics />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <BusinessIntelligenceReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};