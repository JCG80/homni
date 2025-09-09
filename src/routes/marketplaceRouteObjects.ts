import { lazy, createElement } from 'react';
import type { AppRoute } from './routeTypes';

// Lazy load marketplace components
const Marketplace = lazy(() => 
  Promise.resolve().then(() => ({
    default: () => createElement('div', { className: 'p-6' }, [
      createElement('h1', { key: 'title', className: 'text-2xl font-bold' }, 'Marketplace'),
      createElement('p', { key: 'desc', className: 'text-muted-foreground mt-2' }, 'Browse marketplace offerings')
    ])
  }))
);

export const marketplaceRouteObjects: AppRoute[] = [
  {
    path: '/marketplace',
    element: createElement(Marketplace),
    roles: ['user', 'company', 'admin', 'master_admin']
  }
];