
import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, BarChart, Calendar, Plus, Users } from 'lucide-react';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CompanyDashboard: React.FC = () => {
  return (
    <RoleDashboard requiredRole="company" title="Company Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Lead overview widget */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Lead Overview
            </CardTitle>
            <CardDescription>Recent leads and activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <h3 className="text-2xl font-bold">12</h3>
                <p className="text-sm text-muted-foreground">New leads</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <h3 className="text-2xl font-bold">5</h3>
                <p className="text-sm text-muted-foreground">In progress</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <h3 className="text-2xl font-bold">4</h3>
                <p className="text-sm text-muted-foreground">Converted</p>
              </div>
            </div>
            
            <div className="rounded-lg border border-muted p-4">
              <h4 className="font-medium mb-3">Recent activity</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-muted/40 rounded">
                  <span className="text-sm">Anders Pedersen - Home insurance</span>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted/40 rounded">
                  <span className="text-sm">Mia Hansen - Property listing</span>
                  <span className="text-xs text-muted-foreground">Yesterday</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted/40 rounded">
                  <span className="text-sm">Lars Johansen - Mortgage quote</span>
                  <span className="text-xs text-muted-foreground">Yesterday</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <Button variant="outline" asChild>
                <Link to="/dashboard/leads/kanban">
                  View Kanban <Calendar className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild>
                <Link to="/leads">
                  View all leads <Activity className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analytics summary widget */}
        <DashboardWidget
          title={
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              <span>Analytics Summary</span>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Conversion rate</span>
                <span className="text-sm font-medium">24%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-1/4 rounded-full"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Response time</span>
                <span className="text-sm font-medium">1.4 hours</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-3/4 rounded-full"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Customer satisfaction</span>
                <span className="text-sm font-medium">92%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-11/12 rounded-full"></div>
              </div>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <Link to="/dashboard/analytics">
                Full analytics report
              </Link>
            </Button>
          </div>
        </DashboardWidget>

        {/* Quick actions widget */}
        <DashboardWidget
          title={
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              <span>Quick Actions</span>
            </div>
          }
        >
          <div className="grid gap-2">
            <Button className="justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Create lead
            </Button>
            <Button variant="outline" className="justify-start">
              <Activity className="mr-2 h-4 w-4" />
              Update lead status
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="mr-2 h-4 w-4" />
              Update company profile
            </Button>
            <Button variant="outline" className="justify-start">
              <BarChart className="mr-2 h-4 w-4" />
              Generate report
            </Button>
          </div>
        </DashboardWidget>

        {/* Team members widget */}
        <DashboardWidget
          title={
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Team Members</span>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-medium">KL</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Kari Larsen</p>
                  <p className="text-xs text-muted-foreground">Lead Manager</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-medium">OB</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Ole Berg</p>
                  <p className="text-xs text-muted-foreground">Sales Rep</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-medium">SN</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Sofia Nielsen</p>
                  <p className="text-xs text-muted-foreground">Sales Rep</p>
                </div>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="w-full">
              <Users className="mr-2 h-4 w-4" />
              Manage team
            </Button>
          </div>
        </DashboardWidget>
      </div>
    </RoleDashboard>
  );
};

export default CompanyDashboard;
