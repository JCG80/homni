import React, { Suspense, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { normalizeRole } from '@/modules/auth/normalizeRole';
import { mainRouteObjects } from '@/routes/mainRouteObjects';
import type { AppRoute } from '@/routes/routeTypes';
import NotFound from '@/components/system/NotFound';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RouteErrorBoundary } from '@/components/error/RouteErrorBoundary';
import { log } from '@/utils/logger';

interface EnhancedRouterProps {
  className?: string;
}

/**
 * Enhanced Router with role-based filtering and feature flag support
 * Consolidates all route objects into a unified routing system
 */
export const EnhancedRouter: React.FC<EnhancedRouterProps> = ({ className }) => {
  const { role, isAuthenticated, isLoading } = useAuth();
  
  const userRole = useMemo(() => {
    if (!isAuthenticated) return 'guest';
    return role || 'guest';
  }, [isAuthenticated, role]);

  const filteredRoutes = useMemo(() => {
    if (isLoading) return [];

    const filterRoute = (route: AppRoute): boolean => {
      // Always allow routes marked as alwaysAvailable
      if (route.alwaysAvailable) return true;

      // Check role permissions
      if (route.roles && route.roles.length > 0) {
        if (!route.roles.includes(userRole)) {
          return false;
        }
      }

      // TODO: Add feature flag filtering when feature flag system is ready
      // if (route.flag && !isFeatureFlagEnabled(route.flag)) return false;

      return true;
    };

    return mainRouteObjects.filter(filterRoute);
  }, [userRole, isLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const renderRoute = (route: AppRoute, index: number) => {
    const routeKey = `${route.path}-${index}`;
    
    try {
      return (
        <Route
          key={routeKey}
          path={route.path}
          element={
            <RouteErrorBoundary routeName={route.navKey || route.path}>
              <Suspense fallback={<LoadingSpinner />}>
                {route.element}
              </Suspense>
            </RouteErrorBoundary>
          }
        />
      );
    } catch (error) {
      log.error(`Error rendering route ${route.path}:`, error);
      return null;
    }
  };

  return (
    <div className={className}>
      <Routes>
        {filteredRoutes.map(renderRoute)}
        
        {/* Fallback routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </div>
  );
};

export default EnhancedRouter;