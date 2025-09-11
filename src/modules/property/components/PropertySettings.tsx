import React from 'react';
import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const PropertySettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Innstillinger</h2>
        <p className="text-muted-foreground">
          Administrer innstillinger for dine eiendommer
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Generelle innstillinger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Innstillinger kommer snart...</p>
        </CardContent>
      </Card>
    </div>
  );
};