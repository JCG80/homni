
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardWidget } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Home, MessageSquare } from 'lucide-react';

const MemberDashboard = () => {
  return (
    <DashboardLayout title="Medlem Dashboard">
      {/* MyRequests Widget */}
      <DashboardWidget title="Mine Forespørsler">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h4 className="font-medium">Rørlegger bestilling</h4>
              <p className="text-sm text-muted-foreground">Status: Under behandling</p>
            </div>
            <Button size="sm" variant="outline">
              <FileText className="h-4 w-4 mr-1" /> Detaljer
            </Button>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h4 className="font-medium">Elektrikerbesøk</h4>
              <p className="text-sm text-muted-foreground">Status: Godkjent</p>
            </div>
            <Button size="sm" variant="outline">
              <FileText className="h-4 w-4 mr-1" /> Detaljer
            </Button>
          </div>
          <Button className="w-full" variant="default">
            Ny forespørsel
          </Button>
        </div>
      </DashboardWidget>

      {/* PropertyOverview Widget */}
      <DashboardWidget title="Eiendomsoversikt">
        <div className="p-4">
          <div className="mb-4">
            <h4 className="font-medium">Hovedbolig</h4>
            <p className="text-sm text-muted-foreground">Storgata 1, Oslo</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline">
              <Home className="h-4 w-4 mr-1" /> Detaljer
            </Button>
            <Button size="sm" variant="outline">
              <FileText className="h-4 w-4 mr-1" /> Dokumenter
            </Button>
          </div>
        </div>
      </DashboardWidget>

      {/* MaintenanceCalendar Widget */}
      <DashboardWidget title="Vedlikeholdskalender">
        <div className="p-4">
          <div className="border rounded p-2 mb-3 bg-muted/30">
            <p className="font-medium">15. juni 2025</p>
            <p className="text-sm text-muted-foreground">Filter-bytte varmeanlegg</p>
          </div>
          <div className="border rounded p-2 mb-3 bg-muted/30">
            <p className="font-medium">1. august 2025</p>
            <p className="text-sm text-muted-foreground">Årlig inspeksjon av tak</p>
          </div>
          <Button className="w-full" variant="outline">
            <Calendar className="h-4 w-4 mr-1" /> Vis alle
          </Button>
        </div>
      </DashboardWidget>

      {/* RecommendedServices Widget */}
      <DashboardWidget title="Anbefalte Tjenester">
        <div className="p-4">
          <div className="border rounded p-2 mb-3 bg-muted/30">
            <h4 className="font-medium">Varmepumpeservice</h4>
            <p className="text-xs text-muted-foreground mb-2">Årlig service på varmepumpe</p>
            <Button size="sm">Få tilbud</Button>
          </div>
          <div className="border rounded p-2 mb-3 bg-muted/30">
            <h4 className="font-medium">Taksjekk</h4>
            <p className="text-xs text-muted-foreground mb-2">Profesjonell taksjekk før vinteren</p>
            <Button size="sm">Få tilbud</Button>
          </div>
          <Button className="w-full" variant="outline">
            <MessageSquare className="h-4 w-4 mr-1" /> Se alle anbefalinger
          </Button>
        </div>
      </DashboardWidget>
    </DashboardLayout>
  );
};

export default MemberDashboard;
