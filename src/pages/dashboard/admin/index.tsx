
import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { RoleSpecificDashboard } from '@/pages/dashboard/enhanced/RoleSpecificDashboard';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, Settings, Activity, ShieldCheck } from 'lucide-react';
import { DashboardWidget } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  return (
    <RoleDashboard requiredRole={['admin', 'master_admin']} title="Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Overview
            </CardTitle>
            <CardDescription>Current system status and metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <h3 className="text-2xl font-bold">42</h3>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <h3 className="text-2xl font-bold">8</h3>
                <p className="text-xs text-muted-foreground">Companies</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <h3 className="text-2xl font-bold">18</h3>
                <p className="text-xs text-muted-foreground">Active Leads</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <h3 className="text-2xl font-bold">5</h3>
                <p className="text-xs text-muted-foreground">Modules</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Recent Users</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Mari Hansen</span>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>John Olsen</span>
                    <span className="text-xs text-muted-foreground">5 hours ago</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Trond Berg</span>
                    <span className="text-xs text-muted-foreground">Yesterday</span>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">System Health</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Health</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Healthy</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Healthy</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Storage</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Warning</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <DashboardWidget
          title={
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <span>Security</span>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="text-sm font-medium mb-1">Last security scan</h4>
              <p className="text-xs text-muted-foreground">May 19, 2025 (Today)</p>
              <p className="text-xs mt-1 font-medium text-green-600">All tests passed</p>
            </div>
            
            <div className="space-y-2">
              <Button className="w-full justify-start" size="sm">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Run security audit
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <ShieldCheck className="mr-2 h-4 w-4" />
                View audit logs
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Update security settings
              </Button>
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title={
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>User Management</span>
            </div>
          }
        >
          <div className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link to="/admin/members">
                <Users className="mr-2 h-4 w-4" />
                Manage Members
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link to="/admin/roles">
                <Settings className="mr-2 h-4 w-4" />
                Role Management
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link to="/admin/feature-flags">
                <Settings className="mr-2 h-4 w-4" />
                Feature Flags
              </Link>
            </Button>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title={
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              <span>Company Management</span>
            </div>
          }
        >
          <div className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link to="/admin/companies">
                <Building className="mr-2 h-4 w-4" />
                Manage Companies
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link to="/admin/leads">
                <Activity className="mr-2 h-4 w-4" />
                Lead Distribution
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link to="/admin/system-modules">
                <Settings className="mr-2 h-4 w-4" />
                System Modules
              </Link>
            </Button>
          </div>
        </DashboardWidget>
      </div>
    </RoleDashboard>
  );
};

export default AdminDashboard;
