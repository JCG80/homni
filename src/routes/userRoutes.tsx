import React from 'react';
import { Route } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';

// User dashboard component
const UserDashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">User Dashboard</h1>
    <p className="text-muted-foreground mt-2">Welcome to your user dashboard</p>
  </div>
);

export const userRoutes = [
  <Route 
    key="user-dashboard" 
    path="/dashboard/user" 
    element={
      <RequireAuth roles={['user']}>
        <UserDashboard />
      </RequireAuth>
    } 
  />,
];