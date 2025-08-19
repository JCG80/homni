/**
 * Centralized navigation configuration for role-based routing
 * UPDATED: Separates user interfaces from control plan interfaces
 */

import { UserRole } from '@/modules/auth/utils/roles/types';

export interface NavigationItem {
  href: string;
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
    { href: '/', label: 'Forside' },
    { href: '/sammenlign', label: 'Sammenlign' },
    { href: '/om-oss', label: 'Om oss' },
    { href: '/login', label: 'Logg inn' },
  ],

  user: [
    { href: '/', label: 'Dashboard' },
    { href: '/dokumenter', label: 'Mine dokumenter' },
    { href: '/eiendommer', label: 'Eiendommer' },
    { href: '/sammenlign', label: 'Sammenlign' },
    { href: '/profil', label: 'Profil' },
  ],

  company: [
    { href: '/', label: 'Bedrift Dashboard' },
    { href: '/leads', label: 'Mine Leads' },
    { href: '/leads/kanban', label: 'Pipeline' },
    { href: '/pakker', label: 'Abonnementer' },
    { href: '/rapporter', label: 'Rapporter' },
    { href: '/innstillinger', label: 'Innstillinger' },
  ],

  content_editor: [
    { href: '/', label: 'Innhold Dashboard' },
    { href: '/cms', label: 'Innholdsstyring' },
    { href: '/cms/artikler', label: 'Artikler' },
    { href: '/cms/sider', label: 'Sider' },
    { href: '/cms/media', label: 'Media' },
    { href: '/cms/preview', label: 'Forhåndsvisning' },
  ],
};

/**
 * CONTROL PLAN (Kontrollplan)  
 * Focus: System administration, monitoring, configuration
 */
export const navControl: Record<'admin' | 'master_admin', NavigationItem[]> = {
  admin: [
    { href: '/admin', label: 'Admin Dashboard' },
    { href: '/admin/leads', label: 'Alle Leads' },
    { href: '/admin/leads/distribution', label: 'Lead-distribusjon' },
    { href: '/admin/pakker', label: 'Lead-pakker' },
    { href: '/admin/kjøpere', label: 'Kjøper-kontoer' },
    { href: '/admin/brukere', label: 'Brukere' },
    { href: '/admin/bedrifter', label: 'Bedrifter' },
    { href: '/admin/rapporter', label: 'System-rapporter' },
    { href: '/admin/innstillinger', label: 'System-innstillinger' },
  ],

  master_admin: [
    { href: '/master', label: 'Master Dashboard' },
    { href: '/master/system', label: 'System-oversikt' },
    { href: '/master/moduler', label: 'Moduler' },
    { href: '/master/feature-flags', label: 'Feature Flags' },
    { href: '/master/roller', label: 'Roller & Tilganger' },
    { href: '/master/database', label: 'Database' },
    { href: '/master/sikkerhet', label: 'Sikkerhet' },
    { href: '/master/overvåking', label: 'Overvåing' },
    { href: '/master/backup', label: 'Backup & Recovery' },
  ],
};

/**
 * LEGACY: Backward compatibility with existing navConfig usage
 * DEPRECATED: Use navUser/navControl directly for new implementations
 */
export const navConfig: Record<UserRole, NavigationConfig> = {
  guest: {
    main: navUser.guest.map(item => ({ label: item.label, href: item.href })),
    secondary: []
  },
  user: {
    main: navUser.user.map(item => ({ label: item.label, href: item.href })),
    secondary: []
  },
  company: {
    main: navUser.company.map(item => ({ label: item.label, href: item.href })),
    secondary: []
  },
  content_editor: {
    main: navUser.content_editor.map(item => ({ label: item.label, href: item.href })),
    secondary: []
  },
  admin: {
    main: navControl.admin.map(item => ({ label: item.label, href: item.href })),
    secondary: []
  },
  master_admin: {
    main: navControl.master_admin.map(item => ({ label: item.label, href: item.href })),
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