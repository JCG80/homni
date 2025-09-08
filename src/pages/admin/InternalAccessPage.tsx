import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Key, Database, Cloud, Shield } from 'lucide-react';

export const InternalAccessPage: React.FC = () => {
  return (
    <PageLayout 
      title="API & Integrasjoner - Homni Admin"
      description="Administrer API-tilgang og systemintegrasjoner"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">API & Integrasjoner</h1>
            <p className="text-muted-foreground mt-2">
              Administrer API-nøkler, integrasjoner og systemtilgang
            </p>
          </div>
          <Badge variant="destructive" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Høy Sikkerhet
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Nøkler
              </CardTitle>
              <CardDescription>
                Administrer API-tilgang og nøkler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Supabase API</span>
                  <Badge variant="outline">Aktiv</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Stripe API</span>
                  <Badge variant="outline">Aktiv</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">OpenAI API</span>
                  <Badge variant="secondary">Konfigueres</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Tilgang
              </CardTitle>
              <CardDescription>
                Direkte database administrasjon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Prod Database</span>
                  <Badge variant="destructive">Begrenset</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Staging Database</span>
                  <Badge variant="outline">Full tilgang</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Dev Database</span>
                  <Badge variant="outline">Full tilgang</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Tredjeparts Integrasjoner
              </CardTitle>
              <CardDescription>
                Eksterne tjenester og API-er
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Kartverket API</span>
                  <Badge variant="outline">Tilkoblet</Badge>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">Proff.no API</span>
                  <Badge variant="secondary">Planlagt</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sikkerhet & Overvåking
              </CardTitle>
              <CardDescription>
                Systemsikkerhet og logging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sikkerhetsmonitoring og avansert logging kommer snart...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default InternalAccessPage;