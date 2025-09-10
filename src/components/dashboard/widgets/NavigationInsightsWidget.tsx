import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Star, Zap, BarChart3 } from 'lucide-react';
import { useNavigationContext } from '@/hooks/useNavigationContext';
import { useNavigationCache } from '@/hooks/useNavigationCache';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface NavigationInsightsWidgetProps {
  className?: string;
}

export const NavigationInsightsWidget: React.FC<NavigationInsightsWidgetProps> = ({
  className,
}) => {
  const { preferences } = useNavigationContext();
  const { getAnalytics } = useNavigationCache();

  const analytics = getAnalytics();

  const insights = [
    {
      label: 'Most Used',
      value: preferences.quickAccessRoutes.length > 0 
        ? preferences.quickAccessRoutes[0]?.split('/').pop() || 'Dashboard'
        : 'Dashboard',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Cache Hit Rate',
      value: `${analytics.cacheHitRate}%`,
      icon: Zap,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Total Routes',
      value: analytics.totalRoutes.toString(),
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Frequent Routes',
      value: analytics.frequentRoutes.toString(),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Navigation Insights
        </CardTitle>
        <CardDescription>
          Your navigation patterns and performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={insight.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 p-2 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors"
              >
                <div className={cn(
                  "p-1.5 rounded-md",
                  insight.bgColor
                )}>
                  <Icon className={cn("h-3 w-3", insight.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {insight.label}
                  </p>
                  <p className="text-sm font-semibold truncate">
                    {insight.value}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Navigation Tips */}
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Navigation Tips
            </p>
            <Badge variant="secondary" className="text-xs">
              Tip
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Press <kbd className="px-1 py-0.5 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded">⌘K</kbd> to open quick search
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NavigationInsightsWidget;