
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardWidget } from '@/components/dashboard';

const CompanyDashboard = () => (
  <DashboardLayout title="Company Dashboard">
    <DashboardWidget title="My Leads" />
    <DashboardWidget title="Subscription Status" />
    <DashboardWidget title="Leads Stats" />
    <DashboardWidget title="Ad Exposure Stats" />
  </DashboardLayout>
);

export default CompanyDashboard;
