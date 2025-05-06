
import { useRoutes } from 'react-router-dom';
import { Authenticated } from './components/Authenticated';
import { Unauthenticated } from './components/Unauthenticated';
import { ProtectedRoute } from './modules/auth/components/ProtectedRoute';
import { AdminLeadsPage } from './modules/leads/pages/AdminLeadsPage';
import { LeadTestPage } from './modules/leads/pages/LeadTestPage';
import { CompanyLeadsPage } from './modules/leads/pages/CompanyLeadsPage';
import { UserLeadsPage } from './modules/leads/pages/UserLeadsPage';
import { UnauthorizedPage } from './modules/auth/pages/UnauthorizedPage';
import { RouteConfig, UserRole } from './modules/auth/types/types';

const AppRoutes = () => {
  // Define routes with their auth requirements
  const routesConfig: RouteConfig[] = [
    {
      path: '/',
      element: <AdminLeadsPage />,
      requiresAuth: true
    },
    {
      path: '/login',
      element: <Unauthenticated />
    },
    {
      path: '/leads/company',
      element: <CompanyLeadsPage />,
      requiresAuth: true
    },
    {
      path: '/leads/my',
      element: <UserLeadsPage />,
      requiresAuth: true
    },
    {
      path: '/unauthorized',
      element: <UnauthorizedPage />
    },
    // Standardized route for Lead Test Page
    {
      path: '/test/leads',
      element: <LeadTestPage />,
      requiresAuth: true,
      roles: ['admin', 'master-admin']
    }
  ];

  // Transform the config into actual route objects
  const routes = routesConfig.map(route => {
    // If route requires authentication
    if (route.requiresAuth) {
      // If route has specific roles
      if (route.roles && route.roles.length > 0) {
        return {
          path: route.path,
          element: (
            <ProtectedRoute allowedRoles={route.roles as UserRole[]}>
              {route.element}
            </ProtectedRoute>
          )
        };
      }
      // If route just requires authentication without specific roles
      return {
        path: route.path,
        element: <Authenticated>{route.element}</Authenticated>
      };
    }
    // Regular route without auth requirements
    return {
      path: route.path,
      element: route.element
    };
  });

  return useRoutes(routes);
};

export default AppRoutes;
