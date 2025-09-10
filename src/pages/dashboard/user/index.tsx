import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { ConsolidatedUserDashboard } from '@/components/dashboard/ConsolidatedUserDashboard';

const UserDashboard = () => {
  return (
    <RoleDashboard requiredRole="user">
      <ConsolidatedUserDashboard />
    </RoleDashboard>
  );
};

export default UserDashboard;