import React from 'react';
import { Helmet } from 'react-helmet';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleOverview } from '@/components/admin/roles/RoleOverview';
import { RoleHistoryViewer } from '@/components/admin/roles/RoleHistoryViewer';
import { BatchRoleOperations } from '@/components/admin/roles/BatchRoleOperations';
import { Users, History, Settings } from 'lucide-react';

export const AdminRolesPage: React.FC = () => {
  return (
    <RequireAuth roles={['master_admin']}>
      <div className="container mx-auto py-6 space-y-6">
        <Helmet>
          <title>Rolleadministrasjon - Homni Admin</title>
          <meta name="description" content="Administrer brukerroller og tilganger i systemet" />
        </Helmet>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Rolleadministrasjon</h1>
          </div>
          <p className="text-muted-foreground">
            Administrer brukerroller, tilganger og systemtillatelser
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Rolleoversikt
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Batch-operasjoner
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Endringshistorikk
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Brukerroller og tilganger</CardTitle>
                <CardDescription>
                  Søk etter brukere og administrer deres roller i systemet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RoleOverview />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="batch" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Batch-operasjoner</CardTitle>
                <CardDescription>
                  Utfør rolleendringer på flere brukere samtidig
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BatchRoleOperations />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Endringshistorikk</CardTitle>
                <CardDescription>
                  Vis auditlogg for alle rolleendringer i systemet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RoleHistoryViewer />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RequireAuth>
  );
};