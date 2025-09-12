import React, { Suspense } from 'react';
import { useRoutes, type RouteObject } from 'react-router-dom';
import { mainRouteObjects } from '@/routes/mainRouteObjects';
import { adminRouteObjects } from '@/routes/adminRouteObjects';
import { leadRouteObjects } from '@/routes/leadRouteObjects';
import { docsRouteObjects } from '@/routes/docsRouteObjects';
import { listingsRouteObjects } from '@/routes/listingsRouteObjects';
import { maintenanceRouteObjects } from '@/routes/maintenanceRouteObjects';
import { applyFeatureFlags } from '@/routes/filters';
import type { AppRoute } from '@/routes/routeTypes';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useCurrentRole } from '@/hooks/useCurrentRole';
import { Link } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/error/RouteErrorBoundary';
import { RouterDiagnostics } from '@/components/router/RouterDiagnostics';
import { RouterEmergencyFallback } from '@/components/debug/RouterEmergencyFallback';

// Loading fallback component
const RouteLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-muted-foreground">Laster inn...</p>
    </div>
  </div>
);

// 404 not found component  
const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
    <div className="space-y-4">
      <h1 className="text-4xl font-bold text-foreground">404</h1>
      <h2 className="text-2xl font-semibold text-muted-foreground">Siden ble ikke funnet</h2>
      <p className="text-muted-foreground max-w-md">
        Siden du leter etter eksisterer ikke eller har blitt flyttet.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Gå til forsiden
        </Link>
        <Link 
          to="/dashboard" 
          className="inline-flex items-center justify-center px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </div>
  </div>
);

// Unauthorized page component
const UnauthorizedPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Ingen tilgang</h1>
    <p className="text-muted-foreground mt-2">Du har ikke tilgang til denne siden.</p>
  </div>
);

// Convert route objects to React Router format, handling type compatibility
function convertToRouteObjects(routes: AppRoute[]): RouteObject[] {
  return routes.map(route => {
    // Handle index routes specially
    if (route.index) {
      return {
        index: true,
        element: route.element,
      } as RouteObject;
    }
    
    // Regular routes
    const routeObject: RouteObject = {
      path: route.path,
      element: route.element,
    };
    
    if (route.children && route.children.length > 0) {
      routeObject.children = convertToRouteObjects(route.children);
    }
    
    return routeObject;
  });
}

export function Shell() {
  const flags = useFeatureFlags();
  const role = useCurrentRole();
  
  // Debug logging for development
  if (import.meta.env.DEV) {
    console.info('Router Debug:', { 
      role, 
      flags: Object.entries(flags).filter(([_, v]) => v).map(([k]) => k),
      routerMode: import.meta.env.VITE_ROUTER_MODE || 'browser',
      pathname: window.location.pathname,
      baseUrl: import.meta.env.BASE_URL || '/'
    });
  }
  
  const allRoutes = [
    ...mainRouteObjects,
    ...adminRouteObjects,
    ...leadRouteObjects,
    ...docsRouteObjects,
    ...listingsRouteObjects,
    ...maintenanceRouteObjects,
  ];
  
  // Apply feature flags and role filtering with error handling
  let filteredRoutes: AppRoute[] = [];
  try {
    filteredRoutes = applyFeatureFlags(allRoutes, flags, role);
  } catch (error) {
    console.error('Route filtering failed:', error);
    // Fallback to basic routes if filtering fails
    filteredRoutes = mainRouteObjects.filter(route => !route.flag && (!route.roles || route.roles.includes('guest')));
  }
  
  // Debug filtered routes in development
  if (import.meta.env.DEV) {
    console.info('Filtered routes:', filteredRoutes.map(r => r.path));
  }

  // Convert to React Router compatible format
  const routeElements: RouteObject[] = [
    ...convertToRouteObjects(filteredRoutes),
    // Error routes - always available
    { path: '/unauthorized', element: <UnauthorizedPage /> },
    { path: '/emergency', element: <RouterEmergencyFallback /> },
    { path: '*', element: <NotFound /> }
  ];

  const routes = useRoutes(routeElements);

  // Emergency fallback if no routes are rendered and we're in a problematic state
  if (!routes && filteredRoutes.length === 0) {
    return <RouterEmergencyFallback />;
  }

  return (
    <RouteErrorBoundary>
      <Suspense fallback={<RouteLoadingFallback />}>
        {routes}
      </Suspense>
      
      {/* Router diagnostics for development */}
      <RouterDiagnostics />
    </RouteErrorBoundary>
  );
}