
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { FileText, Users, BarChart } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';
import { AdStatisticsWidget } from '@/components/dashboard/company/AdStatisticsWidget';
import { Link } from 'react-router-dom';

export const CompanyDashboard: React.FC = () => {
  const { profile } = useAuth();
  
  return (
    <DashboardLayout title={`Firmaportal - ${profile?.full_name || 'Bedrift'}`}>
      <DashboardWidget title="Aktive forespørsler">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">Kundeforespørsler</h3>
            <p className="text-sm text-muted-foreground">Se og behandle innkommende forespørsler</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4 flex justify-between">
          <span className="text-sm text-muted-foreground">Ingen nye forespørsler</span>
          <Link to="/leads" className="text-sm text-primary hover:underline">Se alle</Link>
        </div>
      </DashboardWidget>
      
      <AdStatisticsWidget />
      
      <DashboardWidget title="Bedriftsprofil">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">Din bedriftsprofil</h3>
            <p className="text-sm text-muted-foreground">Administrer din firmainformasjon og tjenester</p>
          </div>
        </div>
        <div className="mt-4 pt-2">
          <Link to="/company/profile" className="text-sm text-primary hover:underline">Rediger profil</Link>
        </div>
      </DashboardWidget>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
