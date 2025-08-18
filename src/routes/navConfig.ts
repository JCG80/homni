/**
 * Centralized navigation configuration for role-based routing
 * UPDATED: Separates user interfaces from control plan interfaces
 */

import { UserRole } from '@/modules/auth/utils/roles/types';

export interface NavigationItem {
  path: string;
  label: string;
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

export type Role = 'guest' | 'user' | 'company' | 'content_editor' | 'admin' | 'master_admin';

/**
 * USER INTERFACES (Brukerflater)
 * Focus: Productivity, self-service, business value
 */
export const navUser: Record<'guest' | 'user' | 'company' | 'content_editor', NavigationItem[]> = {
  guest: [
    { path: '/', label: 'Forside' },
    { path: '/sammenlign', label: 'Sammenlign' },
    { path: '/om-oss', label: 'Om oss' },
    { path: '/login', label: 'Logg inn' },
  ],

  user: [
    { path: '/', label: 'Dashboard' },
    { path: '/dokumenter', label: 'Mine dokumenter' },
    { path: '/eiendommer', label: 'Eiendommer' },
    { path: '/sammenlign', label: 'Sammenlign' },
    { path: '/profil', label: 'Profil' },
  ],

  company: [
    { path: '/', label: 'Bedrift Dashboard' },
    { path: '/leads', label: 'Mine Leads' },
    { path: '/leads/kanban', label: 'Pipeline' },
    { path: '/pakker', label: 'Abonnementer' },
    { path: '/rapporter', label: 'Rapporter' },
    { path: '/innstillinger', label: 'Innstillinger' },
  ],

  content_editor: [
    { path: '/', label: 'Innhold Dashboard' },
    { path: '/cms', label: 'Innholdsstyring' },
    { path: '/cms/artikler', label: 'Artikler' },
    { path: '/cms/sider', label: 'Sider' },
    { path: '/cms/media', label: 'Media' },
    { path: '/cms/preview', label: 'Forhåndsvisning' },
  ],
};

/**
 * CONTROL PLAN (Kontrollplan)  
 * Focus: System administration, monitoring, configuration
 */
export const navControl: Record<'admin' | 'master_admin', NavigationItem[]> = {
  admin: [
    { path: '/admin', label: 'Admin Dashboard' },
    { path: '/admin/leads', label: 'Alle Leads' },
    { path: '/admin/leads/distribution', label: 'Lead-distribusjon' },
    { path: '/admin/pakker', label: 'Lead-pakker' },
    { path: '/admin/kjøpere', label: 'Kjøper-kontoer' },
    { path: '/admin/brukere', label: 'Brukere' },
    { path: '/admin/bedrifter', label: 'Bedrifter' },
    { path: '/admin/rapporter', label: 'System-rapporter' },
    { path: '/admin/innstillinger', label: 'System-innstillinger' },
  ],

  master_admin: [
    { path: '/master', label: 'Master Dashboard' },
    { path: '/master/system', label: 'System-oversikt' },
    { path: '/master/moduler', label: 'Moduler' },
    { path: '/master/feature-flags', label: 'Feature Flags' },
    { path: '/master/roller', label: 'Roller & Tilganger' },
    { path: '/master/database', label: 'Database' },
    { path: '/master/sikkerhet', label: 'Sikkerhet' },
    { path: '/master/overvåking', label: 'Overvåking' },
    { path: '/master/backup', label: 'Backup & Recovery' },
  ],
};

/**
 * LEGACY: Backward compatibility with existing navConfig usage
 * TODO: Migrate existing code to use navUser/navControl directly
 */
export const navConfig: Record<UserRole, NavigationConfig> = {
  guest: {
    main: navUser.guest.map(item => ({ label: item.label, href: item.path })),
    secondary: []
  },
  user: {
    main: navUser.user.map(item => ({ label: item.label, href: item.path })),
    secondary: []
  },
  company: {
    main: navUser.company.map(item => ({ label: item.label, href: item.path })),
    secondary: []
  },
  content_editor: {
    main: navUser.content_editor.map(item => ({ label: item.label, href: item.path })),
    secondary: []
  },
  admin: {
    main: navControl.admin.map(item => ({ label: item.label, href: item.path })),
    secondary: []
  },
  master_admin: {
    main: navControl.master_admin.map(item => ({ label: item.label, href: item.path })),
    secondary: []
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