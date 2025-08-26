import React from 'react';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { AnonymousLeadViewer } from '@/components/leads/AnonymousLeadViewer';

export const AnonymousLeadsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <PageBreadcrumb 
          items={[
            { label: 'Hjem', href: '/' },
            { label: 'Mine forespørsler' }
          ]} 
          className="mb-8"
        />
        <AnonymousLeadViewer />
      </div>
    </div>
  );
};