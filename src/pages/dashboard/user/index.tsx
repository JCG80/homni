import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { SimplifiedUserDashboard } from '@/components/dashboard/simplified/SimplifiedUserDashboard';
import { UserDashboardFallback } from './UserDashboardFallback';
import { logger } from '@/utils/logger';

const UserDashboard = () => {
  try {
    return (
      <RoleDashboard requiredRole="user">
        <SimplifiedUserDashboard />
      </RoleDashboard>
    );
  } catch (error) {
    logger.error('UserDashboard error', { error });
    // Fallback if RoleDashboard fails
    return <UserDashboardFallback />;
  }
};

export default UserDashboard;