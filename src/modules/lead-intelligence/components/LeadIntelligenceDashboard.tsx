/**
 * Lead Intelligence Dashboard
 * Advanced analytics, scoring, and business intelligence for lead management
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  Target, 
  MapPin, 
  Brain, 
  BarChart3, 
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Zap
} from 'lucide-react';
import { useLeadScoring } from '../hooks/useLeadScoring';
import { useGeographicOptimization } from '../hooks/useGeographicOptimization';
import { useLeadsData } from '@/hooks/useLeadsData';
import { SCORE_RANGES } from '@/types/lead-intelligence';
import { cn } from '@/lib/utils';

export const LeadIntelligenceDashboard: React.FC = () => {
  const { leads, stats, loading: leadsLoading } = useLeadsData();
  const { scores, loading: scoringLoading, bulkCalculateScores, getScoreRange } = useLeadScoring();
  const { analysis, loading: geoLoading, optimizeDistribution } = useGeographicOptimization();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [distributionResults, setDistributionResults] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (leads.length > 0 && Object.keys(scores).length === 0) {
      bulkCalculateScores(leads);
    }
  }, [leads, scores, bulkCalculateScores]);

  // Calculate intelligence metrics
  const intelligenceMetrics = React.useMemo(() => {
    const scoredLeads = leads.filter(lead => scores[lead.id]);
    const totalScore = scoredLeads.reduce((sum, lead) => sum + (scores[lead.id]?.total_score || 0), 0);
    const avgScore = scoredLeads.length > 0 ? totalScore / scoredLeads.length : 0;
    
    const conversionProbability = scoredLeads.reduce((sum, lead) => sum + (scores[lead.id]?.conversion_probability || 0), 0) / scoredLeads.length;
    const estimatedValue = scoredLeads.reduce((sum, lead) => sum + (scores[lead.id]?.value_estimate || 0), 0);
    
    const qualityDistribution = {
      excellent: scoredLeads.filter(lead => getScoreRange(scores[lead.id]?.total_score || 0) === 'excellent').length,
      good: scoredLeads.filter(lead => getScoreRange(scores[lead.id]?.total_score || 0) === 'good').length,
      fair: scoredLeads.filter(lead => getScoreRange(scores[lead.id]?.total_score || 0) === 'fair').length,
      poor: scoredLeads.filter(lead => getScoreRange(scores[lead.id]?.total_score || 0) === 'poor').length
    };

    return {
      avgScore,
      conversionProbability,
      estimatedValue,
      qualityDistribution,
      scoredLeadsCount: scoredLeads.length
    };
  }, [leads, scores, getScoreRange]);

  const handleOptimizeDistribution = async () => {
    const results = await optimizeDistribution(leads);
    setDistributionResults(results);
  };

  const loading = leadsLoading || scoringLoading || geoLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Lead Intelligence</h1>
            <p className="text-muted-foreground">Advanced analytics and optimization</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lead Intelligence</h1>
          <p className="text-muted-foreground">
            AI-powered scoring, geographic optimization, and business intelligence
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleOptimizeDistribution} variant="outline">
            <MapPin className="w-4 h-4 mr-2" />
            Optimize Distribution
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Lead Score</p>
                <p className="text-2xl font-bold">
                  {intelligenceMetrics.avgScore.toFixed(0)}
                </p>
              </div>
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                intelligenceMetrics.avgScore >= 70 ? "bg-success/10" : 
                intelligenceMetrics.avgScore >= 50 ? "bg-warning/10" : "bg-destructive/10"
              )}>
                <Target className={cn(
                  "w-6 h-6",
                  intelligenceMetrics.avgScore >= 70 ? "text-success" : 
                  intelligenceMetrics.avgScore >= 50 ? "text-warning" : "text-destructive"
                )} />
              </div>
            </div>
            <Progress 
              value={intelligenceMetrics.avgScore} 
              className="mt-3" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Probability</p>
                <p className="text-2xl font-bold">
                  {(intelligenceMetrics.conversionProbability * 100).toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <span className="text-success">↑ 12%</span> from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Value</p>
                <p className="text-2xl font-bold">
                  {(intelligenceMetrics.estimatedValue / 1000).toFixed(0)}k NOK
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Pipeline value estimate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Intelligence Score</p>
                <p className="text-2xl font-bold">A+</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-warning" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              AI optimization active
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="scoring" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Lead Scoring
          </TabsTrigger>
          <TabsTrigger value="geographic" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Geographic
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Predictions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quality Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Lead Quality Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(intelligenceMetrics.qualityDistribution).map(([range, count]) => {
                  const scoreRange = range as keyof typeof SCORE_RANGES;
                  const percentage = intelligenceMetrics.scoredLeadsCount > 0 ? (count / intelligenceMetrics.scoredLeadsCount) * 100 : 0;
                  
                  return (
                    <div key={range} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: SCORE_RANGES[scoreRange].color }}
                        />
                        <span className="capitalize text-sm">{range}</span>
                        <span className="text-xs text-muted-foreground">
                          ({SCORE_RANGES[scoreRange].min}-{SCORE_RANGES[scoreRange].max})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count}</span>
                        <Badge variant="outline" className="text-xs">
                          {percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lead Quality Trend</span>
                    <Badge className="bg-success text-success-foreground">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Improving
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Time</span>
                    <Badge className="bg-warning text-warning-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      2.3h avg
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Geographic Coverage</span>
                    <Badge className="bg-primary text-primary-foreground">
                      <MapPin className="w-3 h-3 mr-1" />
                      85% optimal
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scoring" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Scoring Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.slice(0, 10).map(lead => {
                    const score = scores[lead.id];
                    if (!score) return null;
                    
                    const scoreRange = getScoreRange(score.total_score);
                    
                    return (
                      <div key={lead.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{lead.title}</h4>
                            <p className="text-sm text-muted-foreground">{lead.category}</p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant="outline"
                              style={{ backgroundColor: SCORE_RANGES[scoreRange].color + '20' }}
                            >
                              {score.total_score} / 100
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Behavioral</div>
                            <div className="font-medium">{score.behavioral_score}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Engagement</div>
                            <div className="font-medium">{score.engagement_score}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Value Est.</div>
                            <div className="font-medium">{(score.value_estimate / 1000).toFixed(0)}k NOK</div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Progress value={score.total_score} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4" />
                <p>Geographic analysis and optimization tools</p>
                <p className="text-sm">Coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-4" />
                <p>AI-powered predictions and forecasts</p>
                <p className="text-sm">Coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};