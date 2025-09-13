import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { OptimizedUserDashboard } from '@/components/dashboard/optimized/OptimizedUserDashboard';
import { UserDashboardFallback } from './UserDashboardFallback';
import { logger } from '@/utils/logger';

const UserDashboard = () => {
  try {
    return (
      <RoleDashboard requiredRole="user">
        <OptimizedUserDashboard />
      </RoleDashboard>
    );
  } catch (error) {
    logger.error('UserDashboard error', { error });
    // Fallback if RoleDashboard fails
    return <UserDashboardFallback />;
  }
};

export default UserDashboard;