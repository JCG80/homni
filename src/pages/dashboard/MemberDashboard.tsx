
import React from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Medlemsdashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Velkommen</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Hei {user?.email}! Velkommen til din medlemsside.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Mine tjenester</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Her vil du se dine aktiverte tjenester.</p>
            {/* TODO: List user's active services */}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Siste aktivitet</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Ingen nylig aktivitet.</p>
            {/* TODO: Show recent activity */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberDashboard;
