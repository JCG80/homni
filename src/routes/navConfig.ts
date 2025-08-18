/**
 * Centralized navigation configuration for role-based routing
 * Single source of truth for navigation structure
 */

import { UserRole } from '@/modules/auth/utils/roles/types';

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavigationItem[];
  permission?: UserRole[];
}

export interface NavigationConfig {
  main: NavigationItem[];
  secondary?: NavigationItem[];
  mobile?: NavigationItem[];
}

/**
 * Navigation configuration per role
 * Each role gets a tailored navigation structure
 */
export const navConfig: Record<UserRole, NavigationConfig> = {
  guest: {
    main: [
      { label: 'Hjem', href: '/' },
      { label: 'Sammenlign', href: '/sammenlign' },
      { label: 'Om oss', href: '/om-oss' },
    ],
    secondary: [
      { label: 'Logg inn', href: '/auth/login' },
      { label: 'Registrer', href: '/auth/register' },
    ]
  },

  user: {
    main: [
      { label: 'Dashbord', href: '/dashboard' },
      { label: 'Mine dokumenter', href: '/dokumenter' },
      { label: 'Sammenlign', href: '/sammenlign' },
      { label: 'Profil', href: '/profil' },
    ],
    secondary: [
      { label: 'Innstillinger', href: '/innstillinger' },
      { label: 'Hjelp', href: '/hjelp' },
    ]
  },

  company: {
    main: [
      { label: 'Dashbord', href: '/dashboard' },
      { label: 'Leads', href: '/leads' },
      { 
        label: 'Leads Management', 
        href: '/leads',
        children: [
          { label: 'Oversikt', href: '/leads/oversikt' },
          { label: 'Kanban', href: '/leads/kanban' },
          { label: 'Pipeline', href: '/leads/pipeline' },
        ]
      },
      { label: 'Pakker', href: '/pakker' },
      { label: 'Rapporter', href: '/rapporter' },
    ],
    secondary: [
      { label: 'Bedriftsprofil', href: '/bedrift/profil' },
      { label: 'Innstillinger', href: '/innstillinger' },
    ]
  },

  content_editor: {
    main: [
      { label: 'Dashbord', href: '/dashboard' },
      { label: 'Innhold', href: '/admin/innhold' },
      { label: 'Artikler', href: '/admin/artikler' },
      { label: 'Sider', href: '/admin/sider' },
    ],
    secondary: [
      { label: 'Forhåndsvisning', href: '/admin/preview' },
      { label: 'Publisering', href: '/admin/publish' },
    ]
  },

  admin: {
    main: [
      { label: 'Dashbord', href: '/dashboard' },
      { label: 'Brukere', href: '/admin/brukere' },
      { label: 'Bedrifter', href: '/admin/bedrifter' },
      { label: 'Leads', href: '/admin/leads' },
      { label: 'Pakker', href: '/admin/pakker' },
      { label: 'Rapporter', href: '/admin/rapporter' },
    ],
    secondary: [
      { label: 'Systeminnstillinger', href: '/admin/system' },
      { label: 'Logger', href: '/admin/logger' },
    ]
  },

  master_admin: {
    main: [
      { label: 'Dashbord', href: '/dashboard' },
      { label: 'System', href: '/admin/system' },
      { label: 'Database', href: '/admin/database' },
      { label: 'Moduler', href: '/admin/moduler' },
      { label: 'Feature Flags', href: '/admin/feature-flags' },
      { label: 'Brukere', href: '/admin/brukere' },
      { label: 'Bedrifter', href: '/admin/bedrifter' },
      { label: 'Leads', href: '/admin/leads' },
    ],
    secondary: [
      { label: 'Overvåking', href: '/admin/monitoring' },
      { label: 'Sikkerhet', href: '/admin/security' },
      { label: 'Backup', href: '/admin/backup' },
    ]
  }
};

/**
 * Get navigation config for a specific role
 */
export const getNavConfig = (role: UserRole): NavigationConfig => {
  return navConfig[role] || navConfig.guest;
};

/**
 * Check if user has permission to access a specific route
 */
export const hasRoutePermission = (route: string, userRole: UserRole): boolean => {
  const config = getNavConfig(userRole);
  
  // Check main navigation
  const hasMainPermission = config.main.some(item => 
    item.href === route || 
    (item.children && item.children.some(child => child.href === route))
  );
  
  // Check secondary navigation
  const hasSecondaryPermission = config.secondary?.some(item => 
    item.href === route
  ) || false;
  
  return hasMainPermission || hasSecondaryPermission;
};

/**
 * Get breadcrumb navigation for a route
 */
export const getBreadcrumbs = (route: string, userRole: UserRole): NavigationItem[] => {
  const config = getNavConfig(userRole);
  const breadcrumbs: NavigationItem[] = [];
  
  // Find the route in navigation structure
  const findInNav = (items: NavigationItem[], path: NavigationItem[] = []) => {
    for (const item of items) {
      const currentPath = [...path, item];
      
      if (item.href === route) {
        breadcrumbs.push(...currentPath);
        return true;
      }
      
      if (item.children && findInNav(item.children, currentPath)) {
        return true;
      }
    }
    return false;
  };
  
  findInNav([...config.main, ...(config.secondary || [])]);
  return breadcrumbs;
};