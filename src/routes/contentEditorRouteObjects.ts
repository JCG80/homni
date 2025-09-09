import { lazy, createElement } from 'react';
import type { AppRoute } from './routeTypes';

// Lazy load content editor components
const ContentEditor = lazy(() => 
  Promise.resolve().then(() => ({
    default: () => createElement('div', { className: 'p-6' }, [
      createElement('h1', { key: 'title', className: 'text-2xl font-bold' }, 'Content Editor'),
      createElement('p', { key: 'desc', className: 'text-muted-foreground mt-2' }, 'Manage and edit content')
    ])
  }))
);

export const contentEditorRouteObjects: AppRoute[] = [
  {
    path: '/dashboard/content-editor',
    element: createElement(ContentEditor),
    roles: ['content_editor', 'admin', 'master_admin']
  }
];