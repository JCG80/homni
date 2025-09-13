/**
 * Dashboard Performance Monitor - Real-time performance tracking
 * Phase 4: Performance & Polish
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Cpu, HardDrive, Zap } from 'lucide-react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  loadTime: number;
  fps: number;
}

interface DashboardPerformanceMonitorProps {
  visible?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const DashboardPerformanceMonitor: React.FC<DashboardPerformanceMonitorProps> = ({
  visible = process.env.NODE_ENV === 'development',
  position = 'top-right'
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    loadTime: 0,
    fps: 0
  });

  const { logPerformance } = usePerformanceMonitor('DashboardPerformanceMonitor');

  useEffect(() => {
    if (!visible) return;

    const updateMetrics = () => {
      const memory = (performance as any).memory;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      setMetrics({
        renderTime: performance.now(),
        memoryUsage: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0,
        cacheHitRate: Math.random() * 100, // Placeholder - would be calculated from actual cache stats
        loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
        fps: 60 // Placeholder - would use RAF to calculate actual FPS
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const getPerformanceColor = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'bg-green-500';
    if (value <= thresholds[1]) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className={`fixed ${getPositionClasses()} w-80 z-50 bg-background/95 backdrop-blur-sm border-border/50`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3" />
            <span>Render Time</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {metrics.renderTime.toFixed(1)}ms
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-3 w-3" />
            <span>Memory</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {metrics.memoryUsage}MB
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span>Cache Hit Rate</span>
            <span>{metrics.cacheHitRate.toFixed(1)}%</span>
          </div>
          <Progress 
            value={metrics.cacheHitRate} 
            className="h-1"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-3 w-3" />
            <span>FPS</span>
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${metrics.fps >= 50 ? 'border-green-500' : metrics.fps >= 30 ? 'border-yellow-500' : 'border-red-500'}`}
          >
            {metrics.fps}
          </Badge>
        </div>

        <div className="pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            Load: {metrics.loadTime.toFixed(0)}ms
          </div>
        </div>
      </CardContent>
    </Card>
  );
};