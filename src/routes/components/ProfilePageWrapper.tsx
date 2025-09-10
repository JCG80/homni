import React from 'react';
import { ProfilePage } from '@/modules/auth/pages/ProfilePage';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';

export const ProfilePageWrapper = () => {
  return (
    <RoleDashboard title="Min profil">
      <ProfilePage />
    </RoleDashboard>
  );
};