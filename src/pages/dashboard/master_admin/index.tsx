
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { Users, Shield, Database, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const MasterAdminDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Master Admin Dashboard">
      <h1 className="text-2xl font-bold mb-4">Master Admin Control Panel</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <DashboardWidget title="Admin User Management">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-medium">Admin Users</h3>
              <p className="text-sm text-muted-foreground">Manage admin accounts and permissions</p>
            </div>
          </div>
          <div className="mt-4 border-t pt-4 flex justify-between">
            <span className="text-sm text-muted-foreground">Admin users: 5</span>
            <Link to="/admin/internal-access" className="text-sm text-primary hover:underline">Manage</Link>
          </div>
        </DashboardWidget>
        
        <DashboardWidget title="Role Management">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-medium">User Roles</h3>
              <p className="text-sm text-muted-foreground">Configure roles and permissions</p>
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <Link to="/admin/roles" className="text-sm text-primary hover:underline">Manage roles</Link>
          </div>
        </DashboardWidget>
        
        <DashboardWidget title="System Modules">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-medium">System Modules</h3>
              <p className="text-sm text-muted-foreground">Configure system modules and integrations</p>
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <Link to="/admin/system-modules" className="text-sm text-primary hover:underline">Configure modules</Link>
          </div>
        </DashboardWidget>
        
        <DashboardWidget title="Global Settings">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-medium">System Configuration</h3>
              <p className="text-sm text-muted-foreground">Global system settings and parameters</p>
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <Link to="/admin/settings" className="text-sm text-primary hover:underline">Configure system</Link>
          </div>
        </DashboardWidget>
      </div>
    </DashboardLayout>
  );
};

export default MasterAdminDashboard;
