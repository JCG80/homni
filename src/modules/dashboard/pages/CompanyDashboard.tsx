/**
 * Company Dashboard - Min bedrift
 * Company-focused lead and business management
 */

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TodayLeadsCard } from '../components/cards/company/TodayLeadsCard';

export const CompanyDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Min bedrift">
      <TodayLeadsCard />
      {/* Additional cards to be implemented */}
    </DashboardLayout>
  );
};