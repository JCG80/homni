/**
 * Content Editor Dashboard - Content & SEO
 * Content management and SEO optimization tools
 */

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DraftsCard } from '../components/cards/content/DraftsCard';

export const ContentEditorDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Content & SEO">
      <DraftsCard />
      {/* Additional content editor cards to be implemented */}
    </DashboardLayout>
  );
};