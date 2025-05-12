
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardWidget } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Edit, FileText, Image, CalendarClock } from 'lucide-react';

const ContentEditorDashboard = () => {
  return (
    <DashboardLayout title="Content Editor Dashboard">
      {/* Content Management Widget */}
      <DashboardWidget title="Innholdsadministrasjon">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h4 className="font-medium">Hjemmeside-innhold</h4>
              <p className="text-sm text-muted-foreground">Sist oppdatert: 10.05.2025</p>
            </div>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Rediger
            </Button>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h4 className="font-medium">Tjenestesider</h4>
              <p className="text-sm text-muted-foreground">5 aktive sider</p>
            </div>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Rediger
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Bloginnlegg</h4>
              <p className="text-sm text-muted-foreground">12 publiserte innlegg</p>
            </div>
            <Button size="sm">
              <FileText className="h-4 w-4 mr-1" />
              Administrer
            </Button>
          </div>
          <Button className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Opprett nytt innhold
          </Button>
        </div>
      </DashboardWidget>

      {/* Media Library Widget */}
      <DashboardWidget title="Mediebibliotek">
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted/50 aspect-square rounded-md flex items-center justify-center">
              <Image className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="bg-muted/50 aspect-square rounded-md flex items-center justify-center">
              <Image className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="bg-muted/50 aspect-square rounded-md flex items-center justify-center">
              <Image className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="bg-muted/50 aspect-square rounded-md flex items-center justify-center">
              <Image className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="bg-muted/50 aspect-square rounded-md flex items-center justify-center">
              <Image className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="bg-muted/50 aspect-square rounded-md flex items-center justify-center">
              <Image className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <Button className="w-full">
            <Image className="h-4 w-4 mr-2" />
            Åpne mediebibliotek
          </Button>
        </div>
      </DashboardWidget>

      {/* Publishing Schedule Widget */}
      <DashboardWidget title="Publikasjonsplan">
        <div className="p-4 space-y-3">
          <div className="border rounded p-2 mb-2 bg-muted/30">
            <p className="font-medium">Nytt blogginnlegg</p>
            <p className="text-sm text-muted-foreground">Planlagt: 20.05.2025</p>
          </div>
          <div className="border rounded p-2 mb-2 bg-muted/30">
            <p className="font-medium">Oppdatering av forsiden</p>
            <p className="text-sm text-muted-foreground">Planlagt: 01.06.2025</p>
          </div>
          <div className="border rounded p-2 mb-2 bg-muted/30">
            <p className="font-medium">Nyhetsbrev</p>
            <p className="text-sm text-muted-foreground">Planlagt: 15.06.2025</p>
          </div>
          <Button className="w-full">
            <CalendarClock className="h-4 w-4 mr-2" />
            Administrer publikasjonsplan
          </Button>
        </div>
      </DashboardWidget>
    </DashboardLayout>
  );
};

export default ContentEditorDashboard;
