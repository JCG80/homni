/**
 * Master Admin Dashboard - Platform Control
 * Complete system oversight and governance
 */

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SystemHealthCard } from '../components/cards/master-admin/SystemHealthCard';
import { FeatureFlagsCard } from '../components/cards/master-admin/FeatureFlagsCard';

export const MasterAdminDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Platform Control">
      <SystemHealthCard />
      <FeatureFlagsCard />
      {/* Additional cards to be implemented */}
    </DashboardLayout>
  );
};