import React from 'react';
import { Route } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';

// Admin dashboard component
const AdminDashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
    <p className="text-muted-foreground mt-2">Welcome to the admin dashboard</p>
  </div>
);

// API Admin placeholder 
const ApiAdminPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">API Admin</h1>
    <p className="text-muted-foreground mt-2">API management interface</p>
  </div>
);

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