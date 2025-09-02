import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Users, Zap, Globe, Wifi, WifiOff } from 'lucide-react';
import { analyticsService } from '@/lib/analytics/analyticsService';
import { logger } from '@/utils/logger';

interface RealtimeData {
  timestamp: string;
  activeUsers: number;
  pageViews: number;
  events: number;
  errors: number;
  responseTime: number;
}

interface LiveMetrics {
  activeUsers: number;
  currentPageViews: number;
  eventsPerMinute: number;
  errorRate: number;
  averageResponseTime: number;
  topPages: { page: string; views: number }[];
  recentEvents: { event: string; timestamp: string; user?: string }[];
}

export const RealtimeMetrics = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [realtimeData, setRealtimeData] = useState<RealtimeData[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    activeUsers: 0,
    currentPageViews: 0,
    eventsPerMinute: 0,
    errorRate: 0,
    averageResponseTime: 0,
    topPages: [],
    recentEvents: [],
  });
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const dataBufferRef = useRef<RealtimeData[]>([]);

  useEffect(() => {
    startRealtimeUpdates();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRealtimeUpdates = () => {
    // Initial data fetch
    updateRealtimeData();
    
    // Set up interval for real-time updates
    intervalRef.current = setInterval(updateRealtimeData, 5000); // Update every 5 seconds
  };

  const updateRealtimeData = async () => {
    try {
      setIsConnected(true);
      
      // Generate realistic real-time data (in production, this would come from your analytics API)
      const now = new Date();
      const newDataPoint: RealtimeData = {
        timestamp: now.toISOString(),
        activeUsers: Math.floor(Math.random() * 50) + 10,
        pageViews: Math.floor(Math.random() * 20) + 5,
        events: Math.floor(Math.random() * 15) + 2,
        errors: Math.random() < 0.1 ? Math.floor(Math.random() * 3) : 0,
        responseTime: Math.random() * 200 + 100,
      };

      // Update data buffer (keep last 20 points for chart)
      dataBufferRef.current = [...dataBufferRef.current, newDataPoint].slice(-20);
      setRealtimeData([...dataBufferRef.current]);

      // Calculate live metrics
      const last5Minutes = dataBufferRef.current.slice(-5);
      const eventsPerMinute = last5Minutes.length > 0 
        ? last5Minutes.reduce((sum, d) => sum + d.events, 0) / last5Minutes.length 
        : 0;
      
      const totalErrors = last5Minutes.reduce((sum, d) => sum + d.errors, 0);
      const totalEvents = last5Minutes.reduce((sum, d) => sum + d.events, 0);
      const errorRate = totalEvents > 0 ? (totalErrors / totalEvents) * 100 : 0;
      
      const avgResponseTime = last5Minutes.length > 0
        ? last5Minutes.reduce((sum, d) => sum + d.responseTime, 0) / last5Minutes.length
        : 0;

      // Generate realistic top pages and recent events
      const topPages = [
        { page: '/dashboard', views: Math.floor(Math.random() * 100) + 50 },
        { page: '/leads', views: Math.floor(Math.random() * 80) + 30 },
        { page: '/analytics', views: Math.floor(Math.random() * 60) + 20 },
        { page: '/properties', views: Math.floor(Math.random() * 40) + 15 },
        { page: '/contact', views: Math.floor(Math.random() * 30) + 10 },
      ].sort((a, b) => b.views - a.views);

      const eventTypes = ['page_view', 'button_click', 'form_submit', 'lead_created', 'conversion'];
      const recentEvents = Array.from({ length: 5 }, (_, i) => ({
        event: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        timestamp: new Date(Date.now() - i * 30000).toISOString(),
        user: Math.random() > 0.5 ? `User ${Math.floor(Math.random() * 100)}` : undefined,
      }));

      setLiveMetrics({
        activeUsers: newDataPoint.activeUsers,
        currentPageViews: newDataPoint.pageViews,
        eventsPerMinute: Math.round(eventsPerMinute),
        errorRate: Math.round(errorRate * 100) / 100,
        averageResponseTime: Math.round(avgResponseTime),
        topPages,
        recentEvents,
      });

    } catch (error) {
      logger.warn('Failed to update real-time data', { error });
      setIsConnected(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('no-NO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
          <span className={`font-medium ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
          {isConnected && (
            <div className="animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          )}
        </div>
        <Badge variant={isConnected ? 'default' : 'destructive'}>
          Real-time Analytics
        </Badge>
      </div>

      {/* Live Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {liveMetrics.activeUsers}
            </div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveMetrics.currentPageViews}</div>
            <p className="text-xs text-muted-foreground">This minute</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events/Min</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveMetrics.eventsPerMinute}</div>
            <p className="text-xs text-muted-foreground">Average rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${liveMetrics.errorRate > 1 ? 'text-red-500' : 'text-green-500'}`}>
              {liveMetrics.errorRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Last 5 minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveMetrics.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Users Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Active Users - Last 5 Minutes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={realtimeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="timestamp"
                    tickFormatter={formatTimestamp}
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
                    labelFormatter={(label) => formatTimestamp(label as string)}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="activeUsers" 
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    name="Active Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Events and Response Time */}
        <Card>
          <CardHeader>
            <CardTitle>Events & Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={realtimeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="timestamp"
                    tickFormatter={formatTimestamp}
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
                    labelFormatter={(label) => formatTimestamp(label as string)}
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
                    dataKey="responseTime" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Response Time (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages (Live)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {liveMetrics.topPages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <code className="text-sm font-mono">{page.page}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">{page.views}</div>
                    <div className="w-16 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(page.views / Math.max(...liveMetrics.topPages.map(p => p.views))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Live Event Stream</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {liveMetrics.recentEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <div className="text-sm font-medium">{event.event}</div>
                      {event.user && (
                        <div className="text-xs text-muted-foreground">{event.user}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimeAgo(event.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
