/**
 * PHASE 1: Unified Navigation Hook
 * Integrates navigation with modules, feature flags, and role permissions
 * Part of Ultimate Master 2.0 implementation
 */

import { useMemo } from 'react';
import { useCurrentRole } from './useCurrentRole';
import { useFeatureFlags } from './useFeatureFlags';
import { getUnifiedNavigation, filterNavigation, type UnifiedNavConfig } from '@/config/unifiedNavigation';
import { getModulesForRole } from '@/modules/system/ModuleRegistry';

interface UseUnifiedNavigationReturn {
  navigation: UnifiedNavConfig;
  isLoading: boolean;
  availableModules: string[];
  enabledFlags: Record<string, boolean>;
}

/**
 * Hook to get unified navigation configuration
 * Automatically filters based on role, modules, and feature flags
 */
export function useUnifiedNavigation(): UseUnifiedNavigationReturn {
  const role = useCurrentRole();
  const flags = useFeatureFlags();
  
  // Get available modules for the current role
  const availableModules = useMemo(() => {
    if (!role) return [];
    return getModulesForRole(role).map(module => module.id);
  }, [role]);

  // Generate navigation configuration
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
    const baseNavigation = getUnifiedNavigation(role);
    
    // Filter based on available modules and feature flags
    return filterNavigation(baseNavigation, availableModules, flags);
  }, [role, availableModules, flags]);

  return {
    navigation,
    isLoading: !role, // Loading if role not yet determined
    availableModules,
    enabledFlags: flags
  };
}

/**
 * Hook to get navigation items for a specific section
 */
export function useNavigationSection(section: keyof UnifiedNavConfig) {
  const { navigation, isLoading } = useUnifiedNavigation();
  
  return {
    items: navigation[section] || [],
    isLoading
  };
}

/**
 * Hook to get breadcrumbs for current path
 */
export function useNavigationBreadcrumbs(currentPath: string) {
  const { navigation } = useUnifiedNavigation();
  
  const breadcrumbs = useMemo(() => {
    if (!currentPath || !navigation.primary.length) return [];
    
    // Simple breadcrumb generation based on path segments
    const segments = currentPath.split('/').filter(Boolean);
    const crumbs = [];
    
    // Try to match path segments to navigation items
    let currentItems = navigation.primary;
    let currentHref = '';
    
    for (const segment of segments) {
      currentHref += `/${segment}`;
      const matchingItem = currentItems.find(item => 
        item.href === currentHref || 
        item.href.includes(segment)
      );
      
      if (matchingItem) {
        crumbs.push({
          title: matchingItem.title,
          href: matchingItem.href,
          icon: matchingItem.icon
        });
        
        // Move to children if available
        if (matchingItem.children) {
          currentItems = matchingItem.children;
        }
      }
    }
    
    return crumbs;
  }, [currentPath, navigation.primary]);
  
  return breadcrumbs;
}

/**
 * Hook to check if a navigation item should be highlighted
 */
export function useActiveNavItem(itemPath: string, currentPath: string): boolean {
  return useMemo(() => {
    if (itemPath === '/' && currentPath === '/') return true;
    if (itemPath === '/') return false;
    
    return currentPath.startsWith(itemPath);
  }, [itemPath, currentPath]);
}

/**
 * Hook to get mobile-optimized navigation
 */
export function useMobileNavigation() {
  const { navigation, isLoading } = useUnifiedNavigation();
  
  return {
    items: navigation.mobile,
    quickActions: navigation.quickActions.slice(0, 3), // Limit quick actions on mobile
    isLoading
  };
}