
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { Users, Shield, Database, Settings, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';

export const MasterAdminDashboard = () => {
  const { profile } = useAuth();
  
  return (
    <DashboardLayout title="Master Administrator Dashboard">
      <DashboardWidget title="User Management">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">User Management</h3>
            <p className="text-sm text-muted-foreground">Manage all system users and roles</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4 flex justify-between">
          <span className="text-sm">Total users: 125</span>
          <a href="/admin/members" className="text-sm text-primary hover:underline">Manage Users</a>
        </div>
      </DashboardWidget>
      
      <DashboardWidget title="Role Management">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">Role Management</h3>
            <p className="text-sm text-muted-foreground">Manage user roles and permissions</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4 flex justify-between">
          <span className="text-sm">5 roles configured</span>
          <a href="/admin/roles" className="text-sm text-primary hover:underline">Manage Roles</a>
        </div>
      </DashboardWidget>
      
      <DashboardWidget title="System Alerts">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
          <div>
            <h3 className="font-medium">System Alerts</h3>
            <p className="text-sm text-muted-foreground">Critical system notifications</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <p className="text-sm text-green-600 flex items-center">
            <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
            All systems operational
          </p>
          <p className="text-sm text-muted-foreground mt-2">No critical alerts</p>
        </div>
      </DashboardWidget>
      
      <DashboardWidget title="Database Management">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">Database Management</h3>
            <p className="text-sm text-muted-foreground">Monitor and manage database operations</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm">Storage usage</span>
            <span className="text-sm font-medium">46%</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm">Last backup</span>
            <span className="text-sm font-medium">Today, 03:00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Status</span>
            <span className="text-sm font-medium text-green-600">Healthy</span>
          </div>
        </div>
      </DashboardWidget>
    </DashboardLayout>
  );
};

export default MasterAdminDashboard;
