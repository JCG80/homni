
import { UserRole } from '../../types/unified-types';
import { ALL_ROLES } from './types';

/**
 * Type guard to check if a value is a valid UserRole
 */
export function isUserRole(value: any): value is UserRole {
  return ALL_ROLES.includes(value);
}

/**
 * Type guard to check if a string is a valid UserRole
 */
export function isValidRole(role: string): boolean {
  return isUserRole(role);
}
