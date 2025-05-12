
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardWidget } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  BarChart3, 
  Building, 
  CheckCircle, 
  FileText, 
  Settings, 
  User, 
  Users 
} from 'lucide-react';

const AdminDashboard = () => {
  return (
    <DashboardLayout title="Admin Dashboard">
      {/* System Statistics Widget */}
      <DashboardWidget title="System Oversikt">
        <div className="grid grid-cols-2 gap-4 p-4">
          <div className="border rounded-md p-3 flex flex-col items-center">
            <Users className="h-8 w-8 mb-2 text-primary" />
            <h3 className="text-2xl font-bold">183</h3>
            <p className="text-sm text-muted-foreground">Aktive brukere</p>
          </div>
          <div className="border rounded-md p-3 flex flex-col items-center">
            <Building className="h-8 w-8 mb-2 text-primary" />
            <h3 className="text-2xl font-bold">47</h3>
            <p className="text-sm text-muted-foreground">Registrerte bedrifter</p>
          </div>
          <div className="border rounded-md p-3 flex flex-col items-center">
            <FileText className="h-8 w-8 mb-2 text-primary" />
            <h3 className="text-2xl font-bold">92</h3>
            <p className="text-sm text-muted-foreground">Aktive leads</p>
          </div>
          <div className="border rounded-md p-3 flex flex-col items-center">
            <BarChart3 className="h-8 w-8 mb-2 text-primary" />
            <h3 className="text-2xl font-bold">68%</h3>
            <p className="text-sm text-muted-foreground">Konverteringsrate</p>
          </div>
        </div>
      </DashboardWidget>

      {/* Quick Access Widget */}
      <DashboardWidget title="Hurtigtilgang">
        <div className="p-4 grid grid-cols-2 gap-3">
          <Button variant="outline" className="flex items-center justify-start gap-2 h-auto py-3">
            <User className="h-5 w-5" />
            <div className="text-left">
              <p className="font-medium">Medlemmer</p>
              <p className="text-xs text-muted-foreground">Administrer brukere</p>
            </div>
          </Button>
          <Button variant="outline" className="flex items-center justify-start gap-2 h-auto py-3">
            <Building className="h-5 w-5" />
            <div className="text-left">
              <p className="font-medium">Bedrifter</p>
              <p className="text-xs text-muted-foreground">Administrer bedrifter</p>
            </div>
          </Button>
          <Button variant="outline" className="flex items-center justify-start gap-2 h-auto py-3">
            <Settings className="h-5 w-5" />
            <div className="text-left">
              <p className="font-medium">Moduler</p>
              <p className="text-xs text-muted-foreground">System moduler</p>
            </div>
          </Button>
          <Button variant="outline" className="flex items-center justify-start gap-2 h-auto py-3">
            <FileText className="h-5 w-5" />
            <div className="text-left">
              <p className="font-medium">Leads</p>
              <p className="text-xs text-muted-foreground">Lead fordeling</p>
            </div>
          </Button>
        </div>
      </DashboardWidget>

      {/* System Status Widget */}
      <DashboardWidget title="Systemstatus">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>API Integrasjoner</span>
            </div>
            <span className="text-sm text-muted-foreground">100% oppetid</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Database</span>
            </div>
            <span className="text-sm text-muted-foreground">Normal drift</span>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Integrasjon mot Stripe</span>
            </div>
            <span className="text-sm text-muted-foreground">Nedsatt ytelse</span>
          </div>
        </div>
      </DashboardWidget>
    </DashboardLayout>
  );
};

export default AdminDashboard;
