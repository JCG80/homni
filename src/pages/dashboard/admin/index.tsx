
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { Users, FileText, Settings, BarChart, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';

export const AdminDashboard = () => {
  const { profile } = useAuth();
  
  return (
    <DashboardLayout title="Administrator Dashboard">
      <DashboardWidget title="Lead Management">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">Lead Management</h3>
            <p className="text-sm text-muted-foreground">Monitor and manage all incoming leads</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4 flex justify-between">
          <span className="text-sm text-muted-foreground">No new leads requiring attention</span>
          <a href="/admin/leads" className="text-sm text-primary hover:underline">View All</a>
        </div>
      </DashboardWidget>
      
      <DashboardWidget title="System Modules">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">System Configuration</h3>
            <p className="text-sm text-muted-foreground">Manage system modules and features</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4 flex justify-between">
          <span className="text-sm">10 active modules</span>
          <a href="/admin/system-modules" className="text-sm text-primary hover:underline">Manage Modules</a>
        </div>
      </DashboardWidget>
      
      <DashboardWidget title="Performance Metrics">
        <div className="flex items-center gap-3">
          <BarChart className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium">System Performance</h3>
            <p className="text-sm text-muted-foreground">Monitor key performance metrics</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm">Database queries</span>
            <span className="text-sm font-medium">Good</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm">API response time</span>
            <span className="text-sm font-medium">Excellent</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Storage usage</span>
            <span className="text-sm font-medium">43%</span>
          </div>
        </div>
      </DashboardWidget>
    </DashboardLayout>
  );
};

export default AdminDashboard;
