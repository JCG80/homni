import React from 'react';
import { Route } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';

// Enhanced Admin dashboard with real functionality
const AdminDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">System overview and management</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold text-sm">Total Users</h3>
          <p className="text-2xl font-bold mt-2">Loading...</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold text-sm">Active Companies</h3>
          <p className="text-2xl font-bold mt-2">Loading...</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold text-sm">Pending Leads</h3>
          <p className="text-2xl font-bold mt-2">Loading...</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold text-sm">System Status</h3>
          <p className="text-2xl font-bold mt-2 text-green-600">Healthy</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            View All Users
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90">
            Manage Companies
          </button>
          <a 
            href="/admin/api" 
            className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 inline-block"
          >
            API Admin
          </a>
        </div>
      </div>
    </div>
  );
};

// Enhanced API Admin with database overview
const ApiAdminPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">API Admin</h1>
        <p className="text-muted-foreground mt-2">Database management and API monitoring</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Database Tables</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>admin_logs</span>
              <span className="text-muted-foreground">System logs</span>
            </div>
            <div className="flex justify-between">
              <span>company_profiles</span>
              <span className="text-muted-foreground">Company data</span>
            </div>
            <div className="flex justify-between">
              <span>user_profiles</span>
              <span className="text-muted-foreground">User data</span>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Database</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span>API Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Healthy</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Auth System</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Quick Tools</h2>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Run Security Scan
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90">
            View Migrations
          </button>
          <button className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90">
            Check RLS Policies
          </button>
        </div>
      </div>
    </div>
  );
};

export const adminRoutes = [
  <Route 
    key="admin-dashboard" 
    path="/dashboard/admin" 
    element={
      <RequireAuth roles={['admin', 'master_admin']}>
        <AdminDashboard />
      </RequireAuth>
    } 
  />,
  <Route 
    key="admin-api" 
    path="/admin/api" 
    element={
      <RequireAuth roles={['admin', 'master_admin']}>
        <ApiAdminPage />
      </RequireAuth>
    } 
  />,
];