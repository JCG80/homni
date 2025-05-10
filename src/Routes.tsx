import { useRoutes } from 'react-router-dom';
import { Authenticated } from './components/Authenticated';
import { Unauthenticated } from './components/Unauthenticated';
import { ProtectedRoute } from './modules/auth/components/ProtectedRoute';
import { AdminLeadsPage } from './modules/leads/pages/AdminLeadsPage';
import { LeadTestPage } from './modules/leads/pages/LeadTestPage';
import { CompanyLeadsPage } from './modules/leads/pages/CompanyLeadsPage';
import { UserLeadsPage } from './modules/leads/pages/UserLeadsPage';
import { LeadReportsPage } from './modules/leads/pages/LeadReportsPage';
import { UnauthorizedPage } from './modules/auth/pages/UnauthorizedPage';
import { LoginPage } from './modules/auth/pages/LoginPage';
import { RegisterPage } from './modules/auth/pages/RegisterPage';
import { ContentDashboard } from './modules/content/pages/ContentDashboard';
import { EditContentPage } from './modules/content/pages/EditContentPage';
import { UserRole } from './modules/auth/types/types';

const AppRoutes = () => {
  // Define routes with their auth requirements
  const routesConfig = [
    {
      path: '/',
      element: <AdminLeadsPage />,
      requiresAuth: true,
      allowAnyRole: true // Allow any authenticated user to access the home page
    },
    {
      path: '/login',
      element: <LoginPage />
    },
    {
      path: '/register',
      element: <RegisterPage />
    },
    {
      path: '/leads/company',
      element: <CompanyLeadsPage />,
      requiresAuth: true,
      roles: ['company', 'admin', 'master-admin'] // Allow company and admin roles
    },
    {
      path: '/leads/my',
      element: <UserLeadsPage />,
      requiresAuth: true,
      allowAnyRole: true // Allow any authenticated user
    },
    {
      path: '/leads/reports',
      element: <LeadReportsPage />,
      requiresAuth: true,
      roles: ['admin', 'master-admin'] // Only allow admin roles
    },
    {
      path: '/unauthorized',
      element: <UnauthorizedPage />
    },
    // Allow all authenticated users to access test pages
    {
      path: '/leads/test',
      element: <LeadTestPage />,
      requiresAuth: true,
      allowAnyRole: true
    },
    // Content module routes
    {
      path: '/admin/content',
      element: <ContentDashboard />,
      requiresAuth: true,
      roles: ['admin', 'master-admin', 'editor'] as UserRole[] // Only allow admin and editor roles
    },
    {
      path: '/admin/content/new',
      element: <EditContentPage />,
      requiresAuth: true,
      roles: ['admin', 'master-admin', 'editor'] as UserRole[] // Only allow admin and editor roles
    },
    {
      path: '/admin/content/edit/:id',
      element: <EditContentPage />,
      requiresAuth: true,
      roles: ['admin', 'master-admin', 'editor'] as UserRole[] // Only allow admin and editor roles
    }
  ];

  // Transform the config into actual route objects
  const routes = routesConfig.map(route => {
    // If route requires authentication
    if (route.requiresAuth) {
      // Special case for routes that allow any authenticated user
      if (route.allowAnyRole) {
        return {
          path: route.path,
          element: (
            <ProtectedRoute allowAnyAuthenticated={true}>
              {route.element}
            </ProtectedRoute>
          )
        };
      }
      // If route has specific roles
      if (route.roles && route.roles.length > 0) {
        return {
          path: route.path,
          element: (
            <ProtectedRoute allowedRoles={route.roles}>
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
