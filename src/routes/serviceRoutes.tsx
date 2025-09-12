import React from 'react';
import type { AppRoute } from './routeTypes';
import { RequireAuth } from '@/components/auth/RequireAuth';

// Services page component
const ServicesPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Services</h1>
    <p className="text-muted-foreground mt-2">Available platform services</p>
  </div>
);

export const servicesRouteObjects: AppRoute[] = [
  {
    path: '/services',
    element: (
      <RequireAuth>
        <ServicesPage />
      </RequireAuth>
    ),
    roles: ['user', 'company', 'content_editor', 'admin', 'master_admin'],
    navKey: 'services'
  }
];