
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { Users, Settings, FileText, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Admin Dashboard">
      <h1 className="text-2xl font-bold mb-4">Admin Control Panel</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardWidget title="Overordnet statistikk">
          <div className="flex items-center gap-3">
            <BarChart className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-medium">Systemstatistikk</h3>
              <p className="text-sm text-muted-foreground">Se systemets nøkkeltall og trender</p>
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <span className="text-sm text-muted-foreground">Kommer snart</span>
          </div>
        </DashboardWidget>
        
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
            <Link to="/admin/users" className="text-sm text-primary hover:underline">View all</Link>
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
            <Link to="/admin/settings" className="text-sm text-primary hover:underline">Open settings</Link>
          </div>
        </DashboardWidget>
        
        <DashboardWidget title="Innholdsredigering">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-medium">Content Management</h3>
              <p className="text-sm text-muted-foreground">Edit website content and manage articles</p>
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <Link to="/admin/content" className="text-sm text-primary hover:underline">Open editor</Link>
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
            <Link to="/admin/leads" className="text-sm text-primary hover:underline">View all</Link>
          </div>
        </DashboardWidget>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
