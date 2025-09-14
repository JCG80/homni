import { useMemo } from 'react';
import { useAuth } from '@/modules/auth/context';
import { useRoleContext } from '@/contexts/RoleContext';
import { useRolePreview } from '@/contexts/RolePreviewContext';
import type { UserRole } from '@/modules/auth/normalizeRole';

type Mode = 'personal' | 'professional';

interface IntegratedAuthContext {
  // Original auth context
  isAuthenticated: boolean;
  user: any;
  profile: any;
  role: UserRole | null;
  loading: boolean;
  isLoading: boolean;
  error: Error | null;
  
  // Role checks
  isAdmin: boolean;
  isMasterAdmin: boolean;
  isCompany: boolean;
  isUser: boolean;
  isContentEditor: boolean;
  isGuest: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  
  // Access control
  canAccessModule: (moduleId: string) => boolean;
  canAccess: (moduleId: string) => boolean;
  canPerform: (action: string, resource: string) => boolean;
  
  // Auth methods
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Mode switching (new)
  activeMode: Mode;
  setActiveMode: (mode: Mode) => Promise<void>;
  isSwitching: boolean;
  modeError: string | null;
  
  // Enhanced role checks with mode awareness
  isInPersonalMode: boolean;
  isInProfessionalMode: boolean;
  canSwitchToProfessional: boolean;
}

/**
 * Integrated hook that combines the original auth context with mode switching
 */
export const useIntegratedAuth = (): IntegratedAuthContext => {
  const authContext = useAuth();
  const roleContext = useRoleContext();
  const { previewRole, isPreviewMode } = useRolePreview();
  
  // Map modes to roles with preview override
  const effectiveRole = useMemo((): UserRole | null => {
    if (!authContext.isAuthenticated) return null;
    
    // Preview role overrides everything for UI display
    if (isPreviewMode && previewRole) {
      return previewRole;
    }
    
    // Mode-based role mapping
    if (roleContext.activeMode === 'professional') {
      return 'company';
    }
    
    // Default to user for personal mode, or preserve admin roles
    if (authContext.isAdmin) return 'admin';
    if (authContext.isMasterAdmin) return 'master_admin';
    if (authContext.isContentEditor) return 'content_editor';
    
    return 'user';
  }, [authContext, roleContext.activeMode, isPreviewMode, previewRole]);
  
  // Enhanced role checks with mode awareness
  const isInPersonalMode = roleContext.activeMode === 'personal';
  const isInProfessionalMode = roleContext.activeMode === 'professional';
  const canSwitchToProfessional = roleContext.roles.includes('company') || 
                                   authContext.isAdmin || 
                                   authContext.isMasterAdmin;
  
  // Override role-based properties when in professional mode
  const enhancedAuthContext = useMemo(() => ({
    ...authContext,
    role: effectiveRole,
    isCompany: isInProfessionalMode || authContext.isCompany,
    isUser: isInPersonalMode && !authContext.isAdmin && !authContext.isMasterAdmin,
  }), [authContext, effectiveRole, isInPersonalMode, isInProfessionalMode]);
  
  return {
    ...enhancedAuthContext,
    // Mode switching
    activeMode: roleContext.activeMode,
    setActiveMode: roleContext.setActiveMode,
    isSwitching: roleContext.isSwitching,
    modeError: roleContext.error,
    
    // Enhanced mode-aware properties
    isInPersonalMode,
    isInProfessionalMode,
    canSwitchToProfessional,
  };
};