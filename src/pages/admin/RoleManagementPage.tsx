import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Settings } from 'lucide-react';

export const RoleManagementPage: React.FC = () => {
  return (
    <PageLayout 
      title="Rolleadministrasjon - Homni Admin"
      description="Administrer brukerroller og tilganger i Homni-plattformen"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Rolleadministrasjon</h1>
            <p className="text-muted-foreground mt-2">
              Administrer brukerroller og tilgangsnivåer
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Admin Panel
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Aktive Roller
              </CardTitle>
              <CardDescription>
                Oversikt over alle tilgjengelige roller
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Master Admin</span>
                  <Badge variant="destructive">Høy tilgang</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Admin</span>
                  <Badge variant="secondary">Admin tilgang</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Bedrift</span>
                  <Badge variant="outline">Bedrift</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Bruker</span>
                  <Badge variant="outline">Standard</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Tilgangskontroll
              </CardTitle>
              <CardDescription>
                Administrer modul-tilganger
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Rolleadministrasjon kommer snart...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default RoleManagementPage;