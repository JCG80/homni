
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardWidget } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Shield, Users, Lock, Settings } from 'lucide-react';

const MasterAdminDashboard = () => {
  return (
    <DashboardLayout title="Master Admin Dashboard">
      {/* System Configuration Widget */}
      <DashboardWidget title="System Konfigurasjon">
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Systemmoduler</h4>
              <p className="text-sm text-muted-foreground">12 aktive / 14 totalt</p>
            </div>
            <Button size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Konfigurer
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Feature Flags</h4>
              <p className="text-sm text-muted-foreground">8 aktivert / 15 totalt</p>
            </div>
            <Button size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Konfigurer
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">API-Endepunkter</h4>
              <p className="text-sm text-muted-foreground">24 endepunkter</p>
            </div>
            <Button size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Konfigurer
            </Button>
          </div>
        </div>
      </DashboardWidget>

      {/* User Management Widget */}
      <DashboardWidget title="Brukeradministrasjon">
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Admin brukere</h4>
              <p className="text-sm text-muted-foreground">5 aktive administratorer</p>
            </div>
            <Button size="sm">
              <Users className="h-4 w-4 mr-1" />
              Administrer
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Interne Roller</h4>
              <p className="text-sm text-muted-foreground">7 roller definert</p>
            </div>
            <Button size="sm">
              <Users className="h-4 w-4 mr-1" />
              Administrer
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Brukermoderation</h4>
              <p className="text-sm text-muted-foreground">0 brukerrapporter</p>
            </div>
            <Button size="sm">
              <Users className="h-4 w-4 mr-1" />
              Se rapporter
            </Button>
          </div>
        </div>
      </DashboardWidget>

      {/* Access Control Widget */}
      <DashboardWidget title="Tilgangsstyring">
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Tilgangsmatrise</h4>
              <p className="text-sm text-muted-foreground">Rolle/modul-tilganger</p>
            </div>
            <Button size="sm">
              <Shield className="h-4 w-4 mr-1" />
              Konfigurer
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">API Tilgangsregler</h4>
              <p className="text-sm text-muted-foreground">31 regler konfigurert</p>
            </div>
            <Button size="sm">
              <Shield className="h-4 w-4 mr-1" />
              Konfigurer
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Internal Admin Brukere</h4>
              <p className="text-sm text-muted-foreground">3 brukere med utvidet tilgang</p>
            </div>
            <Button size="sm">
              <Lock className="h-4 w-4 mr-1" />
              Administrer
            </Button>
          </div>
        </div>
      </DashboardWidget>
    </DashboardLayout>
  );
};

export default MasterAdminDashboard;
