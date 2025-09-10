/**
 * Unified navigation configuration for role-based routing
 * Consolidates navigation.ts and navigation.tsx into single source of truth
 */

import { UserRole } from '@/modules/auth/normalizeRole';
import { LucideIcon } from 'lucide-react';
import {
  Home,
  Users,
  Building,
  FileText,
  Settings,
  BarChart,
  Activity,
  LayoutDashboard,
  User,
  Kanban,
  ShieldCheck,
  Database,
  FilePlus,
  Zap,
  Smartphone,
  Shield,
  Wifi,
  Anchor,
  HelpCircle,
  Search,
  Target,
  DollarSign,
} from 'lucide-react';

export interface NavigationItem {
  href: string;
  title: string;
  label?: string; // For backward compatibility
  icon?: LucideIcon;
  badge?: string | number;
  children?: NavigationItem[];
  permission?: UserRole[];
  description?: string;
  isFeatureFlag?: boolean;
  roles?: UserRole[];
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
    { href: '/sammenlign', title: 'Sammenlign', icon: Search },
    { href: '/om-oss', title: 'Om oss' },
  ],

  user: [
    { href: '/dashboard', title: 'Dashboard', icon: LayoutDashboard },
    { href: '/leads', title: 'Forespørsler', icon: Activity },
    { href: '/property', title: 'Mine eiendommer', icon: Building },
    { href: '/sales', title: 'DIY Salg', icon: DollarSign },
    { href: '/documents', title: 'Mine dokumenter', icon: FileText },
    { href: '/profile', title: 'Min profil', icon: User },
    { href: '/account', title: 'Innstillinger', icon: Settings },
  ],

  company: [
    { href: '/dashboard', title: 'Dashboard', icon: LayoutDashboard },
    { href: '/leads', title: 'Forespørsler', icon: Activity },
    { href: '/leads/kanban', title: 'Kanban-tavle', icon: Kanban },
    { href: '/dashboard/analytics', title: 'Analyser', icon: BarChart },
    { href: '/property/portfolio', title: 'Eiendoms Portefølje', icon: Building },
    { href: '/sales/pipeline', title: 'Salg Pipeline', icon: DollarSign },
    { href: '/pakker', title: 'Abonnementer' },
    { href: '/account', title: 'Innstillinger', icon: Settings },
  ],

  content_editor: [
    { href: '/dashboard', title: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/content', title: 'Innhold', icon: FilePlus },
    { href: '/dashboard/media', title: 'Mediebibliotek', icon: FileText },
    { href: '/cms', title: 'Innholdsstyring' },
    { href: '/cms/artikler', title: 'Artikler', icon: FileText },
    { href: '/cms/preview', title: 'Forhåndsvisning', icon: Search },
    { href: '/account', title: 'Innstillinger', icon: Settings },
  ],
};

/**
 * CONTROL PLAN (Kontrollplan)  
 * Focus: System administration, monitoring, configuration
 */
export const navControl: Record<'admin' | 'master_admin', NavigationItem[]> = {
  admin: [
    { href: '/admin/dashboard', title: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/leads', title: 'Leads', icon: FileText },
    { href: '/admin/companies', title: 'Bedrifter', icon: Building },
    { href: '/admin/members', title: 'Medlemmer', icon: Users },
    { href: '/admin/system-modules', title: 'Systemmoduler', icon: Database },
    { href: '/admin/api', title: 'API & Integrasjoner', icon: Zap },
  ],

  master_admin: [
    { href: '/admin/dashboard', title: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/leads', title: 'Leads', icon: FileText },
    { href: '/admin/companies', title: 'Bedrifter', icon: Building },
    { href: '/admin/members', title: 'Medlemmer', icon: Users },
    { href: '/admin/system-modules', title: 'Systemmoduler', icon: Database },
    { href: '/admin/api', title: 'API & Integrasjoner', icon: Zap },
    { href: '/admin/roles', title: 'Rolleadministrasjon', icon: Shield },
    { href: '/admin/internal-access', title: 'Modultilgang', icon: Shield },
  ],
};

// Service navigation items
export const serviceNavItems: NavigationItem[] = [
  { href: '/strom', title: 'Strøm', icon: Zap },
  { href: '/mobil', title: 'Mobil', icon: Smartphone },
  { href: '/forsikring', title: 'Forsikring', icon: Shield },
  { href: '/bredband', title: 'Bredbånd', icon: Wifi },
  { href: '/marina', title: 'Marina', icon: Anchor },
];

// Documentation navigation items
export const docNavItems: NavigationItem[] = [
  { href: '/docs/project-plan', title: 'Prosjektplan', icon: FileText },
  { href: '/docs/faq', title: 'FAQ', icon: HelpCircle },
];

/**
 * Helper function to get navigation items based on user role
 */
export function getNavigation(role: UserRole = 'guest'): NavigationItem[] {
  // Get user navigation
  if (role in navUser) {
    return navUser[role as keyof typeof navUser];
  }
  
  // Get control navigation
  if (role in navControl) {
    return navControl[role as keyof typeof navControl];
  }
  
  // Default to guest
  return navUser.guest;
}

/**
 * LEGACY: Backward compatibility with existing navConfig usage
 * DEPRECATED: Use getNavigation() directly for new implementations
 */
export const navConfig: Record<UserRole, NavigationConfig> = {
  guest: {
    main: navUser.guest.map(item => ({ 
      href: item.href, 
      title: item.title, 
      label: item.title, 
      icon: item.icon 
    })),
  },
  user: {
    main: navUser.user.map(item => ({ 
      href: item.href, 
      title: item.title, 
      label: item.title, 
      icon: item.icon 
    })),
  },
  company: {
    main: navUser.company.map(item => ({ 
      href: item.href, 
      title: item.title, 
      label: item.title, 
      icon: item.icon 
    })),
  },
  content_editor: {
    main: navUser.content_editor.map(item => ({ 
      href: item.href, 
      title: item.title, 
      label: item.title, 
      icon: item.icon 
    })),
  },
  admin: {
    main: navControl.admin.map(item => ({ 
      href: item.href, 
      title: item.title, 
      label: item.title, 
      icon: item.icon 
    })),
  },
  master_admin: {
    main: navControl.master_admin.map(item => ({ 
      href: item.href, 
      title: item.title, 
      label: item.title, 
      icon: item.icon 
    })),
  }
};

/**
 * Get navigation config for a specific role
 */
export const getNavConfig = (role: UserRole): NavigationConfig => {
  return navConfig[role] || navConfig.guest;
};

/**
 * Helper function to get service navigation items
 */
export function getServiceNavigation(): NavigationItem[] {
  return serviceNavItems;
}

/**
 * Helper function to get documentation navigation items
 */
export function getDocNavigation(): NavigationItem[] {
  return docNavItems;
}

/**
 * Check if user has permission to access a specific route
 */
export const hasRoutePermission = (route: string, userRole: UserRole): boolean => {
  const items = getNavigation(userRole);
  return items.some(item => 
    item.href === route || 
    (item.children && item.children.some(child => child.href === route))
  );
};

/**
 * Get breadcrumb navigation for a route
 */
export const getBreadcrumbs = (route: string, userRole: UserRole): NavigationItem[] => {
  const items = getNavigation(userRole);
  const breadcrumbs: NavigationItem[] = [];
  
  // Find the route in navigation structure
  const findInNav = (navItems: NavigationItem[], path: NavigationItem[] = []) => {
    for (const item of navItems) {
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
  
  findInNav(items);
  return breadcrumbs;
};

/**
 * Business workflow navigation paths
 */
export const businessWorkflows = {
  'bytt-flow': [
    { step: 1, href: '/leads', title: 'Finn leads', description: 'Søk og filtrer relevante kundeemner' },
    { step: 2, href: '/property', title: 'Registrer eiendom', description: 'Dokumenter eiendomsinformasjon' },
    { step: 3, href: '/sales', title: 'Opprett salg', description: 'Start DIY salgsoppsett' },
  ],
  'boligmappa-flow': [
    { step: 1, href: '/property', title: 'Mine eiendommer', description: 'Oversikt over portefølje' },
    { step: 2, href: '/property/documents', title: 'Dokumenter', description: 'Upload og organiser dokumenter' },
    { step: 3, href: '/property/expenses', title: 'Utgifter', description: 'Spor og kategoriser kostnader' },
  ],
  'propr-flow': [
    { step: 1, href: '/sales/setup', title: 'Salgsoppsett', description: 'Konfigurer salgsparametere' },
    { step: 2, href: '/sales/marketing', title: 'Markedsføring', description: 'Opprett salgsmateriell' },
    { step: 3, href: '/sales/manage', title: 'Håndter salg', description: 'Spor fremgang og kommunikasjon' },
  ],
};

/**
 * Get next suggested navigation based on current route and role
 */
export const getNextSuggestions = (currentRoute: string, role: UserRole): NavigationItem[] => {
  const suggestions: NavigationItem[] = [];

  // Business flow suggestions
  if (currentRoute === '/leads' && ['user', 'company'].includes(role)) {
    suggestions.push(
      { href: '/property', title: 'Registrer eiendom', icon: Building },
      { href: '/sales', title: 'Start salg', icon: DollarSign }
    );
  }

  if (currentRoute === '/property' && ['user', 'company'].includes(role)) {
    suggestions.push(
      { href: '/sales', title: 'Opprett salg', icon: DollarSign },
      { href: '/leads', title: 'Finn flere leads', icon: Target }
    );
  }

  if (currentRoute === '/sales' && ['user', 'company'].includes(role)) {
    suggestions.push(
      { href: '/property', title: 'Oppdater eiendom', icon: Building },
      { href: '/leads', title: 'Finn nye leads', icon: Target }
    );
  }

  return suggestions;
};