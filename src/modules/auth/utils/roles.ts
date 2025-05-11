
/**
 * @deprecated This file is kept for backwards compatibility. Use modules/auth/utils/roles/ exports instead.
 */
import { 
  UserRole, 
  ALL_ROLES, 
  PUBLIC_ROLES, 
  AUTHENTICATED_ROLES 
} from './utils/roles/types';
import { isUserRole, canAccessModule } from './utils/roles/guards';
import { determineUserRole } from './utils/roles/determination';

export type { UserRole };
export { 
  ALL_ROLES, 
  PUBLIC_ROLES, 
  AUTHENTICATED_ROLES,
  isUserRole,
  canAccessModule,
  determineUserRole
};
