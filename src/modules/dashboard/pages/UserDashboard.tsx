/**
 * User Dashboard - Mitt område
 * Personal user dashboard for service requests
 */

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { MyRequestsCard } from '../components/cards/user/MyRequestsCard';

export const UserDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Mitt område">
      <MyRequestsCard />
      {/* Additional cards to be implemented */}
    </DashboardLayout>
  );
};