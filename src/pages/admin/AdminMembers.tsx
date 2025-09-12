import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminMembers: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Medlemsadministrasjon
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2">
          Administrer brukere og deres tilganger
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medlemsoversikt</CardTitle>
          <CardDescription>
            Administrer brukerkontoer og rolletildelinger
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Medlemsadministrasjonspanel kommer her...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMembers;