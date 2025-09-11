import { lazy, createElement } from 'react';
import type { AppRoute } from './routeTypes';

// Lazy load leads components
const LeadsManagement = lazy(() => 
  Promise.resolve().then(() => ({
    default: () => createElement('div', { className: 'p-6' }, [
      createElement('h1', { key: 'title', className: 'text-2xl font-bold' }, 'Leads Management'),
      createElement('p', { key: 'desc', className: 'text-muted-foreground mt-2' }, 'Manage your leads and opportunities')
    ])
  }))
);

const LeadKanbanPage = lazy(() => 
  import('@/modules/leads/pages/LeadKanbanPage').then(m => ({ default: m.LeadKanbanPage }))
);

export const leadRouteObjects: AppRoute[] = [
  {
    path: '/leads',
    element: createElement(LeadsManagement),
    roles: ['admin', 'master_admin', 'company']
  },
  {
    path: '/leads/kanban',
    element: createElement(LeadKanbanPage),
    roles: ['admin', 'master_admin', 'company'],
    navKey: 'lead-kanban'
  },
  {
    path: '/lead-kanban',
    element: createElement(LeadKanbanPage),
    roles: ['admin', 'master_admin', 'company'],
    navKey: 'lead-kanban'
  }
];