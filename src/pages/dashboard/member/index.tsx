
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { canAccessModule } from '@/modules/auth/utils/roles/guards';
import { Navigate } from 'react-router-dom';
import { Calendar, FileText, Home, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const MemberDashboard: React.FC = () => {
  const { user, profile, role } = useAuth();
  
  // Check if user has member role
  if (role !== 'member') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return (
    <DashboardLayout title={`Medlemsportal - ${profile?.full_name || user?.email || 'Medlem'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mine forespørsler Widget */}
        {canAccessModule(role, 'lead_capture') && (
          <DashboardWidget title="Mine forespørsler">
            <div className="flex items-center gap-3">
              <ListChecks className="h-8 w-8 text-primary" />
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
            {/* Example query commented out:
            // const { data: leadsData, error } = await supabase
            //   .from('leads')
            //   .select('*')
            //   .eq('user_id', user.id);
            */}
          </DashboardWidget>
        )}

        {/* Eiendomsoversikt Widget */}
        {canAccessModule(role, 'property_overview') && (
          <DashboardWidget title="Eiendomsoversikt">
            <div className="flex items-center gap-3">
              <Home className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Dokumenter og eiendommer</h3>
                <p className="text-sm text-muted-foreground">Hold oversikt over dine eiendommer og viktige dokumenter</p>
              </div>
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="text-sm text-muted-foreground mb-4">Ingen registrerte eiendommer</div>
              <Link to="/properties">
                <Button variant="outline" size="sm" className="w-full">Se eiendommer</Button>
              </Link>
            </div>
            {/* Example query commented out:
            // const { data: propertiesData, error } = await supabase
            //   .from('properties')
            //   .select('*')
            //   .eq('owner_id', user.id);
            */}
          </DashboardWidget>
        )}
        
        {/* Vedlikeholdskalender Widget */}
        {canAccessModule(role, 'maintenance') && (
          <DashboardWidget title="Vedlikeholdskalender">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Vedlikeholdsplaner</h3>
                <p className="text-sm text-muted-foreground">Hold oversikt over vedlikehold på dine eiendommer</p>
              </div>
            </div>
            <div className="mt-4 border-t pt-2">
              <p className="text-sm text-muted-foreground mb-4">Planlagt vedlikehold vil vises her</p>
              <span className="text-sm text-muted-foreground">Kommer snart</span>
            </div>
            {/* Example query commented out:
            // const { data: maintenanceData, error } = await supabase
            //   .from('maintenance_events')
            //   .select('*')
            //   .eq('property_owner_id', user.id)
            //   .gte('scheduled_date', new Date().toISOString())
            //   .order('scheduled_date', { ascending: true });
            */}
          </DashboardWidget>
        )}
        
        {/* Anbefalte tjenester Widget */}
        {canAccessModule(role, 'service_recommendations') && (
          <DashboardWidget title="Anbefalte tjenester">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Tjenester for deg</h3>
                <p className="text-sm text-muted-foreground">Anbefalte tjenester basert på din profil</p>
              </div>
            </div>
            <div className="mt-4 border-t pt-2">
              <p className="text-sm text-muted-foreground">Anbefalinger vil vises her</p>
            </div>
            {/* Example query commented out:
            // const { data: recommendationsData, error } = await supabase
            //   .from('service_recommendations')
            //   .select('*')
            //   .eq('user_id', user.id);
            */}
          </DashboardWidget>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;
