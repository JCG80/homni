
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Bell, Settings, User } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Link } from 'react-router-dom';

export const MemberDashboard: React.FC = () => {
  const { profile } = useAuth();
  
  return (
    <DashboardLayout title={`Velkommen, ${profile?.full_name || 'medlem'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Mine forespørsler</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Se status på dine forespørsler og send nye til leverandører
            </p>
            <Button asChild>
              <Link to="/leads">Se forespørsler</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>Varsler</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Se dine siste varsler og oppdateringer
            </p>
            <Button variant="outline">Vis varslinger</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <span>Min profil</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Administrer profil, kontaktinfo og preferanser
            </p>
            <Button variant="outline" asChild>
              <Link to="/profile">Rediger profil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;
