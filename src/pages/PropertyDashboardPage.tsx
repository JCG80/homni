import React from 'react';
import { Helmet } from 'react-helmet';
import { PropertyDashboard } from '@/modules/property/pages/PropertyDashboard';

export default function PropertyDashboardPage() {
  return (
    <>
      <Helmet>
        <title>Eiendomsoversikt – Administrer eiendommer</title>
        <meta name="description" content="Administrer eiendommer, dokumenter og vedlikehold" />
        <link rel="canonical" href="/properties" />
      </Helmet>
      <PropertyDashboard />
    </>
  );
}
