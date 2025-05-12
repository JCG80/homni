
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardWidget } from '@/components/dashboard';

const ContentEditorDashboard = () => (
  <DashboardLayout title="Content Editor Dashboard">
    <DashboardWidget title="Content List" />
    <DashboardWidget title="Content Editor" />
    <DashboardWidget title="Preview" />
  </DashboardLayout>
);

export default ContentEditorDashboard;
