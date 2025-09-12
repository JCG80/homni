import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { UserDashboardFallback } from './UserDashboardFallback';
import { logger } from '@/utils/logger';

const UserDashboard = () => {
  try {
    return (
      <RoleDashboard requiredRole="user">
        <UserDashboardFallback />
      </RoleDashboard>
    );
  } catch (error) {
    logger.error('UserDashboard error', { error });
    // Fallback if RoleDashboard fails
    return <UserDashboardFallback />;
  }
};

export default UserDashboard;