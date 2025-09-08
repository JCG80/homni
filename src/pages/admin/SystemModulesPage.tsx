import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Settings, ToggleLeft, ToggleRight } from 'lucide-react';

export const SystemModulesPage: React.FC = () => {
  return (
    <PageLayout 
      title="Systemmoduler - Homni Admin"
      description="Administrer systemmoduler og feature flags i Homni-plattformen"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Systemmoduler</h1>
            <p className="text-muted-foreground mt-2">
              Administrer moduler og feature flags for plattformen
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Admin Panel
          </Badge>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Tilgjengelige Moduler
              </CardTitle>
              <CardDescription>
                Oversikt over alle systemmoduler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Lead Management</h4>
                    <p className="text-sm text-muted-foreground">Administrasjon av leads og distribusjon</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ToggleRight className="h-5 w-5 text-green-500" />
                    <Badge variant="outline">Aktiv</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Boligmappa</h4>
                    <p className="text-sm text-muted-foreground">Boligdokumentasjon og vedlikehold</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ToggleRight className="h-5 w-5 text-green-500" />
                    <Badge variant="outline">Aktiv</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Propr Integration</h4>
                    <p className="text-sm text-muted-foreground">DIY boligsalg integrasjon</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ToggleLeft className="h-5 w-5 text-gray-400" />
                    <Badge variant="secondary">Utvikles</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">AI Analytics</h4>
                    <p className="text-sm text-muted-foreground">AI-drevne analyser og innsikt</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ToggleLeft className="h-5 w-5 text-gray-400" />
                    <Badge variant="secondary">Beta</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Feature Flags
              </CardTitle>
              <CardDescription>
                Kontroller tilgjengelige features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Feature flag administrasjon kommer snart...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default SystemModulesPage;