
import React from 'react';
import { Route } from 'react-router-dom';
import { ProfilePage } from '../modules/auth/pages/ProfilePage';
import { MyAccountPage } from '../pages/MyAccountPage';
import { RoleDashboard } from '../components/dashboard/RoleDashboard';

export const AuthenticatedRoutes = () => {
  return (
    <>
      <Route path="/profile" element={
        <RoleDashboard title="Min profil">
          <ProfilePage />
        </RoleDashboard>
      } />
      <Route path="/account" element={
        <RoleDashboard title="Min konto">
          <MyAccountPage />
        </RoleDashboard>
      } />
    </>
  );
};
