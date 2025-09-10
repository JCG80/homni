import React from 'react';
import { BreadcrumbNavigation } from '@/components/navigation/BreadcrumbNavigation';
import { AnonymousLeadViewer } from '@/components/leads/AnonymousLeadViewer';

export const AnonymousLeadsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <BreadcrumbNavigation 
          customItems={[
            { label: 'Forside', href: '/', isActive: false },
            { label: 'Mine forespørsler', href: '', isActive: true }
          ]}
          showOnMobile
        />
        <AnonymousLeadViewer />
      </div>
    </div>
  );
};