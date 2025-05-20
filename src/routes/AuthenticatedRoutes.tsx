
import React from 'react';
import { Route } from 'react-router-dom';
import MyAccountPage from '@/pages/MyAccountPage';
import { ProfilePage } from '@/modules/auth/pages/ProfilePage';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';

/**
 * Routes that require authentication but are not role-specific
 */
export const AuthenticatedRoutes = () => (
  <>
    <Route path="/my-account" element={
      <ProtectedRoute allowAnyAuthenticated>
        <MyAccountPage />
      </ProtectedRoute>
    } />
    
    <Route path="/profile" element={
      <ProtectedRoute allowAnyAuthenticated>
        <ProfilePage />
      </ProtectedRoute>
    } />
  </>
);
