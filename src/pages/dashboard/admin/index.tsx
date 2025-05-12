
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { Users, Settings, FileText } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Admin Dashboard">
      <h1 className="text-2xl font-bold mb-4">Admin Control Panel</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardWidget title="User Management">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-medium">Manage Users</h3>
              <p className="text-sm text-muted-foreground">View and modify user accounts</p>
            </div>
          </div>
          <div className="mt-4 border-t pt-4 flex justify-between">
            <span className="text-sm text-muted-foreground">Active users: 48</span>
            <a href="/admin/users" className="text-sm text-primary hover:underline">View all</a>
          </div>
        </DashboardWidget>
        
        <DashboardWidget title="System Settings">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-medium">Configure System</h3>
              <p className="text-sm text-muted-foreground">Adjust system parameters and settings</p>
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <a href="/admin/settings" className="text-sm text-primary hover:underline">Open settings</a>
          </div>
        </DashboardWidget>
        
        <DashboardWidget title="Leads Management">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-medium">Customer Leads</h3>
              <p className="text-sm text-muted-foreground">View and assign customer leads</p>
            </div>
          </div>
          <div className="mt-4 border-t pt-4 flex justify-between">
            <span className="text-sm text-muted-foreground">New leads: 12</span>
            <a href="/admin/leads" className="text-sm text-primary hover:underline">View all</a>
          </div>
        </DashboardWidget>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
