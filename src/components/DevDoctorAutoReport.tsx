import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface DevDoctorSummary {
  total_checks: number;
  passed: number;
  warnings: number; 
  errors: number;
  status: 'success' | 'warning' | 'error';
}

interface DevDoctorReport {
  timestamp: string;
  version: string;
  summary: DevDoctorSummary;
  environment: {
    node_version: string;
    platform: string;
    ci: boolean;
  };
  dependencies: {
    version_conflicts: boolean;
    corrupted_packages: number;
    misplaced_packages: number;
  };
  supabase: {
    environment_configured: boolean;
    rls_policies_checked: boolean;
    critical_security_issues: string[];
    warnings: string[];
  };
  recommendations: Array<{
    category: string;
    priority: string;
    message: string;
  }>;
}

interface Props {
  source?: string;
  refreshInterval?: number;
  className?: string;
}

export const DevDoctorAutoReport: React.FC<Props> = ({
  source = '/dev-doctor-report.json',
  refreshInterval = 60000, // 1 minute
  className = ''
}) => {
  const [report, setReport] = useState<DevDoctorReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchReport = async () => {
    try {
      const res = await fetch(source, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setReport(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch Dev Doctor report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    const interval = setInterval(fetchReport, refreshInterval);
    return () => clearInterval(interval);
  }, [source, refreshInterval]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧠 Dev Doctor Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Loading system health...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧠 Dev Doctor Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            ❌ No report available
            <div className="text-sm mt-1">
              Run <code>npm run dev:doctor</code> to generate
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { summary } = report;
  const statusConfig = {
    success: { badge: 'default', color: 'text-green-600', icon: '✅' },
    warning: { badge: 'secondary', color: 'text-yellow-600', icon: '⚠️' },
    error: { badge: 'destructive', color: 'text-red-600', icon: '❌' }
  };

  const config = statusConfig[summary.status] || statusConfig.error;
  const successRate = summary.total_checks > 0 ? (summary.passed / summary.total_checks) * 100 : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {config.icon} Dev Doctor Health Check
          </span>
          <Badge variant={config.badge as any}>
            {summary.status.toUpperCase()}
          </Badge>
        </CardTitle>
        <CardDescription>
          Last updated: {lastRefresh?.toLocaleString() || 'Unknown'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Success Rate Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Success Rate</span>
            <span>{Math.round(successRate)}%</span>
          </div>
          <Progress value={successRate} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
            <div className="text-xs text-muted-foreground">Passed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
            <div className="text-xs text-muted-foreground">Warnings</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{summary.errors}</div>
            <div className="text-xs text-muted-foreground">Errors</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{summary.total_checks}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>

        <Separator />

        {/* Environment Info */}
        <div className="text-sm space-y-1">
          <div className="font-medium">Environment</div>
          <div className="text-muted-foreground">
            {report.environment.node_version} • {report.environment.platform}
            {report.environment.ci && ' • CI'}
          </div>
        </div>

        {/* Critical Issues Alert */}
        {report.supabase.critical_security_issues.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 font-medium text-sm">
              🚨 Critical Security Issues
            </div>
            <div className="text-red-700 text-sm mt-1">
              {report.supabase.critical_security_issues.length} issue(s) require immediate attention
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchReport}>
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('/dev-doctor', '_blank')}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};