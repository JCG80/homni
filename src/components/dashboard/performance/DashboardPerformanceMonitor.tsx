import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Clock, Database, Zap } from 'lucide-react';
import { measureAsync } from '@/utils/performance';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  apiCalls: number;
  errorRate: number;
  lastUpdate: string;
}

interface PerformanceThresholds {
  loadTime: { good: number; warning: number };
  renderTime: { good: number; warning: number };
  memoryUsage: { good: number; warning: number };
  cacheHitRate: { good: number; warning: number };
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  loadTime: { good: 1000, warning: 2000 }, // ms
  renderTime: { good: 100, warning: 300 }, // ms
  memoryUsage: { good: 50, warning: 100 }, // MB
  cacheHitRate: { good: 80, warning: 60 }, // %
};

const getStatusColor = (value: number, thresholds: { good: number; warning: number }, inverted = false) => {
  if (inverted) {
    // For cache hit rate (higher is better)
    if (value >= thresholds.good) return 'text-success bg-success/10';
    if (value >= thresholds.warning) return 'text-warning bg-warning/10';
    return 'text-destructive bg-destructive/10';
  } else {
    // For load time, memory usage (lower is better)
    if (value <= thresholds.good) return 'text-success bg-success/10';
    if (value <= thresholds.warning) return 'text-warning bg-warning/10';
    return 'text-destructive bg-destructive/10';
  }
};

const formatMemory = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
};

/**
 * Dashboard Performance Monitor
 * Tracks and displays real-time performance metrics for dashboard optimization
 */
export const DashboardPerformanceMonitor: React.FC<{
  enabled?: boolean;
  showDetails?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}> = ({ 
  enabled = process.env.NODE_ENV === 'development', 
  showDetails = false,
  onMetricsUpdate 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    apiCalls: 0,
    errorRate: 0,
    lastUpdate: new Date().toISOString(),
  });

  const [isCollecting, setIsCollecting] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let startTime = Date.now();
    let renderStartTime = performance.now();
    
    // Measure initial load time
    const measureLoadTime = () => {
      const loadTime = Date.now() - startTime;
      const renderTime = performance.now() - renderStartTime;
      
      setMetrics(prev => ({
        ...prev,
        loadTime,
        renderTime,
        lastUpdate: new Date().toISOString(),
      }));
    };

    // Measure memory usage
    const measureMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize;
        
        setMetrics(prev => ({
          ...prev,
          memoryUsage,
          lastUpdate: new Date().toISOString(),
        }));
      }
    };

    // Collect performance metrics
    const collectMetrics = async () => {
      setIsCollecting(true);
      
      try {
        await measureAsync(async () => {
          measureLoadTime();
          measureMemoryUsage();
          
          // Simulate cache hit rate calculation
          const cacheHitRate = Math.round(75 + Math.random() * 20); // Mock 75-95%
          
          setMetrics(prev => ({
            ...prev,
            cacheHitRate,
            apiCalls: prev.apiCalls + 1,
            lastUpdate: new Date().toISOString(),
          }));
          
          if (onMetricsUpdate) {
            onMetricsUpdate(metrics);
          }
        }, 'dashboard-performance-collection');
      } catch (error) {
        setMetrics(prev => ({
          ...prev,
          errorRate: prev.errorRate + 1,
        }));
      } finally {
        setIsCollecting(false);
      }
    };

    // Initial collection
    collectMetrics();

    // Set up periodic collection
    const interval = setInterval(collectMetrics, 5000); // Every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, [enabled, onMetricsUpdate]);

  if (!enabled) return null;

  const overallHealth = (() => {
    const scores = [
      metrics.loadTime <= DEFAULT_THRESHOLDS.loadTime.good ? 100 : 
      metrics.loadTime <= DEFAULT_THRESHOLDS.loadTime.warning ? 70 : 30,
      
      metrics.renderTime <= DEFAULT_THRESHOLDS.renderTime.good ? 100 :
      metrics.renderTime <= DEFAULT_THRESHOLDS.renderTime.warning ? 70 : 30,
      
      metrics.cacheHitRate >= DEFAULT_THRESHOLDS.cacheHitRate.good ? 100 :
      metrics.cacheHitRate >= DEFAULT_THRESHOLDS.cacheHitRate.warning ? 70 : 30,
    ];
    
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  })();

  return (
    <Card className="border-l-4 border-l-info">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span>Performance</span>
            {isCollecting && (
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            )}
          </div>
          <Badge variant="outline" className={
            overallHealth >= 80 ? 'border-success text-success' :
            overallHealth >= 60 ? 'border-warning text-warning' :
            'border-destructive text-destructive'
          }>
            {overallHealth}%
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Health */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Dashboard Health</span>
            <span className="font-medium">{overallHealth}%</span>
          </div>
          <Progress value={overallHealth} className="h-2" />
        </div>

        {showDetails && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Load Time</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(metrics.loadTime, DEFAULT_THRESHOLDS.loadTime)}
                  >
                    {metrics.loadTime}ms
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Render</span>
                  </div>
                  <Badge 
                    variant="outline"
                    className={getStatusColor(metrics.renderTime, DEFAULT_THRESHOLDS.renderTime)}
                  >
                    {metrics.renderTime.toFixed(1)}ms
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    <span>Cache Hit</span>
                  </div>
                  <Badge 
                    variant="outline"
                    className={getStatusColor(metrics.cacheHitRate, DEFAULT_THRESHOLDS.cacheHitRate, true)}
                  >
                    {metrics.cacheHitRate}%
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>Memory</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatMemory(metrics.memoryUsage)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="pt-2 border-t text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>API Calls: {metrics.apiCalls}</span>
                <span>Errors: {metrics.errorRate}</span>
              </div>
              <div className="text-xs mt-1">
                Last updated: {new Date(metrics.lastUpdate).toLocaleTimeString('no-NO')}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Hook for accessing performance metrics in components
 */
export const useDashboardPerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  
  const startMeasurement = (operationName: string) => {
    const startTime = performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - startTime;
        console.log(`Dashboard operation "${operationName}" took ${duration.toFixed(2)}ms`);
        return duration;
      }
    };
  };

  return {
    metrics,
    setMetrics,
    startMeasurement,
  };
};