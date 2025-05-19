
import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const MemberDashboard: React.FC = () => {
  return (
    <RoleDashboard requiredRole="member" title="Member Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Properties</CardTitle>
            <CardDescription>View and manage your properties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You have no properties yet. Add your first property to get started.
            </p>
            <Button>
              Add Property <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Access your property documents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No recent documents found. Documents will appear here once you add a property.
            </p>
          </CardContent>
        </Card>
      </div>
    </RoleDashboard>
  );
};

export default MemberDashboard;
