import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Target, TrendingUp, Clock, Star, Filter, Download } from 'lucide-react';
import { analyticsService } from '@/lib/analytics/analyticsService';
import { useAuth } from '@/modules/auth/hooks';
import { logger } from '@/utils/logger';

interface LeadScoring {
  leadId: string;
  score: number;
  factors: {
    engagement: number;
    demographics: number;
    behavior: number;
    timing: number;
  };
  prediction: 'high' | 'medium' | 'low';
  confidence: number;
}

interface ConversionFunnel {
  stage: string;
  count: number;
  conversionRate: number;
  averageTimeToNext: number; // in days
  dropoffRate: number;
}

interface LeadQuality {
  source: string;
  totalLeads: number;
  qualifiedLeads: number;
  qualityScore: number;
  avgLifetimeValue: number;
  conversionRate: number;
}

interface ResponseTimeAnalytics {
  timeRange: string;
  averageResponse: number;
  conversionRate: number;
  leads: number;
}

export const LeadAnalyticsEnhanced = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedSource, setSelectedSource] = useState('all');
  
  const [leadScoring, setLeadScoring] = useState<LeadScoring[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel[]>([]);
  const [leadQuality, setLeadQuality] = useState<LeadQuality[]>([]);
  const [responseAnalytics, setResponseAnalytics] = useState<ResponseTimeAnalytics[]>([]);
  const [predictionAccuracy, setPredictionAccuracy] = useState(0);

  useEffect(() => {
    fetchLeadAnalytics();
  }, [timeRange, selectedSource, profile?.company_id]);

  const fetchLeadAnalytics = async () => {
    setLoading(true);
    try {
      // Generate realistic lead analytics data
      const scoring: LeadScoring[] = Array.from({ length: 20 }, (_, i) => ({
        leadId: `lead_${i + 1}`,
        score: Math.random() * 100,
        factors: {
          engagement: Math.random() * 25,
          demographics: Math.random() * 25,
          behavior: Math.random() * 25,
          timing: Math.random() * 25,
        },
        prediction: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
        confidence: 65 + Math.random() * 30,
      }));

      const funnel: ConversionFunnel[] = [
        { stage: 'Initial Contact', count: 1247, conversionRate: 100, averageTimeToNext: 0.5, dropoffRate: 0 },
        { stage: 'Qualified', count: 936, conversionRate: 75.1, averageTimeToNext: 2.3, dropoffRate: 24.9 },
        { stage: 'Interested', count: 654, conversionRate: 52.4, averageTimeToNext: 4.7, dropoffRate: 30.1 },
        { stage: 'Proposal Sent', count: 387, conversionRate: 31.0, averageTimeToNext: 7.2, dropoffRate: 40.8 },
        { stage: 'Negotiation', count: 198, conversionRate: 15.9, averageTimeToNext: 12.5, dropoffRate: 48.8 },
        { stage: 'Closed Won', count: 124, conversionRate: 9.9, averageTimeToNext: 0, dropoffRate: 37.4 },
      ];

      const quality: LeadQuality[] = [
        { source: 'Google Ads', totalLeads: 342, qualifiedLeads: 287, qualityScore: 84, avgLifetimeValue: 2850, conversionRate: 18.4 },
        { source: 'Facebook', totalLeads: 298, qualifiedLeads: 234, qualityScore: 78, avgLifetimeValue: 2640, conversionRate: 15.8 },
        { source: 'Organic Search', totalLeads: 267, qualifiedLeads: 231, qualityScore: 87, avgLifetimeValue: 3120, conversionRate: 22.1 },
        { source: 'Referrals', totalLeads: 189, qualifiedLeads: 167, qualityScore: 92, avgLifetimeValue: 3890, conversionRate: 28.6 },
        { source: 'Direct', totalLeads: 151, qualifiedLeads: 128, qualityScore: 85, avgLifetimeValue: 3250, conversionRate: 19.2 },
      ];

      const response: ResponseTimeAnalytics[] = [
        { timeRange: '0-1h', averageResponse: 0.5, conversionRate: 32.4, leads: 234 },
        { timeRange: '1-2h', averageResponse: 1.5, conversionRate: 28.7, leads: 189 },
        { timeRange: '2-4h', averageResponse: 3, conversionRate: 24.3, leads: 167 },
        { timeRange: '4-8h', averageResponse: 6, conversionRate: 19.8, leads: 145 },
        { timeRange: '8-24h', averageResponse: 16, conversionRate: 14.2, leads: 123 },
        { timeRange: '24h+', averageResponse: 48, conversionRate: 8.9, leads: 89 },
      ];

      setLeadScoring(scoring);
      setConversionFunnel(funnel);
      setLeadQuality(quality);
      setResponseAnalytics(response);
      setPredictionAccuracy(78.5);

    } catch (error) {
      logger.warn('Failed to fetch lead analytics', { error });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPredictionBadge = (prediction: string) => {
    switch (prediction) {
      case 'high':
        return <Badge className="bg-green-100 text-green-800">High Conversion</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Conversion</Badge>;
      case 'low':
        return <Badge className="bg-red-100 text-red-800">Low Conversion</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
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
      {/* Filters and Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedSource} onValueChange={setSelectedSource}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="google">Google Ads</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="organic">Organic Search</SelectItem>
            <SelectItem value="referrals">Referrals</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          More Filters
        </Button>

        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Prediction Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictionAccuracy}%</div>
            <p className="text-xs text-muted-foreground">AI model accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High-Score Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leadScoring.filter(l => l.score >= 80).length}
            </div>
            <p className="text-xs text-muted-foreground">Score ≥ 80</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3h</div>
            <p className="text-xs text-muted-foreground">15% improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Source Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92</div>
            <p className="text-xs text-muted-foreground">Referrals</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversionFunnel.map((stage, index) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{stage.stage}</span>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{stage.count.toLocaleString()} leads</span>
                    <span>{stage.averageTimeToNext > 0 && `${stage.averageTimeToNext}d avg`}</span>
                    <Badge variant={stage.conversionRate > 50 ? 'default' : stage.conversionRate > 20 ? 'secondary' : 'destructive'}>
                      {stage.conversionRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={stage.conversionRate} className="h-3" />
                {index < conversionFunnel.length - 1 && stage.dropoffRate > 0 && (
                  <div className="text-xs text-red-600 ml-2">
                    -{stage.dropoffRate.toFixed(1)}% dropoff to next stage
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Scoring Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={leadScoring}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="score" domain={[0, 100]} />
                  <YAxis dataKey="confidence" domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${Number(value).toFixed(1)}`,
                      name === 'score' ? 'Lead Score' : 'Confidence'
                    ]}
                  />
                  <Scatter 
                    dataKey="confidence" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.6}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Response Time Impact */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time vs Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={responseAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timeRange" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'conversionRate' ? `${Number(value).toFixed(1)}%` : Number(value).toLocaleString(),
                      name === 'conversionRate' ? 'Conversion Rate' : 'Leads'
                    ]}
                  />
                  <Bar dataKey="conversionRate" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Quality by Source */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Quality Analysis by Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leadQuality.map((source) => (
              <div key={source.source} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium">{source.source}</span>
                    <Badge variant={source.qualityScore >= 85 ? 'default' : source.qualityScore >= 75 ? 'secondary' : 'destructive'}>
                      Quality: {source.qualityScore}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                      <div className="font-medium text-foreground">{source.totalLeads}</div>
                      <div>Total Leads</div>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{source.qualifiedLeads}</div>
                      <div>Qualified</div>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{source.conversionRate}%</div>
                      <div>Conversion</div>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {source.avgLifetimeValue.toLocaleString('no-NO', { style: 'currency', currency: 'NOK' })}
                      </div>
                      <div>Avg LTV</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Scoring Leads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Top Scoring Leads (Prediction Ready)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leadScoring
              .sort((a, b) => b.score - a.score)
              .slice(0, 10)
              .map((lead) => (
                <div key={lead.leadId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`text-lg font-bold ${getScoreColor(lead.score)}`}>
                      {Math.round(lead.score)}
                    </div>
                    <div>
                      <div className="font-medium">{lead.leadId}</div>
                      <div className="text-sm text-muted-foreground">
                        {lead.confidence.toFixed(1)}% confidence
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPredictionBadge(lead.prediction)}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};