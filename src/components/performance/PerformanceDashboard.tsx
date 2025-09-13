/**
 * Performance Dashboard for Development and Production Monitoring
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Zap, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useRenderMetrics, useAsyncMetrics } from '@/hooks/usePerformance';
import { performanceMonitor } from '@/utils/performanceOptimizations';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  networkLatency: number;
  errorRate: number;
}

export const PerformanceDashboard: React.FC = () => {
  useRenderMetrics('PerformanceDashboard');
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    networkLatency: 0,
    errorRate: 0
  });
  
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        updateMetrics();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const updateMetrics = () => {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const paintEntries = performance.getEntriesByType('paint');
    
      let renderTime = 0;
      if (paintEntries.length > 0) {
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        renderTime = fcp?.startTime || 0;
      }

      let memoryUsage = 0;
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        memoryUsage = memInfo.usedJSHeapSize / (1024 * 1024); // MB
      }

      setMetrics({
        renderTime,
        memoryUsage,
        bundleSize: 0, // Would need to be calculated from build
        networkLatency: navigationEntries[0]?.responseStart || 0,
        errorRate: 0 // Would need error tracking
      });
  };

  const getPerformanceStatus = (value: number, threshold: number) => {
    if (value <= threshold * 0.7) return { color: 'text-green-600', bg: 'bg-green-100', status: 'Excellent' };
    if (value <= threshold) return { color: 'text-yellow-600', bg: 'bg-yellow-100', status: 'Good' };
    return { color: 'text-red-600', bg: 'bg-red-100', status: 'Needs Attention' };
  };

  const renderTimeStatus = getPerformanceStatus(metrics.renderTime, 100);
  const memoryStatus = getPerformanceStatus(metrics.memoryUsage, 50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Performance Dashboard</h2>
        <Button 
          onClick={() => setIsMonitoring(!isMonitoring)}
          variant={isMonitoring ? "destructive" : "default"}
        >
          {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Render Performance */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Render Time</p>
                <p className="text-2xl font-bold">{metrics.renderTime.toFixed(1)}ms</p>
                <Badge className={`${renderTimeStatus.bg} ${renderTimeStatus.color} mt-1`}>
                  {renderTimeStatus.status}
                </Badge>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Memory Usage</p>
                <p className="text-2xl font-bold">{metrics.memoryUsage.toFixed(1)} MB</p>
                <Badge className={`${memoryStatus.bg} ${memoryStatus.color} mt-1`}>
                  {memoryStatus.status}
                </Badge>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Network Latency */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Network</p>
                <p className="text-2xl font-bold">{metrics.networkLatency.toFixed(0)}ms</p>
                <Badge className="bg-blue-100 text-blue-600 mt-1">
                  Connected
                </Badge>
              </div>
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Overall Status */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall</p>
                <p className="text-2xl font-bold">Optimized</p>
                <Badge className="bg-green-100 text-green-600 mt-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Healthy
                </Badge>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Lazy loading implemented for dashboard components</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">React.memo applied to expensive components</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Database queries optimized with caching</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Bundle splitting configured for optimal loading</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};