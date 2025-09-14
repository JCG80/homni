import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, Activity, Trash2, RefreshCw, CheckCircle } from 'lucide-react';
import { usePerformanceOptimization } from '@/modules/performance/hooks/usePerformanceOptimization';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { toast } from '@/hooks/use-toast';

export const PerformanceOptimizer = () => {
  const { metrics, isOptimizing, optimizeBundleLoading, cleanupMemory } = usePerformanceOptimization();
  const { metrics: performanceMetrics, getPerformanceScore } = usePerformanceMonitoring();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const performanceScore = performanceMetrics ? getPerformanceScore() : 0;

  const analyzePerformance = useCallback(async () => {
    setIsAnalyzing(true);
    
    // Simulate performance analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const issues = [];
    if (metrics?.loadTime && metrics.loadTime > 3000) {
      issues.push('Langsom sideinnlasting');
    }
    if (metrics?.memoryUsage && metrics.memoryUsage > 50 * 1024 * 1024) {
      issues.push('Høy minnebruk');
    }
    if (performanceScore < 80) {
      issues.push('Lav ytelsesscore');
    }

    setIsAnalyzing(false);
    
    toast({
      title: issues.length === 0 ? "Ytelse OK" : "Ytelsesproblemer funnet",
      description: issues.length === 0 
        ? "Appen kjører optimalt" 
        : `${issues.length} problemer funnet: ${issues.join(', ')}`,
      variant: issues.length === 0 ? "default" : "destructive",
    });
  }, [metrics, performanceScore]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Bra';
    return 'Trenger forbedring';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Ytelsesovervåkning
          </CardTitle>
          <CardDescription>
            Overvåk og optimaliser applikasjonens ytelse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {performanceMetrics && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ytelsesscore</span>
                    <Badge variant={performanceScore >= 70 ? "default" : "destructive"}>
                      {getScoreBadge(performanceScore)}
                    </Badge>
                  </div>
                  <Progress value={performanceScore} className="h-2" />
                  <span className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
                    {performanceScore}%
                  </span>
                </div>

                {metrics?.loadTime && (
                  <div className="space-y-2">
                    <span className="text-sm">Innlastingstid</span>
                    <div className="text-2xl font-bold">
                      {(metrics.loadTime / 1000).toFixed(2)}s
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {metrics.loadTime < 3000 ? 'Raskt' : 'Tregt'}
                    </div>
                  </div>
                )}

                {metrics?.memoryUsage && (
                  <div className="space-y-2">
                    <span className="text-sm">Minnebruk</span>
                    <div className="text-2xl font-bold">
                      {(metrics.memoryUsage / (1024 * 1024)).toFixed(1)} MB
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {metrics.memoryUsage < 50 * 1024 * 1024 ? 'Normal' : 'Høy'}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Ytelsesoptimalisering
          </CardTitle>
          <CardDescription>
            Verktøy for å forbedre appens ytelse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              onClick={analyzePerformance}
              disabled={isAnalyzing}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
              {isAnalyzing ? 'Analyserer...' : 'Analyser ytelse'}
            </Button>

            <Button
              onClick={optimizeBundleLoading}
              disabled={isOptimizing}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isOptimizing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Optimaliser lasting
            </Button>

            <Button
              onClick={cleanupMemory}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Rydd opp minne
            </Button>

            <Button
              onClick={() => {
                if ('caches' in window) {
                  caches.keys().then(names => {
                    names.forEach(name => caches.delete(name));
                  });
                  toast({
                    title: "Cache ryddet",
                    description: "Alle cached data er fjernet.",
                  });
                }
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Rydd cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};