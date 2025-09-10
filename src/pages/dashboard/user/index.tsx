import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { SimplifiedUserDashboard } from '@/components/dashboard/SimplifiedUserDashboard';

const UserDashboard = () => {
  return (
    <RoleDashboard requiredRole="user">
      <SimplifiedUserDashboard />
    </RoleDashboard>
  );
};

export default UserDashboard;