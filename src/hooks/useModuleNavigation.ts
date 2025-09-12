/**
 * PHASE 2: Module-Aware Navigation Hook
 * Integrates navigation with module system and feature flags
 * Part of Ultimate Master 2.0 implementation
 */

import { useMemo } from 'react';
import { useCurrentRole } from './useCurrentRole';
import { useFeatureFlags } from './useFeatureFlags';
import { getConsolidatedNavigation, filterNavigation, type UnifiedNavConfig } from '@/config/navigation-consolidated';
import { getModulesForRole } from '@/modules/system/ModuleRegistry';
import { logger } from '@/utils/logger';

interface ModuleNavigationReturn {
  navigation: UnifiedNavConfig;
  isLoading: boolean;
  availableModules: string[];
  enabledFlags: Record<string, boolean>;
  moduleMetadata: Array<{
    id: string;
    name: string;
    isActive: boolean;
    hasAccess: boolean;
  }>;
}

/**
 * Enhanced navigation hook that respects module availability and feature flags
 */
export function useModuleNavigation(): ModuleNavigationReturn {
  const role = useCurrentRole();
  const featureFlags = useFeatureFlags();
  
  // Get available modules for the current role
  const { availableModules, moduleMetadata } = useMemo(() => {
    if (!role) return { availableModules: [], moduleMetadata: [] };
    
    const modules = getModulesForRole(role);
    const availableModules = modules.map(module => module.id);
    
    const moduleMetadata = modules.map(module => ({
      id: module.id,
      name: module.name,
      isActive: module.isActive,
      hasAccess: module.requiredRoles.includes(role)
    }));
    
    logger.info('Module navigation computed', {
      role,
      moduleCount: modules.length,
      availableModules
    });
    
    return { availableModules, moduleMetadata };
  }, [role]);

  // Generate navigation configuration with module filtering
  const navigation = useMemo(() => {
    if (!role) {
      return {
        primary: [],
        secondary: [],
        quickActions: [],
        mobile: []
      };
    }

    // Get base navigation for role
    const baseNavigation = getConsolidatedNavigation(role);
    
    // Filter navigation based on available modules and feature flags
    const filteredNavigation = filterNavigation(
      baseNavigation, 
      availableModules, 
      featureFlags
    );
    
    logger.info('Navigation filtered by modules and flags', {
      role,
      originalPrimary: baseNavigation.primary.length,
      filteredPrimary: filteredNavigation.primary.length,
      enabledFlags: Object.keys(featureFlags).filter(key => featureFlags[key])
    });
    
    return filteredNavigation;
  }, [role, availableModules, featureFlags]);

  return {
    navigation,
    isLoading: !role, // Loading if role not yet determined
    availableModules,
    enabledFlags: featureFlags,
    moduleMetadata
  };
}

/**
 * Hook to check if a specific module is available for the current user
 */
export function useModuleAccess(moduleId: string): { hasAccess: boolean; isLoading: boolean } {
  const role = useCurrentRole();
  
  const hasAccess = useMemo(() => {
    if (!role || !moduleId) return false;
    
    const modules = getModulesForRole(role);
    return modules.some(module => module.id === moduleId && module.isActive);
  }, [role, moduleId]);
  
  return {
    hasAccess,
    isLoading: !role
  };
}

/**
 * Hook to get navigation items for a specific module
 */
export function useModuleNavigationItems(moduleId: string) {
  const { navigation, isLoading } = useModuleNavigation();
  
  const moduleItems = useMemo(() => {
    if (!moduleId || isLoading) return [];
    
    // Filter navigation items that belong to this module
    return navigation.primary.filter(item => item.moduleKey === moduleId);
  }, [navigation.primary, moduleId, isLoading]);
  
  return {
    items: moduleItems,
    isLoading
  };
}

/**
 * Hook for admin module management
 */
export function useModuleManagement() {
  const role = useCurrentRole();
  const { moduleMetadata } = useModuleNavigation();
  
  const canManageModules = role === 'master_admin';
  
  const toggleModule = async (moduleId: string, isActive: boolean) => {
    if (!canManageModules) {
      logger.warn('Unauthorized module toggle attempt', { role, moduleId });
      return false;
    }
    
    try {
      // This would integrate with the module management API
      logger.info('Module toggle requested', { moduleId, isActive });
      
      // Implementation would go here to update module_metadata table
      return true;
    } catch (error) {
      logger.error('Failed to toggle module', { moduleId, isActive }, error);
      return false;
    }
  };
  
  return {
    modules: moduleMetadata,
    canManageModules,
    toggleModule
  };
}