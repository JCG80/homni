/**
 * UNIFIED NAVIGATION HOOK
 * Consolidates all navigation-related functionality into a single hook
 */

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { NavigationItem, NavigationConfig } from '@/types/consolidated-types';
import { Home, Settings, Users, BarChart3, Building2, FileText, Shield } from 'lucide-react';

/**
 * Core navigation configuration based on user role and context
 */
export function useUnifiedNavigation() {
  const location = useLocation();
  const { user, profile, hasRole } = useAuth();
  
  /**
   * Generate navigation items based on user's role and permissions
   */
  const navigationConfig = useMemo((): NavigationConfig => {
    const baseItems: NavigationItem[] = [
      {
        id: 'home',
        href: '/',
        title: 'Hjem',
        icon: Home,
        description: 'Tilbake til forsiden'
      },
    ];

    const userItems: NavigationItem[] = [];
    const adminItems: NavigationItem[] = [];
    const companyItems: NavigationItem[] = [];

    // Add items based on role
    if (hasRole(['user', 'company', 'admin', 'master_admin'])) {
      userItems.push(
        {
          id: 'dashboard',
          href: '/dashboard',
          title: 'Dashboard',
          icon: BarChart3,
          description: 'Oversikt over din aktivitet'
        },
        {
          id: 'settings',
          href: '/settings',
          title: 'Innstillinger',
          icon: Settings,
          description: 'Kontrollpanel og preferanser'
        }
      );
    }

    // Company-specific items
    if (hasRole(['company'])) {
      companyItems.push(
        {
          id: 'leads',
          href: '/dashboard/company/leads',
          title: 'Leads',
          icon: FileText,
          description: 'Administrer dine leads'
        },
        {
          id: 'budget',
          href: '/dashboard/company/budget',
          title: 'Budsjett',
          icon: Building2,
          description: 'Budsjettadministrasjon'
        }
      );
    }

    // Admin-specific items
    if (hasRole(['admin', 'master_admin'])) {
      adminItems.push(
        {
          id: 'admin',
          href: '/admin',
          title: 'Admin',
          icon: Shield,
          description: 'Administrasjonspanel',
          children: [
            {
              id: 'admin-users',
              href: '/admin/members',
              title: 'Brukere',
              icon: Users,
              description: 'Brukeradministrasjon'
            },
            {
              id: 'admin-companies',
              href: '/admin/companies',
              title: 'Bedrifter',
              icon: Building2,
              description: 'Bedriftsadministrasjon'
            },
            {
              id: 'admin-leads',
              href: '/admin/leads',
              title: 'Lead-administrasjon',
              icon: FileText,
              description: 'Administrer alle leads'
            }
          ]
        }
      );
    }

    return {
      primary: [...baseItems, ...userItems, ...companyItems, ...adminItems],
      secondary: [],
      quickActions: [
        {
          id: 'smart-start',
          href: '/smart-start',
          title: 'Smart Start',
          description: 'Kom i gang raskt'
        }
      ],
      mobile: [...baseItems, ...userItems, ...companyItems, ...adminItems]
    };
  }, [user, profile, hasRole]);

  /**
   * Get current active navigation item
   */
  const activeItem = useMemo(() => {
    const findActiveItem = (items: NavigationItem[]): NavigationItem | null => {
      for (const item of items) {
        if (location.pathname === item.href) {
          return item;
        }
        if (item.children) {
          const childMatch = findActiveItem(item.children);
          if (childMatch) return childMatch;
        }
        if (location.pathname.startsWith(item.href) && item.href !== '/') {
          return item;
        }
      }
      return null;
    };

    return findActiveItem(navigationConfig.primary);
  }, [location.pathname, navigationConfig.primary]);

  /**
   * Generate breadcrumbs for current page
   */
  const breadcrumbs = useMemo(() => {
    const crumbs: NavigationItem[] = [];
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    let currentPath = '';
    for (const segment of pathSegments) {
      currentPath += `/${segment}`;
      
      // Find matching navigation item
      const findItem = (items: NavigationItem[]): NavigationItem | null => {
        for (const item of items) {
          if (item.href === currentPath) return item;
          if (item.children) {
            const childMatch = findItem(item.children);
            if (childMatch) return childMatch;
          }
        }
        return null;
      };

      const matchedItem = findItem(navigationConfig.primary);
      if (matchedItem) {
        crumbs.push(matchedItem);
      } else {
        // Generate a breadcrumb for unmatched segments
        crumbs.push({
          id: segment,
          href: currentPath,
          title: segment.charAt(0).toUpperCase() + segment.slice(1),
          description: `Navigate to ${segment}`
        });
      }
    }

    return crumbs;
  }, [location.pathname, navigationConfig.primary]);

  /**
   * Check if user has access to a specific route
   */
  const hasAccess = (href: string): boolean => {
    const findItem = (items: NavigationItem[]): NavigationItem | null => {
      for (const item of items) {
        if (item.href === href) return item;
        if (item.children) {
          const childMatch = findItem(item.children);
          if (childMatch) return childMatch;
        }
      }
      return null;
    };

    const item = findItem(navigationConfig.primary);
    if (!item) return false;

    // Check role requirements
    if (item.requiredRole) {
      const requiredRoles = Array.isArray(item.requiredRole) ? item.requiredRole : [item.requiredRole];
      return requiredRoles.some(role => hasRole([role]));
    }

    return true;
  };

  return {
    navigationConfig,
    activeItem,
    breadcrumbs,
    hasAccess,
    isLoading: false // Could be extended with actual loading states
  };
}