
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { useAuth } from '@/modules/auth/hooks';
import { FileText, CreditCard, Bell, User } from 'lucide-react';
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
    </DashboardLayout>
  );
};

export default MemberDashboard;
