import React, { Suspense, useEffect } from 'react';
import { useRoutes, type RouteObject, useNavigate } from 'react-router-dom';
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
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Link } from 'react-router-dom';
import { isLovablePreviewHost } from '@/lib/env/hosts';
import { RouteErrorBoundary } from '@/components/error/RouteErrorBoundary';
import { RouterDiagnostics } from '@/components/router/RouterDiagnostics';
import { EmergencyLoginFallback } from '@/components/debug/EmergencyLoginFallback';
import { logger } from '@/utils/logger';

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
const UnauthorizedPage = () => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // If user has high-level access, redirect them away from unauthorized page
  useEffect(() => {
    if (!isLoading && isAuthenticated && (role === 'admin' || role === 'master_admin')) {
      logger.error('[UnauthorizedPage] High-level user detected, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [isLoading, isAuthenticated, role, navigate]);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Ingen tilgang</h1>
      <p className="text-muted-foreground mt-2">Du har ikke tilgang til denne siden.</p>
      {role && (
        <p className="text-sm text-muted-foreground mt-4">Din rolle: {role}</p>
      )}
    </div>
  );
};

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
  
  const allRoutes = [
    ...mainRouteObjects,
    ...adminRouteObjects, 
    ...leadRouteObjects,
    ...docsRouteObjects,
    ...listingsRouteObjects,
    ...maintenanceRouteObjects,
  ];
  
  // EMERGENCY: Enhanced debugging for route filtering
  if (import.meta.env.DEV || isLovablePreviewHost()) {
    logger.error('[EMERGENCY SHELL] Debug info:', { 
      role, 
      flags: Object.entries(flags).filter(([_, v]) => v).map(([k]) => k),
      routerMode: import.meta.env.VITE_ROUTER_MODE || 'browser',
      pathname: window.location.pathname,
      hash: window.location.hash,
      baseUrl: import.meta.env.BASE_URL || '/',
      allRoutesCount: allRoutes.length,
      mainRoutesCount: mainRouteObjects.length
    });
  }
  
  // EMERGENCY: Simplify route logic - always include critical routes
  const alwaysAvailableRoutes = mainRouteObjects.filter(r => r.alwaysAvailable);
  const loginRoute = mainRouteObjects.find(r => r.path === '/login');
  const homeRoute = mainRouteObjects.find(r => r.path === '/');
  
  // Apply feature flags and role filtering with error handling
  let filteredRoutes: AppRoute[] = [];
  try {
    filteredRoutes = applyFeatureFlags(allRoutes, flags, role);
    // EMERGENCY: Always ensure login route is available
    if (loginRoute && !filteredRoutes.find(r => r.path === '/login')) {
      filteredRoutes.push(loginRoute);
    }
    if (homeRoute && !filteredRoutes.find(r => r.path === '/')) {
      filteredRoutes.push(homeRoute);
    }
  } catch (error) {
    logger.error('Route filtering failed:', {}, error);
    // EMERGENCY: Fallback to critical routes only
    filteredRoutes = [
      ...(loginRoute ? [loginRoute] : []),
      ...(homeRoute ? [homeRoute] : []),
      ...alwaysAvailableRoutes
    ];
  }
  
  // Use filtered routes, fallback to always available if empty
  const selectedRoutes: AppRoute[] = filteredRoutes.length > 0 ? filteredRoutes : alwaysAvailableRoutes;
  
  // Convert to React Router compatible format
  const routeElements: RouteObject[] = [
    ...convertToRouteObjects(selectedRoutes),
    // Error routes - always available
    { path: '/unauthorized', element: <UnauthorizedPage /> },
    { path: '/emergency', element: <EmergencyLoginFallback /> },
    { path: '*', element: <NotFound /> }
  ];
  
  // EMERGENCY: Enhanced debugging for filtered routes
  if (import.meta.env.DEV || isLovablePreviewHost()) {
    logger.error('[EMERGENCY SHELL] Filtered routes debug:', {
      filteredRoutesCount: filteredRoutes.length,
      alwaysAvailableRoutesCount: alwaysAvailableRoutes.length,
      used: filteredRoutes.length > 0 ? 'filtered' : 'alwaysAvailable',
      availableRoutes: selectedRoutes.map(r => ({ path: r.path, roles: r.roles, flag: r.flag })).slice(0, 10),
      routeElementsCount: routeElements.length
    });
  }

  const routes = useRoutes(routeElements);

  // EMERGENCY: If we're on login path and have routing issues, show emergency login
  if (window.location.pathname === '/login' && (!routes || selectedRoutes.length === 0)) {
    logger.error('[EMERGENCY SHELL] Login route failed, using emergency fallback');
    return <EmergencyLoginFallback />;
  }
  
  // EMERGENCY: Use emergency fallback only if no routes at all
  if (!routes || selectedRoutes.length === 0) {
    logger.error('[EMERGENCY SHELL] No routes available!', {
      routes: !!routes,
      filteredRoutesLength: filteredRoutes.length,
      alwaysAvailableRoutesLength: alwaysAvailableRoutes.length,
      allRoutesLength: allRoutes.length
    });
    return <EmergencyLoginFallback />;
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