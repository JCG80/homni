
import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Database, Activity, BarChart, Settings, Users } from 'lucide-react';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const MasterAdminDashboard: React.FC = () => {
  return (
    <RoleDashboard requiredRole="master_admin" title="Master Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>Master system overview and controls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <h3 className="text-2xl font-bold">99.98%</h3>
                <p className="text-xs text-muted-foreground">System Uptime</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <h3 className="text-2xl font-bold">142 ms</h3>
                <p className="text-xs text-muted-foreground">Avg Response</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <h3 className="text-2xl font-bold">0</h3>
                <p className="text-xs text-muted-foreground">Critical Alerts</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <h3 className="text-2xl font-bold">2</h3>
                <p className="text-xs text-muted-foreground">Warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <DashboardWidget
          title={
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <span>Database Controls</span>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="text-sm font-medium">Database Status</h4>
              <div className="flex justify-between mt-2">
                <span className="text-sm">Connection pool</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Healthy</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm">Query performance</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Optimized</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm">Storage</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">75% used</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm">
                Run Migrations
              </Button>
              <Button size="sm" variant="outline">
                Backup Now
              </Button>
              <Button size="sm" variant="outline">
                Test Rollback
              </Button>
              <Button size="sm" variant="outline">
                Query Monitor
              </Button>
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title={
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <span>System Activity</span>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-muted/40 rounded">
                <span className="text-sm">Database migration</span>
                <span className="text-xs text-muted-foreground">30 min ago</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/40 rounded">
                <span className="text-sm">Feature flag updated</span>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/40 rounded">
                <span className="text-sm">New admin account</span>
                <span className="text-xs text-muted-foreground">Yesterday</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/40 rounded">
                <span className="text-sm">System backup</span>
                <span className="text-xs text-muted-foreground">Yesterday</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full" size="sm">
              View complete activity log
            </Button>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title={
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              <span>Performance</span>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">CPU Usage</span>
                <span className="text-sm font-medium">24%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-1/4 rounded-full"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Memory Usage</span>
                <span className="text-sm font-medium">38%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/5 rounded-full"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">API Response Time</span>
                <span className="text-sm font-medium">142 ms</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-1/5 rounded-full"></div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full" size="sm">
              View detailed metrics
            </Button>
          </div>
        </DashboardWidget>
        
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Master Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild>
                <Link to="/admin/system-modules">
                  <Settings className="mr-2 h-5 w-5" />
                  System Modules
                </Link>
              </Button>
              <Button asChild>
                <Link to="/admin/feature-flags">
                  <Settings className="mr-2 h-5 w-5" />
                  Feature Flags
                </Link>
              </Button>
              <Button asChild>
                <Link to="/admin/internal-access">
                  <Users className="mr-2 h-5 w-5" />
                  Internal Access
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/admin/roles">
                  <Users className="mr-2 h-5 w-5" />
                  Role Management
                </Link>
              </Button>
              <Button variant="outline">
                <Database className="mr-2 h-5 w-5" />
                Database Management
              </Button>
              <Button variant="outline">
                <ShieldCheck className="mr-2 h-5 w-5" />
                Security Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleDashboard>
  );
};

export default MasterAdminDashboard;
