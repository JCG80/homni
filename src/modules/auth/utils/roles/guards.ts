
/**
 * Type guards for role management
 */
import { UserRole, ALL_ROLES } from './types';

/**
 * Check if a value is a valid UserRole
 * @param value The value to check
 * @returns True if the value is a valid UserRole
 */
export const isUserRole = (value: any): value is UserRole => {
  return typeof value === 'string' && ALL_ROLES.includes(value as UserRole);
};

/**
 * Validate and convert a value to UserRole if possible
 * @param value Value to convert
 * @param defaultRole Default role to use if validation fails
 * @returns Valid UserRole or default
 */
export const toUserRole = (value: any, defaultRole: UserRole = 'member'): UserRole => {
  return isUserRole(value) ? value : defaultRole;
};
