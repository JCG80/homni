import { lazy, createElement } from 'react';
import { AppRoute } from './routeTypes';

const PropertyPage = lazy(() => import('@/pages/PropertyPage'));

export const listingsRouteObjects: AppRoute[] = [
  {
    path: '/properties',
    element: createElement(PropertyPage),
    roles: ['user', 'company', 'admin', 'master_admin'],
    flag: 'ENABLE_PROPERTY_MANAGEMENT',
    navKey: 'properties'
  }
];