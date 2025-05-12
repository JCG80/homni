
import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardWidgetProps {
  title: ReactNode;
  children?: ReactNode;
}

export const DashboardWidget = ({ title, children }: DashboardWidgetProps) => {
  return (
    <Card className="shadow-md">
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
