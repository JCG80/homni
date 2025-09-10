import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuickStatItem {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';
}

interface QuickStatsWidgetProps {
  title: string;
  stats: QuickStatItem[];
  className?: string;
  layout?: 'grid' | 'horizontal';
}

export const QuickStatsWidget: React.FC<QuickStatsWidgetProps> = ({
  title,
  stats,
  className,
  layout = 'grid'
}) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="warm-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            layout === 'grid' 
              ? 'grid grid-cols-2 gap-4' 
              : 'flex flex-wrap gap-4'
          )}>
            {stats.map((stat, index) => (
              <motion.div
                key={`${stat.title}-${index}`}
                variants={itemVariants}
                className={cn(
                  'flex flex-col space-y-2 p-3 rounded-lg border bg-card/50',
                  layout === 'horizontal' && 'flex-1 min-w-[120px]'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {stat.icon && (
                      <div className={cn(
                        'p-1.5 rounded-md',
                        stat.color === 'primary' && 'bg-primary/10 text-primary',
                        stat.color === 'secondary' && 'bg-secondary/10 text-secondary',
                        stat.color === 'success' && 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
                        stat.color === 'warning' && 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
                        stat.color === 'destructive' && 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
                        !stat.color && 'bg-muted text-muted-foreground'
                      )}>
                        <stat.icon className="h-4 w-4" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </span>
                  </div>
                  {stat.trend && (
                    <Badge
                      variant={stat.trend.isPositive ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {stat.trend.isPositive ? '+' : ''}{stat.trend.value}%
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {stat.value}
                  </div>
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground">
                      {stat.subtitle}
                    </p>
                  )}
                  {stat.trend && (
                    <p className="text-xs text-muted-foreground">
                      {stat.trend.label}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};