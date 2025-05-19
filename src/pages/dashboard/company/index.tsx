
import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart } from 'lucide-react';
import { LeadKanbanWidget } from '@/modules/leads/components/kanban/LeadKanbanWidget';

const CompanyDashboard: React.FC = () => {
  return (
    <RoleDashboard requiredRole="company" title="Company Dashboard">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Lead Overview</CardTitle>
              <CardDescription>Manage your customer leads</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <LeadKanbanWidget className="mb-8" />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Overview of your business metrics</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <BarChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Analytics will be available once you have more data</p>
                <Button variant="link">Configure Analytics</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                Create Lead
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Update Company Profile
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Manage Lead Settings
              </Button>
              <Button className="w-full justify-start" variant="outline">
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleDashboard>
  );
};

export default CompanyDashboard;
