/**
 * System Health Card for Master Admin Dashboard
 * Shows build status, test coverage, error rate, and latency metrics
 */

import React from 'react';
import { DashboardCard } from '../../DashboardCard';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useDashboardData } from '../../../hooks/useDashboardData';

interface SystemHealthData {
  buildStatus: 'passing' | 'failing' | 'pending';
  testCoverage: number;
  errorRate: number;
  latencyP95: number;
  lastDeployment: string;
  activeIncidents: number;
}

export const SystemHealthCard: React.FC = () => {
  const { data, isLoading, error } = useDashboardData<SystemHealthData>({
    queryKey: ['system-health'],
    fetcher: async () => {
      // Mock data - in real implementation, fetch from monitoring system
      return {
        buildStatus: 'passing' as const,
        testCoverage: 87,
        errorRate: 0.3,
        latencyP95: 156,
        lastDeployment: '2 timer siden',
        activeIncidents: 0
      };
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // 30 seconds
  });

  const getBuildStatusBadge = (status: string) => {
    switch (status) {
      case 'passing':
        return (
          <Badge variant="default" className="bg-success text-success-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            Passing
          </Badge>
        );
      case 'failing':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failing
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getHealthScore = (data: SystemHealthData): number => {
    let score = 100;
    if (data.buildStatus === 'failing') score -= 40;
    if (data.buildStatus === 'pending') score -= 20;
    if (data.testCoverage < 80) score -= 20;
    if (data.errorRate > 1) score -= 15;
    if (data.latencyP95 > 200) score -= 15;
    if (data.activeIncidents > 0) score -= 10;
    return Math.max(0, score);
  };

  return (
    <DashboardCard
      title="System Health"
      isLoading={isLoading}
      error={error}
      empty={!data}
      metric={data ? {
        label: 'System Health Score',
        value: getHealthScore(data),
        format: 'percentage' as const,
        change: {
          value: 2.5,
          trend: 'up' as const,
          period: '24h'
        }
      } : undefined}
    >
      {data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Build Status</span>
            {getBuildStatusBadge(data.buildStatus)}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Test Coverage</div>
              <div className="font-medium">{data.testCoverage}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">Error Rate</div>
              <div className="font-medium">{data.errorRate}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">Latency P95</div>
              <div className="font-medium">{data.latencyP95}ms</div>
            </div>
            <div>
              <div className="text-muted-foreground">Incidents</div>
              <div className="font-medium flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {data.activeIncidents}
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Siste deployment: {data.lastDeployment}
            </div>
          </div>
        </div>
      )}
    </DashboardCard>
  );
};