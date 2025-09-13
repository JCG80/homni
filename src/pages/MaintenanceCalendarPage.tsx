import React from 'react';
import { Helmet } from 'react-helmet';
import { MaintenanceCalendar } from '@/modules/property/components/MaintenanceCalendar';

export default function MaintenanceCalendarPage() {
  return (
    <>
      <Helmet>
        <title>Vedlikeholdskalender - Homni</title>
        <meta name="description" content="Planlegg og spor vedlikeholdsoppgaver for alle eiendommer" />
        <meta name="keywords" content="vedlikehold, kalender, eiendommer, planlegging" />
      </Helmet>
      <div className="container mx-auto px-4 py-6">
        <MaintenanceCalendar />
      </div>
    </>
  );
}