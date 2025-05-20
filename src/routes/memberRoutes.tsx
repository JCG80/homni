
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { Dashboard } from '@/pages/Dashboard';
import { ProfilePage } from '@/modules/auth/pages/ProfilePage';
import { MyAccountPage } from '@/pages/MyAccountPage';
import { UserRole } from '@/modules/auth/utils/roles/types';

/**
 * Routes specifically for authenticated members (regular users)
 */
export const memberRoutes = (
  <>
    {/* Member Dashboard */}
    <Route 
      path="/dashboard/member" 
      element={
        <RoleDashboard title="Medlem Dashboard" requiredRole="member">
          <Dashboard />
        </RoleDashboard>
      } 
    />
    
    {/* Member Profile */}
    <Route 
      path="/profile" 
      element={
        <RoleDashboard title="Min profil">
          <ProfilePage />
        </RoleDashboard>
      } 
    />
    
    {/* Member Account */}
    <Route 
      path="/account" 
      element={
        <RoleDashboard title="Min konto">
          <MyAccountPage />
        </RoleDashboard>
      } 
    />
    
    {/* Default dashboard redirect */}
    <Route 
      path="/dashboard" 
      element={<Navigate to="/dashboard/member" replace />} 
    />
  </>
);
