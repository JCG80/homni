/**
 * IMPORT STANDARDIZATION UTILITY
 * Single source of truth for all standard imports across the application
 */

// Re-export all hooks from their canonical locations
export { useToast, toast } from '@/hooks/use-toast';

// Re-export all auth-related functionality from unified auth module
export {
  useAuth,
  useAuthSession,
  useAuthState,
  useRoleCheck,
  useRoleProtection,
  useRoleNavigation
} from '@/modules/auth/hooks';

// Re-export all types from consolidated types
export type {
  UserRole,
  NavigationItem,
  EnhancedNavigationItem,
  UserProfile,
  AuthUser,
  QuickLoginUser,
  Lead,
  LeadFormValues,
  LeadStatus
} from '@/types/consolidated-types';

// Navigation system - single import point
export { useUnifiedNavigation } from '@/hooks/navigation/useUnifiedNavigation';

// Role management - unified system
export { RoleGrantsService } from '@/services/roleGrantsService';
export { useRoleGrants } from '@/hooks/useRoleGrants';

/**
 * DEPRECATED IMPORTS - DO NOT USE
 * These imports are being phased out. Use the standardized imports above.
 */

// ❌ DEPRECATED: Use useToast from '@/hooks/use-toast' instead
// import { useToast } from '@/components/ui/use-toast'; 

// ❌ DEPRECATED: Use unified auth hooks instead  
// import { useRoleContext } from '@/contexts/RoleContext';
// import { useRolePreview } from '@/contexts/RolePreviewContext';

// ❌ DEPRECATED: Use NavigationItem from consolidated types instead
// import { NavigationItem } from '@/types/navigation-consolidated';