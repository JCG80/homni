import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { EnhancedUserDashboard } from '@/components/dashboard/EnhancedUserDashboard';

const UserDashboard = () => {
  return (
    <RoleDashboard requiredRole="user">
      <EnhancedUserDashboard />
    </RoleDashboard>
  );
};

export default UserDashboard;