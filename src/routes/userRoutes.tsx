import React from 'react';
import { Route } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { PropertyPage } from '@/pages/PropertyPage';
import { PropertyDetailsPage } from '@/pages/PropertyDetailsPage';
import { DIYSalesPage } from '@/pages/DIYSalesPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { CompanyAnalyticsPage } from '@/pages/CompanyAnalyticsPage';
import { AdminAnalyticsPage } from '@/pages/AdminAnalyticsPage';

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
  <Route 
    key="property" 
    path="/property" 
    element={
      <RequireAuth roles={['user', 'company', 'admin', 'master_admin']}>
        <PropertyPage />
      </RequireAuth>
    } 
  />,
  <Route 
    key="property-details" 
    path="/property/:id" 
    element={
      <RequireAuth roles={['user', 'company', 'admin', 'master_admin']}>
        <PropertyDetailsPage />
      </RequireAuth>
    } 
  />,
  <Route 
    key="diy-sales" 
    path="/diy-sales" 
    element={
      <RequireAuth roles={['user', 'company', 'admin', 'master_admin']}>
        <DIYSalesPage />
      </RequireAuth>
    } 
  />,
  <Route 
    key="analytics" 
    path="/analytics" 
    element={
      <RequireAuth roles={['user', 'company', 'admin', 'master_admin']}>
        <AnalyticsPage />
      </RequireAuth>
    } 
  />,
  <Route 
    key="company-analytics" 
    path="/company-analytics" 
    element={
      <RequireAuth roles={['company', 'admin', 'master_admin']}>
        <CompanyAnalyticsPage />
      </RequireAuth>
    } 
  />,
  <Route 
    key="admin-analytics" 
    path="/admin-analytics" 
    element={
      <RequireAuth roles={['admin', 'master_admin']}>
        <AdminAnalyticsPage />
      </RequireAuth>
    } 
  />,
];