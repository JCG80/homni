
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { useAuth } from '@/modules/auth/hooks';
import { Bell, FileText, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const MemberDashboard: React.FC = () => {
  const { profile } = useAuth();
  
  return (
    <DashboardLayout title={`Medlemsportal - ${profile?.full_name || 'Medlem'}`}>
      <DashboardWidget title="Din profil">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">Profilinformasjon</h3>
            <p className="text-sm text-muted-foreground">Administrer din personlige informasjon</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <Link to="/profile" className="text-sm text-primary hover:underline">Se profil</Link>
        </div>
      </DashboardWidget>
      
      <DashboardWidget title="Dine forespørsler">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">Forespørsler og henvendelser</h3>
            <p className="text-sm text-muted-foreground">Oversikt over dine forespørsler til tjenesteleverandører</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4 flex justify-between">
          <span className="text-sm text-muted-foreground">Ingen aktive forespørsler</span>
          <Link to="/leads" className="text-sm text-primary hover:underline">Se alle</Link>
        </div>
      </DashboardWidget>
      
      <DashboardWidget title="Varsler">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">Dine varsler</h3>
            <p className="text-sm text-muted-foreground">Se dine siste meldinger og oppdateringer</p>
          </div>
        </div>
        <div className="mt-4 pt-2">
          <p className="text-sm text-muted-foreground">Du har ingen nye varsler</p>
        </div>
      </DashboardWidget>
    </DashboardLayout>
  );
};

export default MemberDashboard;
