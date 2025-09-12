/**
 * LEGACY COMPATIBILITY: Unified Navigation Hook
 * Now delegates to the enhanced module-aware navigation system
 * Part of Ultimate Master 2.0 implementation
 */

import { useMemo } from 'react';
import { useModuleNavigation } from './useModuleNavigation';
import type { UnifiedNavConfig } from '@/types/consolidated-types';

// Re-export the enhanced hook for backward compatibility
export const useUnifiedNavigation = useModuleNavigation;

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