import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { Dashboard } from '@/pages/Dashboard';
import { ProfilePage } from '@/modules/auth/pages/ProfilePage';
import { MyAccountPage } from '@/pages/MyAccountPage';
import { UserRole } from '@/modules/auth/utils/roles/types';

/**
 * Routes specifically for authenticated users (regular users)
 */
export const userRoutes = (
  <>
    {/* User Dashboard */}
    <Route 
      path="/dashboard/user" 
      element={
        <RoleDashboard title="Bruker Dashboard" requiredRole="user">
          <Dashboard />
        </RoleDashboard>
      } 
    />
    
    {/* User Profile */}
    <Route 
      path="/profile" 
      element={
        <RoleDashboard title="Min profil">
          <ProfilePage />
        </RoleDashboard>
      } 
    />
    
    {/* User Account */}
    <Route 
      path="/account" 
      element={
        <RoleDashboard title="Min konto">
          <MyAccountPage />
        </RoleDashboard>
      } 
    />
    
    {/* Remove dashboard redirect - handled by DashboardRoutes */}
  </>
);