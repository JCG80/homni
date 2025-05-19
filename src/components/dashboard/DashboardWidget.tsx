
import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardWidgetProps {
  title: ReactNode;
  children?: ReactNode;
  className?: string; // Add className prop
}

export const DashboardWidget = ({ title, children, className }: DashboardWidgetProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children || (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            {typeof title === 'string' ? title : 'Content'} will be implemented soon
          </div>
        )}
      </CardContent>
    </Card>
  );
};
