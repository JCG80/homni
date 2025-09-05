import React from 'react';
import { EnhancedUserDashboard } from './EnhancedUserDashboard';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/modules/auth/hooks';

const UserDashboard = () => {
  const { profile } = useAuth();
  
  return (
    <PageLayout 
      title={`Min Dashboard - ${profile?.full_name || 'Homni'}`}
      description="Se oversikt over dine forespørsler og aktivitet på Homni"
    >
      <EnhancedUserDashboard />
    </PageLayout>
  );
};

export default UserDashboard;