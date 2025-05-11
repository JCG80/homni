
import React from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Administrasjonspanel</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Velkommen til administrasjonspanelet, {user?.email}!</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Lead administrasjon</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Administrer leads og distribusjon.</p>
            <Link to="/admin/leads" className="text-primary mt-2 block">
              Gå til leads
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Innstillinger</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Administrer systeminnstillinger.</p>
            <Link to="/admin/settings" className="text-primary mt-2 block">
              Gå til innstillinger
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
