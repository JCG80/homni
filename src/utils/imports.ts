/**
 * Import optimization utilities
 * Provides standardized absolute import paths
 */

// Common component imports
export const COMPONENT_IMPORTS = {
  // UI Components
  BUTTON: '@/components/ui/button',
  CARD: '@/components/ui/card',
  INPUT: '@/components/ui/input',
  LABEL: '@/components/ui/label',
  TOAST: '@/hooks/use-toast',
  
  // Layout Components
  PAGE_LAYOUT: '@/components/layout/PageLayout',
  MAIN_NAVIGATION: '@/components/layout/MainNavigation',
  
  // Auth Components
  AUTH_HOOKS: '@/modules/auth/hooks/useAuth',
  PROTECTED_ROUTE: '@/modules/auth/components/ProtectedRoute',
  
  // Common utilities
  UTILS: '@/lib/utils',
  LOGGER: '@/utils/logger',
  API_RETRY: '@/utils/apiRetry',
  ERROR_HANDLING: '@/utils/errorHandling',
  PERFORMANCE: '@/utils/performance',
} as const;

// Module-specific imports
export const MODULE_IMPORTS = {
  // Admin module
  ADMIN_TYPES: '@/modules/admin/types/types',
  ADMIN_HOOKS: '@/modules/admin/hooks',
  ADMIN_COMPONENTS: '@/modules/admin/components',
  
  // Auth module
  AUTH_TYPES: '@/modules/auth/types/types',
  AUTH_UTILS: '@/modules/auth/utils',
  
  // Leads module
  LEADS_TYPES: '@/modules/leads/types',
  LEADS_API: '@/modules/leads/api',
  LEADS_HOOKS: '@/modules/leads/hooks',
  
  // Types
  COMMON_TYPES: '@/types',
  AUTH_TYPES_ROOT: '@/types/auth',
  LEADS_TYPES_ROOT: '@/types/leads',
} as const;

/**
 * Convert relative import to absolute import
 */
export function toAbsoluteImport(relativePath: string, currentFile: string): string {
  // Simple conversion logic - in a real implementation you'd want more sophisticated path resolution
  if (relativePath.startsWith('../')) {
    // Count the number of ../ to determine how far up to go
    const upLevels = (relativePath.match(/\.\.\//g) || []).length;
    const currentDirParts = currentFile.split('/').slice(0, -1); // Remove filename
    const targetParts = currentDirParts.slice(0, -upLevels);
    const remainingPath = relativePath.replace(/\.\.\//g, '');
    
    return `@/${targetParts.slice(1).join('/')}/${remainingPath}`.replace(/\/+/g, '/');
  }
  
  if (relativePath.startsWith('./')) {
    const currentDir = currentFile.split('/').slice(0, -1).join('/');
    const remainingPath = relativePath.replace('./', '');
    return `${currentDir}/${remainingPath}`.replace('src/', '@/');
  }
  
  return relativePath; // Already absolute or external
}