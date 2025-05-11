
/**
 * Re-export determination functions from the roles module
 */
import { determineUserRole } from './roles/determination';
import { isUserRole, canAccessModule } from './roles';
import { UserRole } from '../types/types';

export { determineUserRole, isUserRole, canAccessModule };
