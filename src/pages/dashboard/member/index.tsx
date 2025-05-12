
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { useAuth } from '@/modules/auth/hooks';
import { Bell, FileText, User, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MemberDashboard: React.FC = () => {
  const { profile, user } = useAuth();
  
  return (
    <DashboardLayout title={`Medlemsportal - ${profile?.full_name || user?.email || 'Medlem'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardWidget title="Din profil">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-medium">Profilinformasjon</h3>
              <p className="text-sm text-muted-foreground">Administrer din personlige informasjon</p>
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Navn</span>
                <span className="text-sm text-muted-foreground">{profile?.full_name || 'Ikke angitt'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">E-post</span>
                <span className="text-sm text-muted-foreground">{user?.email || 'Ikke angitt'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Rolle</span>
                <span className="text-sm text-muted-foreground">Medlem</span>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/profile">
                <Button variant="outline" size="sm" className="w-full">Se hele profilen</Button>
              </Link>
            </div>
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
          <div className="mt-4 border-t pt-4 flex flex-col">
            <span className="text-sm text-muted-foreground mb-4">Ingen aktive forespørsler</span>
            <Link to="/leads">
              <Button variant="outline" size="sm" className="w-full">Se alle forespørsler</Button>
            </Link>
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
          <div className="mt-4 border-t pt-2">
            <p className="text-sm text-muted-foreground">Du har ingen nye varsler</p>
          </div>
        </DashboardWidget>
        
        <DashboardWidget title="Hurtignavigasjon">
          <div className="flex items-center gap-3">
            <Home className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-medium">Gå til</h3>
              <p className="text-sm text-muted-foreground">Rask tilgang til viktige funksjoner</p>
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="grid grid-cols-2 gap-2">
              <Link to="/profile">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </Button>
              </Link>
              <Link to="/leads">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Forespørsler
                </Button>
              </Link>
            </div>
          </div>
        </DashboardWidget>
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;
