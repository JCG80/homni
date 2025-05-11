
import React from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const CompanyDashboard: React.FC = () => {
  const { user, profile, module_access } = useAuth();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Bedriftsdashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Velkommen</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Hei {profile?.full_name || user?.email}! Velkommen til din bedriftsside.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Mine moduler</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Her er modulene din bedrift har tilgang til:</p>
            <ul className="list-disc pl-5 mt-2">
              {module_access.length > 0 ? (
                module_access.map((module, index) => (
                  <li key={index}>{module}</li>
                ))
              ) : (
                <li className="text-muted-foreground">Ingen moduler aktivert</li>
              )}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Her vil du se dine nye leads.</p>
            {/* TODO: Show recent leads */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDashboard;
