import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FileText, Download, Calendar, TrendingUp, Users, DollarSign, Target, Zap } from 'lucide-react';
import { analyticsService } from '@/lib/analytics/analyticsService';
import { useToast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

interface BIReport {
  id: string;
  report_name: string;
  report_type: string;
  report_data: any;
  generated_at: string;
  status: string;
}

interface ReportData {
  userGrowth: { month: string; users: number; growth: number }[];
  revenueAnalysis: { category: string; revenue: number; profit: number }[];
  leadConversion: { source: string; leads: number; conversions: number; rate: number }[];
  marketSegments: { segment: string; users: number; value: number; percentage: number }[];
  performanceMetrics: { metric: string; current: number; target: number; variance: number }[];
}

export const BusinessIntelligenceReports = () => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<BIReport[]>([]);
  const [reportData, setReportData] = useState<ReportData>({
    userGrowth: [],
    revenueAnalysis: [],
    leadConversion: [],
    marketSegments: [],
    performanceMetrics: [],
  });
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchExistingReports();
    generateCurrentReportData();
  }, [selectedPeriod]);

  const fetchExistingReports = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from the bi_reports table
      // For now, we'll simulate some existing reports
      const mockReports: BIReport[] = [
        {
          id: '1',
          report_name: 'Monthly Business Review',
          report_type: 'monthly',
          report_data: {},
          generated_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          status: 'completed',
        },
        {
          id: '2',
          report_name: 'Quarterly Performance Analysis',
          report_type: 'quarterly',
          report_data: {},
          generated_at: new Date(Date.now() - 7 * 86400000).toISOString(), // Week ago
          status: 'completed',
        },
        {
          id: '3',
          report_name: 'Weekly Growth Report',
          report_type: 'weekly',
          report_data: {},
          generated_at: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
          status: 'completed',
        },
      ];

      setReports(mockReports);
    } catch (error) {
      logger.warn('Failed to fetch BI reports', { error });
      toast({
        title: 'Error fetching reports',
        description: 'Could not load existing business intelligence reports.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCurrentReportData = async () => {
    try {
      // Generate comprehensive BI data based on period
      const periodMultiplier = selectedPeriod === 'weekly' ? 1 : selectedPeriod === 'monthly' ? 4 : 12;
      
      // User Growth Data
      const userGrowth = Array.from({ length: periodMultiplier }, (_, i) => {
        const baseUsers = 1000 + i * 150;
        const growth = Math.random() * 20 + 5; // 5-25% growth
        return {
          month: selectedPeriod === 'weekly' 
            ? `Week ${i + 1}` 
            : selectedPeriod === 'monthly' 
            ? `Month ${i + 1}`
            : `Q${Math.floor(i / 3) + 1}`,
          users: Math.round(baseUsers * (1 + growth / 100)),
          growth: Math.round(growth * 10) / 10,
        };
      });

      // Revenue Analysis
      const revenueAnalysis = [
        { category: 'Lead Generation', revenue: 45000, profit: 18000 },
        { category: 'Property Services', revenue: 32000, profit: 12800 },
        { category: 'Insurance Matching', revenue: 28000, profit: 14000 },
        { category: 'Premium Features', revenue: 15000, profit: 12000 },
        { category: 'Advertising', revenue: 8000, profit: 6400 },
      ];

      // Lead Conversion Analysis
      const leadConversion = [
        { source: 'Organic Search', leads: 1250, conversions: 312, rate: 24.96 },
        { source: 'Social Media', leads: 890, conversions: 187, rate: 21.01 },
        { source: 'Direct Traffic', leads: 650, conversions: 169, rate: 26.0 },
        { source: 'Referrals', leads: 420, conversions: 134, rate: 31.9 },
        { source: 'Email Marketing', leads: 380, conversions: 99, rate: 26.05 },
        { source: 'Paid Ads', leads: 320, conversions: 70, rate: 21.88 },
      ];

      // Market Segments
      const marketSegments = [
        { segment: 'Private Homeowners', users: 45, value: 890000, percentage: 45 },
        { segment: 'Small Businesses', users: 30, value: 720000, percentage: 30 },
        { segment: 'Property Investors', users: 15, value: 450000, percentage: 15 },
        { segment: 'Large Enterprises', users: 10, value: 340000, percentage: 10 },
      ];

      // Performance Metrics
      const performanceMetrics = [
        { metric: 'Customer Acquisition Cost', current: 185, target: 150, variance: -18.9 },
        { metric: 'Customer Lifetime Value', current: 2450, target: 2200, variance: 11.4 },
        { metric: 'Conversion Rate', current: 24.5, target: 22.0, variance: 11.4 },
        { metric: 'Churn Rate', current: 3.2, target: 5.0, variance: 36.0 },
        { metric: 'Monthly Recurring Revenue', current: 125000, target: 120000, variance: 4.2 },
        { metric: 'Net Promoter Score', current: 68, target: 60, variance: 13.3 },
      ];

      setReportData({
        userGrowth,
        revenueAnalysis,
        leadConversion,
        marketSegments,
        performanceMetrics,
      });
    } catch (error) {
      logger.warn('Failed to generate report data', { error });
    }
  };

  const generateReport = async (reportType: string) => {
    try {
      setGeneratingReport(reportType);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newReport: BIReport = {
        id: Date.now().toString(),
        report_name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Business Report`,
        report_type: reportType,
        report_data: reportData,
        generated_at: new Date().toISOString(),
        status: 'completed',
      };

      setReports(prev => [newReport, ...prev]);
      
      toast({
        title: 'Report generated successfully',
        description: `Your ${reportType} business intelligence report is ready.`,
      });
    } catch (error) {
      logger.warn('Failed to generate report', { error });
      toast({
        title: 'Report generation failed',
        description: 'There was an error generating the business report.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingReport(null);
    }
  };

  const exportReport = (report: BIReport) => {
    // In a real implementation, this would generate and download a PDF or Excel file
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.report_name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Report exported',
      description: 'The report has been downloaded to your device.',
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Intelligence Reports</h2>
          <p className="text-muted-foreground">Comprehensive business analytics and insights</p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
          
          {['daily', 'weekly', 'monthly', 'quarterly'].map(type => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              onClick={() => generateReport(type)}
              disabled={generatingReport === type}
            >
              {generatingReport === type ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="growth">Growth Analysis</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="conversion">Lead Conversion</TabsTrigger>
          <TabsTrigger value="reports">Generated Reports</TabsTrigger>
        </TabsList>

        {/* Executive Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$128,000</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">+12.5%</span> from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">+8.2%</span> from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.5%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">+2.1%</span> from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer LTV</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,450</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">+11.4%</span> vs target
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.performanceMetrics.map((metric, index) => (
                  <div key={metric.metric} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{metric.metric}</div>
                        <div className="text-sm text-muted-foreground">
                          Target: {metric.target.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{metric.current.toLocaleString()}</div>
                      <div className={`text-sm ${metric.variance > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.variance > 0 ? '+' : ''}{metric.variance.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Growth Analysis */}
        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Users"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="growth" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Growth %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Analysis */}
        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.revenueAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                      <Bar dataKey="profit" fill="#82ca9d" name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.marketSegments}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ segment, percentage }) => `${segment} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="users"
                      >
                        {reportData.marketSegments.map((entry, index) => (
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

        {/* Lead Conversion */}
        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>Lead Conversion by Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.leadConversion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="leads" fill="#8884d8" name="Total Leads" />
                    <Bar dataKey="conversions" fill="#82ca9d" name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generated Reports */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map(report => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{report.report_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Generated on {new Date(report.generated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                        {report.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportReport(report)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
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