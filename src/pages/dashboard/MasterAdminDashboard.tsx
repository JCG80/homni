
import React, { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';

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
              <CardHeader>
                <CardTitle>Brukeradministrasjon</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Administrer brukere og tilganger.</p>
                <Link to="/admin/users" className="text-primary mt-2 block">
                  Gå til brukeradministrasjon
                </Link>
                {/* TODO: Create UserManagementPage */}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Medlemsoversikt</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Her vil du få en oversikt over alle medlemmer.</p>
              {/* TODO: Add a MemberList component */}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="companies" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Bedriftsoversikt</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Her vil du få en oversikt over alle bedrifter.</p>
              {/* TODO: Add a CompanyList component */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MasterAdminDashboard;
