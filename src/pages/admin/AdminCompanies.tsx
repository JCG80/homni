import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminCompanies: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Bedriftsadministrasjon
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2">
          Administrer bedriftskontoer og abonnementer
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bedriftsoversikt</CardTitle>
          <CardDescription>
            Administrer bedriftskontoer og deres tilganger
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Bedriftsadministrasjonspanel kommer her...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCompanies;