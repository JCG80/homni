import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target,
  Activity,
  Home,
  Mail,
  Zap,
  Calendar,
  FileText
} from 'lucide-react';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface UserAnalytics {
  totalRequests: number;
  propertiesManaged: number;
  documentsUploaded: number;
  averageResponseTime: number;
  conversionRate: number;
  activityScore: number;
  monthlyTrends: {
    labels: string[];
    requests: number[];
    properties: number[];
  };
  categoryBreakdown: {
    category: string;
    count: number;
    percentage: number;
  }[];
}

export const UserAnalyticsDashboard: React.FC = () => {
  const { user } = useIntegratedAuth();
  const { metrics, getPerformanceScore } = usePerformanceMonitoring();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserAnalytics();
    }
  }, [user]);

  const fetchUserAnalytics = async () => {
    try {
      // Simulate user analytics data
      const mockAnalytics: UserAnalytics = {
        totalRequests: 12,
        propertiesManaged: 1,
        documentsUploaded: 8,
        averageResponseTime: 2.5,
        conversionRate: 75,
        activityScore: 85,
        monthlyTrends: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun'],
          requests: [2, 4, 1, 3, 1, 1],
          properties: [0, 0, 1, 1, 1, 1]
        },
        categoryBreakdown: [
          { category: 'Maling', count: 5, percentage: 42 },
          { category: 'Tak', count: 3, percentage: 25 },
          { category: 'Rørlegger', count: 2, percentage: 17 },
          { category: 'Elektriker', count: 2, percentage: 16 }
        ]
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityLevel = (score: number) => {
    if (score >= 80) return { level: 'Høy', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 60) return { level: 'Middels', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { level: 'Lav', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const performanceScore = getPerformanceScore();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Ingen analytiske data tilgjengelig</p>
        </CardContent>
      </Card>
    );
  }

  const activityLevel = getActivityLevel(analytics.activityScore);

  const trendsData = {
    labels: analytics.monthlyTrends.labels,
    datasets: [
      {
        label: 'Forespørsler',
        data: analytics.monthlyTrends.requests,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Eiendommer',
        data: analytics.monthlyTrends.properties,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
      }
    ],
  };

  const categoryData = {
    labels: analytics.categoryBreakdown.map(c => c.category),
    datasets: [
      {
        label: 'Forespørsler',
        data: analytics.categoryBreakdown.map(c => c.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      }
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Dine analyser
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Oversikt</TabsTrigger>
            <TabsTrigger value="trends">Trender</TabsTrigger>
            <TabsTrigger value="performance">Ytelse</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total forespørsler</p>
                      <p className="text-2xl font-bold">{analytics.totalRequests}</p>
                    </div>
                    <Mail className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Eiendommer</p>
                      <p className="text-2xl font-bold">{analytics.propertiesManaged}</p>
                    </div>
                    <Home className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Dokumenter</p>
                      <p className="text-2xl font-bold">{analytics.documentsUploaded}</p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Score */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">Aktivitetsscore</h3>
                  <Badge className={`${activityLevel.bgColor} ${activityLevel.color}`}>
                    {activityLevel.level}
                  </Badge>
                </div>
                <Progress value={analytics.activityScore} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {analytics.activityScore}/100 - Basert på forespørsler, eiendommer og dokumenter
                </p>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-4">Forespørsler per kategori</h3>
                <div className="space-y-3">
                  {analytics.categoryBreakdown.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{category.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{category.count}</span>
                        <Badge variant="secondary" className="text-xs">
                          {category.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-4">Månedlige trender</h3>
                <div className="h-64">
                  <Line data={trendsData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-4">Kategorier fordeling</h3>
                <div className="h-64">
                  <Bar data={categoryData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">Ytelsesscore</h3>
                    <Badge variant={performanceScore >= 80 ? 'default' : performanceScore >= 60 ? 'secondary' : 'destructive'}>
                      {performanceScore}/100
                    </Badge>
                  </div>
                  <Progress value={performanceScore} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">Cache-treffrate</h3>
                    <span className="text-sm font-medium">
                      {metrics.cacheHitRate?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <Progress value={metrics.cacheHitRate || 0} className="h-2" />
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-4">Ytelsesmålinger</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Sidelastingstid</p>
                    <p className="text-lg font-semibold">
                      {metrics.pageLoadTime ? `${(metrics.pageLoadTime / 1000).toFixed(2)}s` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">First Contentful Paint</p>
                    <p className="text-lg font-semibold">
                      {metrics.firstContentfulPaint ? `${(metrics.firstContentfulPaint / 1000).toFixed(2)}s` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">First Input Delay</p>
                    <p className="text-lg font-semibold">
                      {metrics.firstInputDelay ? `${metrics.firstInputDelay.toFixed(0)}ms` : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};