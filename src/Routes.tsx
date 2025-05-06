
import { useRoutes } from 'react-router-dom';
import { Authenticated } from './components/Authenticated';
import { Unauthenticated } from './components/Unauthenticated';
import { AdminLeadsPage } from './modules/leads/pages/AdminLeadsPage';
import { LeadTestPage } from './modules/leads/pages/LeadTestPage';

const AppRoutes = () => {
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
      element: <LeadTestPage />
    }
  ]);
};

export default AppRoutes;
