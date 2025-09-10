import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, FileText, Settings, HelpCircle } from 'lucide-react';
import { SystemHealthCheck } from '@/components/health/SystemHealthCheck';

/**
 * Minimal fallback dashboard that works even with package.json corruption
 * This ensures users can access their dashboard regardless of dependency issues
 */
export const UserDashboardFallback: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Brukerdashboard</h1>
        <p className="text-muted-foreground mt-2">
          Velkommen til Homni - din personlige oversikt
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mine Forespørsler</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Totalt antall leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventende</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Venter på respons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fullførte</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Behandlede forespørsler</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Hurtighandlinger</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ny Forespørsel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Start en ny forespørsel for tjenester du trenger
              </p>
              <Button className="w-full">
                Opprett Forespørsel
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Få Hjelp</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Trenger du hjelp med å navigere på Homni?
              </p>
              <Button variant="outline" className="w-full">
                <HelpCircle className="w-4 h-4 mr-2" />
                Kontakt Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Status Notice with Health Check */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Systemstatus</h3>
          <p className="text-sm text-muted-foreground">
            Dashboard fungerer i fallback-modus. Noen funksjoner kan være begrenset.
            Kontakt support hvis du opplever problemer.
          </p>
        </div>
        
        <div className="flex justify-center md:justify-end">
          <SystemHealthCheck />
        </div>
      </div>
    </div>
  );
};