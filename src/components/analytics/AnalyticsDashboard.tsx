import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart, Activity, Users, TrendingUp, Clock } from 'lucide-react';
import { UserActivityChart } from './UserActivityChart';
import { ConversionFunnelChart } from './ConversionFunnelChart';
import { PerformanceMetricsCard } from './PerformanceMetricsCard';
import { RealtimeMetrics } from './RealtimeMetrics';
import { BusinessIntelligenceReports } from './BusinessIntelligenceReports';
import { useAuth } from '@/modules/auth/hooks';
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
      
      // Fetch key metrics
      const metrics = await analyticsService.getMetrics([
        'total_events',
        'unique_users',
        'conversion_rate',
        'avg_session_time'
      ], dateRange);

      // Calculate analytics data
      const totalEvents = activitySummary.reduce((sum, day) => sum + day.total_events, 0);
      const uniqueSessions = activitySummary.reduce((sum, day) => sum + day.session_count, 0);
      const totalTime = activitySummary.reduce((sum, day) => sum + day.time_spent_minutes, 0);
      const conversions = activitySummary.reduce((sum, day) => sum + day.conversion_events, 0);

      // Get top features
      const featureUsage = activitySummary.reduce((acc, day) => {
        Object.entries(day.features_used || {}).forEach(([feature, count]) => {
          acc[feature] = (acc[feature] || 0) + (count as number);
        });
        return acc;
      }, {} as Record<string, number>);

      const topFeatures = Object.entries(featureUsage)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, usage]) => ({ name, usage }));

      setAnalyticsData({
        totalEvents,
        uniqueUsers: uniqueSessions,
        conversionRate: totalEvents > 0 ? (conversions / totalEvents) * 100 : 0,
        avgSessionTime: uniqueSessions > 0 ? totalTime / uniqueSessions : 0,
        topFeatures,
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
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          {(profile?.role === 'admin' || profile?.role === 'master_admin') && (
            <TabsTrigger value="reports">BI Reports</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Top Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analyticsData.topFeatures.map((feature, index) => (
                    <div key={feature.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{feature.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ 
                              width: `${(feature.usage / Math.max(...analyticsData.topFeatures.map(f => f.usage))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature.usage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analyticsData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{new Date(activity.date_summary).toLocaleDateString()}</span>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span>{activity.total_events} events</span>
                        <span>{activity.session_count} sessions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <UserActivityChart />
        </TabsContent>

        <TabsContent value="conversions">
          <ConversionFunnelChart />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMetricsCard />
        </TabsContent>

        <TabsContent value="realtime">
          <RealtimeMetrics />
        </TabsContent>

        {(profile?.role === 'admin' || profile?.role === 'master_admin') && (
          <TabsContent value="reports">
            <BusinessIntelligenceReports />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};