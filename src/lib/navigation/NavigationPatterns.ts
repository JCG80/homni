/**
 * NavigationPatterns - Standardized navigation patterns across the platform
 * Part of Phase 3B Step 3: Unified Navigation Experience
 */

import { NavigationItem } from '@/types/consolidated-types';
import { UserRole } from '@/modules/auth/normalizeRole';

// Standard navigation pattern configurations
export const NAVIGATION_PATTERNS = {
  // Mobile navigation specifics
  MOBILE: {
    maxItemsInTab: 5,
    showLabelsThreshold: 4,
    swipeEnabled: true,
    gestureThreshold: 50
  },
  
  // Desktop sidebar patterns
  SIDEBAR: {
    collapsedWidth: '64px',
    expandedWidth: '240px',
    animationDuration: 200,
    breakpoint: 'md'
  },
  
  // Breadcrumb patterns
  BREADCRUMB: {
    maxItems: 4,
    showHomeButton: true,
    showBackButton: true,
    separator: 'chevron'
  },
  
  // Quick actions patterns
  QUICK_ACTIONS: {
    maxVisible: 6,
    mobileMaxVisible: 3,
    showShortcuts: true
  }
} as const;

// Standard navigation item transformations
export class NavigationPatterns {
  /**
   * Filter navigation items based on role and feature flags
   */
  static filterByRole(items: NavigationItem[], role: UserRole, flags: Record<string, boolean>): NavigationItem[] {
    return items.filter(item => {
      // Check role access
      if (item.requiredRole) {
        const requiredRoles = Array.isArray(item.requiredRole) ? item.requiredRole : [item.requiredRole];
        if (!requiredRoles.includes(role)) return false;
      }
      
      // Check feature flag
      if (item.featureFlag && !flags[item.featureFlag]) return false;
      
      // Recursively filter children
      if (item.children) {
        item.children = this.filterByRole(item.children, role, flags);
      }
      
      return !item.disabled;
    });
  }

  /**
   * Transform navigation items for mobile display
   */
  static transformForMobile(items: NavigationItem[]): NavigationItem[] {
    return items
      .slice(0, NAVIGATION_PATTERNS.MOBILE.maxItemsInTab)
      .map(item => ({
        ...item,
        // Simplify mobile titles
        title: item.title.length > 12 ? item.title.substring(0, 10) + '...' : item.title,
        // Remove children for mobile simplicity
        children: undefined
      }));
  }

  /**
   * Generate contextual navigation suggestions
   */
  static generateContextualSuggestions(
    currentPath: string, 
    allItems: NavigationItem[],
    userHistory: string[] = []
  ): NavigationItem[] {
    const suggestions: NavigationItem[] = [];
    
    // Find current item
    const currentItem = this.findItemByPath(allItems, currentPath);
    
    // Add sibling pages
    if (currentItem) {
      const siblings = this.findSiblings(allItems, currentPath);
      suggestions.push(...siblings.slice(0, 2));
    }
    
    // Add frequently visited pages
    const frequent = userHistory
      .reduce((acc, path) => {
        acc[path] = (acc[path] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
      
    const frequentItems = Object.entries(frequent)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([path]) => this.findItemByPath(allItems, path))
      .filter(Boolean) as NavigationItem[];
    
    suggestions.push(...frequentItems);
    
    return suggestions.slice(0, 5);
  }

  /**
   * Create quick actions from navigation items
   */
  static createQuickActions(items: NavigationItem[], priorities: string[] = []): NavigationItem[] {
    // Prioritize items based on provided priority list
    const prioritized = items.filter(item => priorities.includes(item.href));
    const others = items.filter(item => !priorities.includes(item.href));
    
    return [...prioritized, ...others].slice(0, NAVIGATION_PATTERNS.QUICK_ACTIONS.maxVisible);
  }

  /**
   * Generate performance-optimized navigation cache key
   */
  static generateCacheKey(role: UserRole, flags: Record<string, boolean>, path: string): string {
    const flagsHash = Object.entries(flags)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key)
      .sort()
      .join(',');
    
    return `nav_${role}_${btoa(flagsHash)}_${btoa(path)}`.substring(0, 50);
  }

  // Helper methods
  private static findItemByPath(items: NavigationItem[], path: string): NavigationItem | null {
    for (const item of items) {
      if (item.href === path) return item;
      if (item.children) {
        const found = this.findItemByPath(item.children, path);
        if (found) return found;
      }
    }
    return null;
  }

  private static findSiblings(items: NavigationItem[], path: string, parent?: NavigationItem): NavigationItem[] {
    for (const item of items) {
      if (item.href === path && parent?.children) {
        return parent.children.filter(child => child.href !== path);
      }
      if (item.children) {
        const siblings = this.findSiblings(item.children, path, item);
        if (siblings.length > 0) return siblings;
      }
    }
    return [];
  }
}

// Navigation performance monitoring
export class NavigationPerformance {
  private static metrics: Record<string, number[]> = {};

  static trackNavigation(route: string, duration: number) {
    if (!this.metrics[route]) {
      this.metrics[route] = [];
    }
    this.metrics[route].push(duration);
    
    // Keep only last 10 measurements
    if (this.metrics[route].length > 10) {
      this.metrics[route] = this.metrics[route].slice(-10);
    }
  }

  static getAverageTime(route: string): number {
    const times = this.metrics[route] || [];
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  static getSlowRoutes(threshold: number = 200): string[] {
    return Object.entries(this.metrics)
      .filter(([_, times]) => this.getAverageTime(_) > threshold)
      .map(([route]) => route);
  }
}
