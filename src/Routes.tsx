
import { useRoutes } from 'react-router-dom';
import { Authenticated } from './components/Authenticated';
import { Unauthenticated } from './components/Unauthenticated';
import { ProtectedRoute, getAuthRequirements } from './modules/auth/components/ProtectedRoute';
import { AdminLeadsPage } from './modules/leads/pages/AdminLeadsPage';
import { LeadTestPage } from './modules/leads/pages/LeadTestPage';
import { CompanyLeadsPage } from './modules/leads/pages/CompanyLeadsPage';
import { UserLeadsPage } from './modules/leads/pages/UserLeadsPage';
import { UnauthorizedPage } from './modules/auth/pages/UnauthorizedPage';

const AppRoutes = () => {
  // Get auth requirements for components that have them
  const leadTestAuthReq = getAuthRequirements(LeadTestPage);

  return useRoutes([
    {
      path: '/',
      element: (
        <Authenticated>
          <AdminLeadsPage />
        </Authenticated>
      ),
    },
    {
      path: '/login',
      element: <Unauthenticated />
    },
    {
      path: '/leads/test',
      element: (
        <ProtectedRoute allowedRoles={leadTestAuthReq.allowedRoles}>
          <LeadTestPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/leads/company',
      element: (
        <Authenticated>
          <CompanyLeadsPage />
        </Authenticated>
      ),
    },
    {
      path: '/leads/my',
      element: (
        <Authenticated>
          <UserLeadsPage />
        </Authenticated>
      ),
    },
    {
      path: '/unauthorized',
      element: <UnauthorizedPage />
    }
  ]);
};

export default AppRoutes;
