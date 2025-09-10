import React from 'react';
import { MyAccountPage } from '@/pages/MyAccountPage';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';

export const AccountPageWrapper = () => {
  return (
    <RoleDashboard title="Min konto">
      <MyAccountPage />
    </RoleDashboard>
  );
};