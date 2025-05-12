
import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardWidgetProps {
  title: string;
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
            {title} content will be implemented soon
          </div>
        )}
      </CardContent>
    </Card>
  );
};
