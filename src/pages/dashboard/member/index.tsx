
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { useAuth } from '@/modules/auth/hooks';
import { FileText, CreditCard, Bell, User, Calendar, MessageSquare } from 'lucide-react';
import { ProfileCard } from '@/components/account/ProfileCard';

export const MemberDashboard = () => {
  const { profile } = useAuth();
  
  return (
    <DashboardLayout title={`Velkommen, ${profile?.full_name || 'medlem'}`}>
      <ProfileCard />
      
      <DashboardWidget title="Mine forespørsler">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">Aktive forespørsler</h3>
            <p className="text-sm text-muted-foreground">Se og administrer dine forespørsler</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <span className="text-sm text-muted-foreground">Ingen aktive forespørsler</span>
        </div>
      </DashboardWidget>
      
      <DashboardWidget title="Kommende hendelser">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">Din kalender</h3>
            <p className="text-sm text-muted-foreground">Planlagte møter og påminnelser</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Strømavtale fornyes</p>
                <p className="text-xs text-muted-foreground">Automatisk fornyelse</p>
              </div>
              <span className="text-sm">15. juni</span>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Forsikringsgjennomgang</p>
                <p className="text-xs text-muted-foreground">Årlig gjennomgang</p>
              </div>
              <span className="text-sm">24. juni</span>
            </div>
          </div>
        </div>
      </DashboardWidget>
      
      <DashboardWidget title="Mine tilbud">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">Aktive tilbud</h3>
            <p className="text-sm text-muted-foreground">Personlige tilbud basert på dine preferanser</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <div className="space-y-3">
            <div className="p-3 border rounded-md hover:bg-accent cursor-pointer">
              <div className="flex justify-between">
                <p className="font-medium">Strømavtale</p>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Ny</span>
              </div>
              <p className="text-xs text-muted-foreground">15% lavere pris enn nåværende avtale</p>
            </div>
            <div className="p-3 border rounded-md hover:bg-accent cursor-pointer">
              <div className="flex justify-between">
                <p className="font-medium">Boligforsikring</p>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Tilpasset</span>
              </div>
              <p className="text-xs text-muted-foreground">Utvidet dekning til samme pris</p>
            </div>
          </div>
        </div>
      </DashboardWidget>
      
      <DashboardWidget title="Varsler">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">Dine varsler</h3>
            <p className="text-sm text-muted-foreground">Oppdateringer og påminnelser</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <span className="text-sm text-muted-foreground">Ingen nye varsler</span>
        </div>
      </DashboardWidget>
      
      <DashboardWidget title="Meldinger">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">Dine meldinger</h3>
            <p className="text-sm text-muted-foreground">Kommunikasjon med tjenesteleverandører</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <div className="space-y-3">
            <div className="p-3 border rounded-md hover:bg-accent cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Tilbud på forsikring</p>
                  <p className="text-xs text-muted-foreground">Fra: Forsikringsselskap AS</p>
                </div>
                <span className="text-xs">2d</span>
              </div>
              <p className="text-sm mt-1 truncate">Hei! Vi har nå ferdigstilt tilbudet ditt på...</p>
            </div>
            <div className="p-3 border rounded-md hover:bg-accent cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Bekreftelse på forespørsel</p>
                  <p className="text-xs text-muted-foreground">Fra: Strømleverandør AS</p>
                </div>
                <span className="text-xs">5d</span>
              </div>
              <p className="text-sm mt-1 truncate">Takk for din forespørsel. Vi har registrert...</p>
            </div>
          </div>
        </div>
      </DashboardWidget>
    </DashboardLayout>
  );
};

export default MemberDashboard;
