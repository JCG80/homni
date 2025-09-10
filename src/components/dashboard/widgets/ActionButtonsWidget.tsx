import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ActionButton {
  title: string;
  description: string;
  href: string;
  icon?: LucideIcon;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  disabled?: boolean;
}

interface ActionButtonsWidgetProps {
  title: string;
  actions: ActionButton[];
  className?: string;
  layout?: 'grid' | 'list';
  columns?: 1 | 2 | 3;
}

export const ActionButtonsWidget: React.FC<ActionButtonsWidgetProps> = ({
  title,
  actions,
  className,
  layout = 'grid',
  columns = 2
}) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05
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
              ? `grid gap-3 grid-cols-${columns}`
              : 'space-y-3'
          )}>
            {actions.map((action, index) => (
              <motion.div
                key={`${action.title}-${index}`}
                variants={itemVariants}
              >
                <Button
                  asChild
                  variant={action.variant || 'outline'}
                  className={cn(
                    'h-auto p-4 justify-start',
                    layout === 'grid' && 'w-full',
                    action.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  disabled={action.disabled}
                >
                  <Link to={action.href}>
                    <div className="flex items-start gap-3 text-left w-full">
                      {action.icon && (
                        <div className="p-2 rounded-md bg-primary/10">
                          <action.icon className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {action.title}
                          </span>
                          {action.badge && (
                            <Badge
                              variant={action.badge.variant || 'secondary'}
                              className="text-xs h-5"
                            >
                              {action.badge.text}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};