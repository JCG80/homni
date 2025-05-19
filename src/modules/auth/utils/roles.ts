
/**
 * @deprecated This file is kept for backwards compatibility. Use modules/auth/utils/roles/ exports instead.
 */
import { 
  UserRole, 
  ALL_ROLES, 
  PUBLIC_ROLES, 
  AUTHENTICATED_ROLES 
} from './roles/types';
import { isUserRole, canAccessPath, canAccessModule } from './roles/guards';
import { determineUserRole } from './roles/determination';

export type { UserRole };
export { 
  ALL_ROLES, 
  PUBLIC_ROLES, 
  AUTHENTICATED_ROLES,
  isUserRole,
  canAccessPath,
  canAccessModule,
  determineUserRole
};
