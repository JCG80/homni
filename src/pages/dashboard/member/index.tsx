
import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building, FileText, Clock, Plus, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';

const MemberDashboard: React.FC = () => {
  return (
    <RoleDashboard requiredRole="user" title="User Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              My Properties
            </CardTitle>
            <CardDescription>View and manage your properties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-dashed border-muted p-8 text-center space-y-4">
              <Building className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                You have no properties yet. Add your first property to get started.
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Property
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <p className="text-sm text-muted-foreground">Properties will appear here</p>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/properties">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Documents
            </CardTitle>
            <CardDescription>Access your property documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-dashed border-muted p-6 text-center">
                <FileText className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No recent documents found. Documents will appear here once you add a property.
                </p>
              </div>
              <Button variant="outline" className="w-full">
                Upload Document
              </Button>
            </div>
          </CardContent>
        </Card>

        <DashboardWidget
          title={
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Upcoming Maintenance</span>
            </div>
          }
        >
          <div className="rounded-lg border border-dashed border-muted p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No upcoming maintenance tasks. They will appear here once you add a property.
            </p>
            <Button variant="link" size="sm" className="mt-2">
              Create maintenance task
            </Button>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title={
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              <span>Property Documents</span>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-muted p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Document templates</p>
                  <p className="text-xs text-muted-foreground">Browse available templates</p>
                </div>
                <Button variant="ghost" size="icon">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="rounded-lg border border-muted p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Document management</p>
                  <p className="text-xs text-muted-foreground">Organize your documents</p>
                </div>
                <Button variant="ghost" size="icon">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DashboardWidget>
      </div>
    </RoleDashboard>
  );
};

export default MemberDashboard;
