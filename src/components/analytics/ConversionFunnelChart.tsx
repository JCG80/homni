import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, Cell } from 'recharts';
import { TrendingUp, Target } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';
import { analyticsService } from '@/lib/analytics/analyticsService';
import { logger } from '@/utils/logger';

interface FunnelStep {
  name: string;
  value: number;
  conversion?: number;
}

interface ConversionData {
  funnel: FunnelStep[];
  conversions: { date: string; conversions: number; total: number; rate: number }[];
  topConversions: { type: string; count: number; value?: number }[];
}

export const ConversionFunnelChart = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conversionData, setConversionData] = useState<ConversionData>({
    funnel: [],
    conversions: [],
    topConversions: [],
  });

  useEffect(() => {
    if (user?.id) {
      fetchConversionData();
    }
  }, [user?.id]);

  const fetchConversionData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const dateRange = {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      };

      const activitySummary = await analyticsService.getUserActivitySummary(user.id, dateRange);

      // Calculate funnel data
      const totalSessions = activitySummary.reduce((sum, day) => sum + day.session_count, 0);
      const totalEvents = activitySummary.reduce((sum, day) => sum + day.total_events, 0);
      const totalConversions = activitySummary.reduce((sum, day) => sum + day.conversion_events, 0);

      // Simulate funnel steps (in real implementation, track these specifically)
      const funnelSteps: FunnelStep[] = [
        { name: 'Visitors', value: totalSessions },
        { name: 'Engagement', value: Math.round(totalSessions * 0.7), conversion: 70 },
        { name: 'Interest', value: Math.round(totalSessions * 0.4), conversion: 57 },
        { name: 'Intent', value: Math.round(totalSessions * 0.15), conversion: 37.5 },
        { name: 'Conversion', value: totalConversions, conversion: totalSessions > 0 ? (totalConversions / totalSessions) * 100 : 0 },
      ];

      // Daily conversion data
      const conversionsByDate = activitySummary
        .sort((a, b) => new Date(a.date_summary).getTime() - new Date(b.date_summary).getTime())
        .slice(-14) // Last 14 days
        .map(summary => ({
          date: new Date(summary.date_summary).toLocaleDateString('no-NO', { 
            month: 'short', 
            day: 'numeric' 
          }),
          conversions: summary.conversion_events,
          total: summary.total_events,
          rate: summary.total_events > 0 ? (summary.conversion_events / summary.total_events) * 100 : 0,
        }));

      // Top conversion types (simulated - in real implementation, track by event properties)
      const topConversions = [
        { type: 'Lead Submission', count: Math.round(totalConversions * 0.4), value: 1200 },
        { type: 'Quote Request', count: Math.round(totalConversions * 0.3), value: 800 },
        { type: 'Contact Form', count: Math.round(totalConversions * 0.2), value: 400 },
        { type: 'Phone Call', count: Math.round(totalConversions * 0.1), value: 200 },
      ].filter(item => item.count > 0);

      setConversionData({
        funnel: funnelSteps,
        conversions: conversionsByDate,
        topConversions,
      });
    } catch (error) {
      logger.warn('Failed to fetch conversion data', { error });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(var(--muted))',
    'hsl(var(--destructive))',
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversionData.funnel.map((step, index) => (
              <div key={step.name} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <div>
                    <div className="font-medium">{step.name}</div>
                    {step.conversion !== undefined && (
                      <div className="text-sm text-muted-foreground">
                        {step.conversion.toFixed(1)}% conversion
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{step.value.toLocaleString()}</div>
                  {index > 0 && conversionData.funnel[index - 1] && (
                    <div className="text-sm text-muted-foreground">
                      {((step.value / conversionData.funnel[index - 1].value) * 100).toFixed(1)}% of previous
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rate Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Conversion Rate Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionData.conversions}>
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
                  formatter={(value, name) => [
                    name === 'rate' ? `${Number(value).toFixed(1)}%` : value,
                    name === 'rate' ? 'Conversion Rate' : name === 'conversions' ? 'Conversions' : 'Total Events'
                  ]}
                />
                <Bar 
                  dataKey="rate" 
                  fill="hsl(var(--primary))" 
                  name="Conversion Rate (%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Conversion Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Conversion Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conversionData.topConversions.map((conversion, index) => (
                <div key={conversion.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="font-medium">{conversion.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{conversion.count}</div>
                    {conversion.value && (
                      <div className="text-sm text-muted-foreground">
                        ${conversion.value.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Conversions</span>
                <span className="font-bold text-lg">
                  {conversionData.topConversions.reduce((sum, c) => sum + c.count, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Value</span>
                <span className="font-bold text-lg">
                  ${conversionData.topConversions.reduce((sum, c) => sum + (c.value || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Avg. Value</span>
                <span className="font-bold text-lg">
                  ${Math.round(
                    conversionData.topConversions.reduce((sum, c) => sum + (c.value || 0), 0) / 
                    Math.max(conversionData.topConversions.reduce((sum, c) => sum + c.count, 0), 1)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Overall Rate</span>
                <span className="font-bold text-lg text-primary">
                  {conversionData.funnel.length > 0 && conversionData.funnel[0].value > 0
                    ? ((conversionData.funnel[conversionData.funnel.length - 1]?.value || 0) / conversionData.funnel[0].value * 100).toFixed(1)
                    : '0.0'
                  }%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};