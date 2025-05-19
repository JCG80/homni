
import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Database, Server, Settings, ArrowRight } from 'lucide-react';

const MasterAdminDashboard: React.FC = () => {
  return (
    <RoleDashboard requiredRole="master_admin" title="Master Admin Dashboard">
      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">System Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="font-medium text-sm">All Systems Operational</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">API Requests</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="text-2xl font-bold">1.2k</div>
              <p className="text-xs text-muted-foreground">
                Past 24 hours
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Error Rate</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="text-2xl font-bold">0.02%</div>
              <p className="text-xs text-muted-foreground">
                Past 24 hours
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Active Users</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="text-2xl font-bold">57</div>
              <p className="text-xs text-muted-foreground">
                Currently online
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Administration</CardTitle>
              <CardDescription>Advanced system controls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="mr-2 h-4 w-4" /> Security Settings
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Database className="mr-2 h-4 w-4" /> Database Management
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Server className="mr-2 h-4 w-4" /> Server Configuration
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="mr-2 h-4 w-4" /> System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="border-b pb-2">
                  <p className="font-medium">Database Backup Complete</p>
                  <p className="text-xs text-muted-foreground">Today, 08:30</p>
                </div>
                
                <div className="border-b pb-2">
                  <p className="font-medium">System Update Completed</p>
                  <p className="text-xs text-muted-foreground">Yesterday, 23:15</p>
                </div>
                
                <div className="border-b pb-2">
                  <p className="font-medium">Security Scan Completed</p>
                  <p className="text-xs text-muted-foreground">Yesterday, 14:22</p>
                </div>
                
                <Button variant="link" className="pl-0">
                  View All Logs <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleDashboard>
  );
};

export default MasterAdminDashboard;
