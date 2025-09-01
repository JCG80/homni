import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { RoleSpecificDashboard } from '@/pages/dashboard/enhanced/RoleSpecificDashboard';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';

const UserDashboard = () => {
  const { user } = useIntegratedAuth();
  
  return (
    <RoleDashboard requiredRole="user" module="user_dashboard">
      <RoleSpecificDashboard role="user" user={user} />
    </RoleDashboard>
  );
};

export default UserDashboard;