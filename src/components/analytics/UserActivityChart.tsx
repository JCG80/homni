import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, Activity } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';
import { analyticsService } from '@/lib/analytics/analyticsService';
import { logger } from '@/utils/logger';

interface ActivityData {
  date: string;
  events: number;
  sessions: number;
  timeSpent: number;
  conversions: number;
}

export const UserActivityChart = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    if (user?.id) {
      fetchActivityData();
    }
  }, [user?.id, dateRange]);

  const fetchActivityData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      // Set date range based on selection
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      startDate.setDate(startDate.getDate() - days);

      const range = {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      };

      const activitySummary = await analyticsService.getUserActivitySummary(user.id, range);
      
      // Transform data for chart
      const chartData = activitySummary
        .sort((a, b) => new Date(a.date_summary).getTime() - new Date(b.date_summary).getTime())
        .map(summary => ({
          date: new Date(summary.date_summary).toLocaleDateString('no-NO', { 
            month: 'short', 
            day: 'numeric' 
          }),
          events: summary.total_events,
          sessions: summary.session_count,
          timeSpent: Math.round(summary.time_spent_minutes),
          conversions: summary.conversion_events,
        }));

      setActivityData(chartData);
    } catch (error) {
      logger.warn('Failed to fetch activity data', { error });
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
      {/* Date Range Selector */}
      <div className="flex items-center gap-4">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                dateRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-muted-foreground" 
                  fontSize={12}
                />
                <YAxis className="text-muted-foreground" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="events" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Events"
                />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  name="Sessions"
                />
                <Line 
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  name="Conversions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Time Spent Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Time Spent (Minutes)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-muted-foreground" 
                  fontSize={12}
                />
                <YAxis className="text-muted-foreground" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="timeSpent" 
                  fill="hsl(var(--primary))" 
                  name="Minutes"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityData.reduce((sum, day) => sum + day.events, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {Math.round(activityData.reduce((sum, day) => sum + day.events, 0) / activityData.length || 0)} per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityData.reduce((sum, day) => sum + day.sessions, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {Math.round(activityData.reduce((sum, day) => sum + day.sessions, 0) / activityData.length || 0)} per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(activityData.reduce((sum, day) => sum + day.timeSpent, 0))}m
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {Math.round(activityData.reduce((sum, day) => sum + day.timeSpent, 0) / activityData.length || 0)}m per day
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};