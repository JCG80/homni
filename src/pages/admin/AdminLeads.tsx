import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminLeads: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Lead Administration
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2">
          Administrer leads, distribusjon og pakker
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Oversikt</CardTitle>
          <CardDescription>
            Systemets lead-administrasjon og distribusjon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Lead administrasjonspanel kommer her...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLeads;