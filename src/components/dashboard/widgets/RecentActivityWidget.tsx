import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, Eye, MessageSquare } from 'lucide-react';
import { useNavigationContext } from '@/hooks/useNavigationContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  href: string;
  type: 'navigation' | 'action' | 'notification';
}

interface RecentActivityWidgetProps {
  className?: string;
  maxItems?: number;
}

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
  className,
  maxItems = 5,
}) => {
  const { preferences } = useNavigationContext();

  // Convert navigation history to activity items
  const activityItems: ActivityItem[] = preferences.navigationHistory
    .slice(0, maxItems)
    .map((path, index) => ({
      id: `nav-${path}-${index}`,
      title: path.split('/').pop()?.replace(/[-_]/g, ' ') || 'Home',
      description: `Visited ${path}`,
      timestamp: '2 min ago', // In a real app, this would be actual timestamps
      href: path,
      type: 'navigation' as const,
    }));

  if (!activityItems.length) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
            <p className="text-xs">Start navigating to see your history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your latest navigation history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {activityItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors group">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate capitalize">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {item.timestamp}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
              >
                <a href={item.href}>
                  <ArrowRight className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </motion.div>
        ))}
        
        {preferences.navigationHistory.length > maxItems && (
          <div className="pt-2 border-t border-border">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View All Activity
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityWidget;