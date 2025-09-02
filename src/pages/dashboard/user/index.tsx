import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { RoleSpecificDashboard } from '@/pages/dashboard/enhanced/RoleSpecificDashboard';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';

const UserDashboard = () => {
  const { user } = useIntegratedAuth();
  
  return (
    <RoleDashboard requiredRole="user">
      <RoleSpecificDashboard role="user" user={user} />
    </RoleDashboard>
  );
};

export default UserDashboard;