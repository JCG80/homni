
import { useAuth } from './hooks/useAuth';
import { useRoleGuard } from './hooks/useRoleGuard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { canAccessPath } from './utils/roles/guards';
import { roleNames, roleDescriptions } from './utils/roles/display';

export {
  // Auth hooks
  useAuth,
  useRoleGuard,
  
  // Auth components
  ProtectedRoute,
  
  // Auth utils
  canAccessPath,
  roleNames,
  roleDescriptions,
};
