import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PropertyDashboard } from '@/components/property/PropertyDashboard';

export const PropertyPage = () => {
  return (
    <PageLayout 
      title="Mine Eiendommer"
      description="Administrer dine eiendommer og dokumentasjon"
    >
      <PropertyDashboard />
    </PageLayout>
  );
};