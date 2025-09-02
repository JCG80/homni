import React from 'react';
import { useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { PropertyDetails } from '@/components/property/PropertyDetails';

export const PropertyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Eiendom ikke funnet</div>;
  }

  return (
    <PageLayout 
      title="Eiendomsdetaljer"
      description="Administrer eiendomsinformasjon og dokumenter"
    >
      <PropertyDetails propertyId={id} />
    </PageLayout>
  );
};