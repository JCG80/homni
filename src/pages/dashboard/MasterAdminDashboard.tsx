
import React, { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Users, Building, Settings } from 'lucide-react';

export const MasterAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Master Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="members">Medlemmer</TabsTrigger>
          <TabsTrigger value="companies">Bedrifter</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rolleadministrasjon</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Administrer roller og tilganger.</p>
                <Link to="/admin/roles" className="text-primary mt-2 block">
                  Gå til rolleadministrasjon
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Systemkonfigurasjon</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Endre systemkonfigurasjoner.</p>
                <Link to="/admin/settings" className="text-primary mt-2 block">
                  Gå til systeminnstillinger
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Brukeradministrasjon</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p>Administrer brukere og tilganger.</p>
                <div className="mt-2 space-y-2">
                  <Link to="/admin/members" className="text-primary block">
                    Administrer medlemmer
                  </Link>
                  <Link to="/admin/companies" className="text-primary block">
                    Administrer bedrifter
                  </Link>
                  <Link to="/admin/internal-access" className="text-primary block">
                    Administrer modultilganger
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Medlemsoversikt</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="mb-4">Her får du en oversikt over alle medlemmer i systemet.</p>
              <Link 
                to="/admin/members" 
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Gå til medlemsadministrasjon
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="companies" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Bedriftsoversikt</CardTitle>
              <Building className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="mb-4">Her får du en oversikt over alle bedrifter i systemet.</p>
              <Link 
                to="/admin/companies" 
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Gå til bedriftsadministrasjon
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Hurtiglenker</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link to="/admin/roles" className="bg-secondary/50 p-4 rounded-md hover:bg-secondary/70 transition-colors">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span>Rolleadministrasjon</span>
            </div>
          </Link>
          <Link to="/admin/members" className="bg-secondary/50 p-4 rounded-md hover:bg-secondary/70 transition-colors">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Medlemmer</span>
            </div>
          </Link>
          <Link to="/admin/companies" className="bg-secondary/50 p-4 rounded-md hover:bg-secondary/70 transition-colors">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              <span>Bedrifter</span>
            </div>
          </Link>
          <Link to="/admin/internal-access" className="bg-secondary/50 p-4 rounded-md hover:bg-secondary/70 transition-colors">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span>Modultilgang</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MasterAdminDashboard;
