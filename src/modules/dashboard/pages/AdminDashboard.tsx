/**
 * Admin Dashboard - Operations
 * Operational oversight and lead management
 */

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LeadsFunnelCard } from '../components/cards/admin/LeadsFunnelCard';

export const AdminDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Operations">
      <LeadsFunnelCard />
      {/* Additional cards to be implemented */}
    </DashboardLayout>
  );
};