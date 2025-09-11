import { lazy } from 'react';
import type { AppRoute } from './routeTypes';

// Lazy load leads components
const LeadsManagement = lazy(() => 
  Promise.resolve().then(() => ({
    default: () => (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Leads Management</h1>
        <p className="text-muted-foreground mt-2">Manage your leads and opportunities</p>
      </div>
    )
  }))
);

const LeadKanbanPage = lazy(() => 
  import('@/modules/leads/pages/LeadKanbanPage').then(m => ({ default: m.LeadKanbanPage }))
);

export const leadRouteObjects: AppRoute[] = [
  {
    path: '/leads',
    element: <LeadsManagement />,
    roles: ['admin', 'master_admin', 'company']
  },
  {
    path: '/leads/kanban',
    element: <LeadKanbanPage />,
    roles: ['admin', 'master_admin', 'company'],
    navKey: 'lead-kanban'
  },
  {
    path: '/lead-kanban',
    element: <LeadKanbanPage />,
    roles: ['admin', 'master_admin', 'company'],
    navKey: 'lead-kanban'
  }
];