/**
 * PHASE 1: Unified Navigation System
 * Single source of truth for all navigation across the platform
 * Part of Ultimate Master 2.0 implementation
 */

import type { UserRole } from '@/modules/auth/normalizeRole';
import { LucideIcon, Home, Building, Users, Settings, FileText, BarChart3, Shield, Zap, Calculator, Bell, Globe } from 'lucide-react';

export interface NavItem {
  href: string;
  title: string;
  icon: LucideIcon;
  description?: string;
  badge?: string | number;
  external?: boolean;
  children?: NavItem[];
  moduleKey?: string; // Links to system modules
  featureFlag?: string; // Feature flag requirement
}

export interface UnifiedNavConfig {
  primary: NavItem[]; // Main navigation
  secondary: NavItem[]; // Settings, profile, etc.
  quickActions: NavItem[]; // Command palette actions
  mobile: NavItem[]; // Mobile-optimized nav
}

/**
 * Core navigation items available to all roles
 */
const coreNav: NavItem[] = [
  {
    href: '/',
    title: 'Hjem',
    icon: Home,
    description: 'Hovedside og oversikt'
  }
];

/**
 * User-specific navigation (authenticated users)
 */
const userNav: NavItem[] = [
  {
    href: '/dashboard',
    title: 'Dashboard',
    icon: BarChart3,
    description: 'Personlig oversikt'
  },
  {
    href: '/properties',
    title: 'Eiendommer',
    icon: Building,
    description: 'Administrer eiendommer',
    moduleKey: 'property_management',
    featureFlag: 'ENABLE_PROPERTY_MANAGEMENT'
  },
  {
    href: '/profile',
    title: 'Profil',
    icon: Users,
    description: 'Rediger profil'
  }
];

/**
 * Company-specific navigation
 */
const companyNav: NavItem[] = [
  {
    href: '/dashboard/company',
    title: 'Bedriftsoversikt',
    icon: Building,
    description: 'Bedriftens dashboard'
  },
  {
    href: '/company/leads',
    title: 'Leads',
    icon: Users,
    description: 'Administrer kundehenvendelser',
    moduleKey: 'lead_management'
  },
  {
    href: '/leads/intelligence',
    title: 'Lead Intelligence',
    icon: BarChart3,
    description: 'Analyse og rapporter',
    moduleKey: 'analytics'
  }
];

/**
 * Admin navigation items
 */
const adminNav: NavItem[] = [
  {
    href: '/dashboard/admin',
    title: 'Admin Dashboard',
    icon: Shield,
    description: 'Administrativ oversikt'
  },
  {
    href: '/admin/users',
    title: 'Brukere',
    icon: Users,
    description: 'Brukeradministrasjon',
    moduleKey: 'user_management'
  },
  {
    href: '/admin/companies',
    title: 'Bedrifter',
    icon: Building,
    description: 'Bedriftsadministrasjon',
    moduleKey: 'company_management'
  },
  {
    href: '/admin/system',
    title: 'System',
    icon: Settings,
    description: 'Systeminnstillinger',
    moduleKey: 'system_management'
  }
];

/**
 * Content editor navigation
 */
const contentEditorNav: NavItem[] = [
  {
    href: '/dashboard/content-editor',
    title: 'Innhold',
    icon: FileText,
    description: 'Innholdsadministrasjon'
  },
  {
    href: '/content/articles',
    title: 'Artikler',
    icon: FileText,
    description: 'Rediger artikler',
    moduleKey: 'content_management'
  },
  {
    href: '/content/pages',
    title: 'Sider',
    icon: Globe,
    description: 'Administrer sider',
    moduleKey: 'content_management'
  }
];

/**
 * Master admin exclusive items
 */
const masterAdminNav: NavItem[] = [
  {
    href: '/dashboard/master-admin',
    title: 'Master Admin',
    icon: Shield,
    description: 'Fullstendig systemkontroll'
  },
  {
    href: '/admin/modules',
    title: 'Moduler',
    icon: Zap,
    description: 'Moduladministrasjon',
    moduleKey: 'module_management'
  },
  {
    href: '/admin/features',
    title: 'Feature Flags',
    icon: Settings,
    description: 'Funksjonsbrytere',
    moduleKey: 'feature_management'
  },
  {
    href: '/admin/audit',
    title: 'Revisjonslogg',
    icon: FileText,
    description: 'Systemauditering',
    moduleKey: 'audit_management'
  }
];

/**
 * Secondary navigation (settings, profile, etc.)
 */
const secondaryNav: NavItem[] = [
  {
    href: '/account',
    title: 'Kontoinnstillinger',
    icon: Settings,
    description: 'Konto og preferanser'
  },
  {
    href: '/notifications',
    title: 'Varsler',
    icon: Bell,
    description: 'Notifikasjoner og meldinger'
  }
];

/**
 * Quick actions for command palette
 */
const quickActions: NavItem[] = [
  {
    href: '/properties/new',
    title: 'Legg til eiendom',
    icon: Building,
    description: 'Opprett ny eiendom'
  },
  {
    href: '/leads/new',
    title: 'Ny lead',
    icon: Users,
    description: 'Registrer ny lead'
  },
  {
    href: '/help',
    title: 'Hjelp',
    icon: FileText,
    description: 'Dokumentasjon og support'
  }
];

/**
 * Get unified navigation configuration for a role
 */
export function getUnifiedNavigation(role: UserRole): UnifiedNavConfig {
  let primary: NavItem[] = [...coreNav];
  let secondary: NavItem[] = [...secondaryNav];
  let mobile: NavItem[] = [...coreNav];

  switch (role) {
    case 'master_admin':
      primary = [...primary, ...userNav, ...companyNav, ...adminNav, ...contentEditorNav, ...masterAdminNav];
      mobile = [...mobile, ...userNav, ...adminNav.slice(0, 3)]; // Limit mobile items
      break;

    case 'admin':
      primary = [...primary, ...userNav, ...companyNav, ...adminNav, ...contentEditorNav];
      mobile = [...mobile, ...userNav, ...adminNav.slice(0, 3)];
      break;

    case 'content_editor':
      primary = [...primary, ...userNav, ...contentEditorNav];
      mobile = [...mobile, ...userNav, ...contentEditorNav.slice(0, 2)];
      break;

    case 'company':
      primary = [...primary, ...userNav, ...companyNav];
      mobile = [...mobile, ...userNav, ...companyNav.slice(0, 2)];
      break;

    case 'user':
      primary = [...primary, ...userNav];
      mobile = [...mobile, ...userNav.slice(0, 3)];
      break;

    case 'guest':
    default:
      primary = [...primary, {
        href: '/login',
        title: 'Logg inn',
        icon: Users,
        description: 'Logg inn eller opprett konto'
      }];
      mobile = [...primary];
      secondary = []; // No secondary nav for guests
      break;
  }

  return {
    primary: primary.filter(item => item.href), // Remove any invalid items
    secondary,
    quickActions,
    mobile: mobile.slice(0, 5) // Limit mobile navigation
  };
}

/**
 * Helper to check if a nav item should be visible based on feature flags
 */
export function isNavItemVisible(item: NavItem, enabledFlags: Record<string, boolean>): boolean {
  if (!item.featureFlag) return true;
  return enabledFlags[item.featureFlag] || false;
}

/**
 * Filter navigation items based on enabled modules and feature flags
 */
export function filterNavigation(
  nav: UnifiedNavConfig,
  enabledModules: string[],
  enabledFlags: Record<string, boolean>
): UnifiedNavConfig {
  const filterItems = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      // Check feature flag
      if (!isNavItemVisible(item, enabledFlags)) return false;
      
      // Check module requirement
      if (item.moduleKey && !enabledModules.includes(item.moduleKey)) return false;
      
      // Recursively filter children
      if (item.children) {
        item.children = filterItems(item.children);
      }
      
      return true;
    });
  };

  return {
    primary: filterItems(nav.primary),
    secondary: filterItems(nav.secondary),
    quickActions: filterItems(nav.quickActions),
    mobile: filterItems(nav.mobile)
  };
}

/**
 * Get breadcrumb trail for a given path
 */
export function getBreadcrumbs(path: string, nav: UnifiedNavConfig): NavItem[] {
  const breadcrumbs: NavItem[] = [];
  
  const findInNav = (items: NavItem[], currentPath: NavItem[]): boolean => {
    for (const item of items) {
      if (item.href === path) {
        breadcrumbs.push(...currentPath, item);
        return true;
      }
      
      if (item.children && findInNav(item.children, [...currentPath, item])) {
        return true;
      }
    }
    return false;
  };
  
  findInNav([...nav.primary, ...nav.secondary], []);
  return breadcrumbs;
}

/**
 * Legacy compatibility - maps to old navConfig format
 */
export function getLegacyNavConfig(role: UserRole) {
  const unified = getUnifiedNavigation(role);
  return {
    main: unified.primary.map(item => ({
      href: item.href,
      title: item.title,
      label: item.title,
      icon: item.icon
    }))
  };
}