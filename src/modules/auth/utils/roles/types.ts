
/**
 * DEPRECATED: Use @/modules/auth/normalizeRole instead
 * Re-export canonical types from normalizeRole.ts
 */

// Import from our canonical source of truth
import { UserRole, ALL_ROLES, PUBLIC_ROLES, AUTHENTICATED_ROLES, isUserRole } from '../../normalizeRole';

// Re-export for backward compatibility
export type { UserRole };
export { ALL_ROLES, PUBLIC_ROLES, AUTHENTICATED_ROLES, isUserRole };
