import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/modules/auth/normalizeRole';
import { useAuth } from '@/modules/auth/hooks';

export interface ProfileContext {
  id: string;
  type: 'user' | 'company';
  name: string;
  role?: UserRole;
  companyId?: string;
}

export interface ProfileContextState {
  activeContext: ProfileContext | null;
  availableContexts: ProfileContext[];
  isAdmin: boolean;
  canSwitchContext: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ProfileContextActions {
  switchToUserContext: (userId: string, reason?: string) => Promise<void>;
  switchToCompanyContext: (companyId: string) => Promise<void>;
  returnToAdminContext: () => Promise<void>;
  loadAvailableContexts: () => Promise<void>;
}

export type ProfileContextType = ProfileContextState & ProfileContextActions;

export const ProfileContextContext = createContext<ProfileContextType | null>(null);

export const useProfileContext = () => {
  const context = useContext(ProfileContextContext);
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfileContextProvider');
  }
  return context;
};

export const useProfileContextLogic = (): ProfileContextType => {
  const { user, role, isAdmin, isMasterAdmin } = useAuth();
  
  const [state, setState] = useState<ProfileContextState>({
    activeContext: null,
    availableContexts: [],
    isAdmin: isAdmin || isMasterAdmin,
    canSwitchContext: isAdmin || isMasterAdmin,
    isLoading: false,
    error: null,
  });

  // Set company context in session
  const setSessionContext = async (companyId: string | null) => {
    try {
      if (companyId) {
        await supabase.rpc('set_company_context', { company_uuid: companyId });
      } else {
        await supabase.rpc('clear_company_context');
      }
    } catch (error) {
      console.error('Failed to set session context:', error);
    }
  };

  // Log admin action for audit trail
  const logAdminAction = async (action: string, targetKind: string, targetId: string, metadata: any = {}) => {
    try {
      await supabase.rpc('log_admin_action', {
        target_kind_param: targetKind,
        target_id_param: targetId,
        action_param: action,
        metadata_param: metadata,
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  };

  // Load available contexts for admins
  const loadAvailableContexts = useCallback(async () => {
    if (!state.canSwitchContext || !user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const contexts: ProfileContext[] = [];

      // Load available companies (for admins with company access)
      if (isAdmin || isMasterAdmin) {
        const { data: companies } = await supabase
          .from('company_profiles')
          .select('id, name')
          .eq('status', 'active');

        if (companies) {
          contexts.push(...companies.map(company => ({
            id: company.id,
            type: 'company' as const,
            name: company.name,
            companyId: company.id,
          })));
        }
      }

      // Master admins can access any user context
      if (isMasterAdmin) {
        const { data: users } = await supabase
          .from('user_profiles')
          .select('id, full_name, email, role')
          .neq('id', user.id)
          .limit(50); // Limit for performance

        if (users) {
          contexts.push(...users.map(userProfile => ({
            id: userProfile.id,
            type: 'user' as const,
            name: userProfile.full_name || userProfile.email || 'Unknown User',
            role: userProfile.role as UserRole,
          })));
        }
      }

      setState(prev => ({
        ...prev,
        availableContexts: contexts,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to load available contexts:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load available contexts',
        isLoading: false,
      }));
    }
  }, [state.canSwitchContext, user, isAdmin, isMasterAdmin]);

  // Switch to user context (readonly for admin, full access for master_admin)
  const switchToUserContext = useCallback(async (userId: string, reason?: string) => {
    if (!state.canSwitchContext || !user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Clear any company context
      await setSessionContext(null);

      // Find the target user context
      const targetContext = state.availableContexts.find(ctx => ctx.id === userId && ctx.type === 'user');
      if (!targetContext) {
        throw new Error('User context not found');
      }

      // Log the action
      await logAdminAction('context_switch', 'user', userId, {
        reason,
        access_type: isMasterAdmin ? 'full' : 'readonly',
        switched_from: 'admin',
      });

      setState(prev => ({
        ...prev,
        activeContext: targetContext,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to switch to user context:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to switch context',
        isLoading: false,
      }));
    }
  }, [state.canSwitchContext, state.availableContexts, user, isMasterAdmin]);

  // Switch to company context
  const switchToCompanyContext = useCallback(async (companyId: string) => {
    if (!state.canSwitchContext || !user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Set company context in session
      await setSessionContext(companyId);

      // Find the target company context
      const targetContext = state.availableContexts.find(ctx => ctx.id === companyId && ctx.type === 'company');
      if (!targetContext) {
        throw new Error('Company context not found');
      }

      // Log the action
      await logAdminAction('context_switch', 'company', companyId, {
        switched_from: 'admin',
        access_type: 'full',
      });

      setState(prev => ({
        ...prev,
        activeContext: targetContext,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to switch to company context:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to switch context',
        isLoading: false,
      }));
    }
  }, [state.canSwitchContext, state.availableContexts, user]);

  // Return to admin context
  const returnToAdminContext = useCallback(async () => {
    if (!state.canSwitchContext || !user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Clear session context
      await setSessionContext(null);

      // Log the action
      if (state.activeContext) {
        await logAdminAction('context_return', state.activeContext.type, state.activeContext.id, {
          returned_to: 'admin',
        });
      }

      setState(prev => ({
        ...prev,
        activeContext: null,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to return to admin context:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to return to admin context',
        isLoading: false,
      }));
    }
  }, [state.canSwitchContext, state.activeContext, user]);

  // Initialize context state
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isAdmin: isAdmin || isMasterAdmin,
      canSwitchContext: isAdmin || isMasterAdmin,
    }));

    if ((isAdmin || isMasterAdmin) && user) {
      loadAvailableContexts();
    }
  }, [isAdmin, isMasterAdmin, user, loadAvailableContexts]);

  return {
    ...state,
    switchToUserContext,
    switchToCompanyContext,
    returnToAdminContext,
    loadAvailableContexts,
  };
};

