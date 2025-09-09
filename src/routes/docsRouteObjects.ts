import { lazy, createElement } from 'react';
import type { AppRoute } from './routeTypes';

// Lazy load documentation components
const Documentation = lazy(() => 
  Promise.resolve().then(() => ({
    default: () => createElement('div', { className: 'p-6' }, [
      createElement('h1', { key: 'title', className: 'text-2xl font-bold' }, 'Documentation'),
      createElement('p', { key: 'desc', className: 'text-muted-foreground mt-2' }, 'Platform documentation and guides')
    ])
  }))
);

export const docsRouteObjects: AppRoute[] = [
  {
    path: '/docs',
    element: createElement(Documentation)
  }
];