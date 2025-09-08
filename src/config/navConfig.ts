/**
 * Centralized Navigation Configuration
 * Master Prompt compliant navigation for all roles
 */

import { UserRole } from '@/modules/auth/normalizeRole';
import { 
  LayoutDashboard, 
  Users, 
  Target,
  FileText,
  Settings,
  BarChart3,
  Shield,
  Home,
  MapPin,
  Briefcase,
  PlusCircle,
  Search
} from 'lucide-react';

export interface NavigationItem {
  key: string;
  title: string;
  path: string;
  icon: any;
  description?: string;
  badge?: string | number;
  roles: UserRole[];
  children?: NavigationItem[];
}

export interface NavigationConfig {
  main: NavigationItem[];
  footer?: NavigationItem[];
  quickActions?: NavigationItem[];
}

/**
 * Main navigation configuration by role
 */
export const navigationConfig: Record<UserRole, NavigationConfig> = {
  guest: {
    main: [
      {
        key: 'home',
        title: 'Hjem',
        path: '/',
        icon: Home,
        description: 'Startside',
        roles: ['guest']
      },
      {
        key: 'services',
        title: 'Tjenester',
        path: '/services',
        icon: Search,
        description: 'Utforsk tjenester',
        roles: ['guest']
      }
    ],
    footer: [
      {
        key: 'login',
        title: 'Logg inn',
        path: '/login',
        icon: Shield,
        roles: ['guest']
      }
    ]
  },

  user: {
    main: [
      {
        key: 'dashboard',
        title: 'Dashboard',
        path: '/dashboard/user',
        icon: LayoutDashboard,
        description: 'Min oversikt',
        roles: ['user']
      },
      {
        key: 'leads',
        title: 'Mine forespørsler',
        path: '/leads/my',
        icon: Target,
        description: 'Se mine forespørsler',
        roles: ['user']
      },
      {
        key: 'properties',
        title: 'Mine eiendommer',
        path: '/properties',
        icon: MapPin,
        description: 'Boligmappa - dokumenter og vedlikehold',
        roles: ['user']
      }
    ],
    quickActions: [
      {
        key: 'create-lead',
        title: 'Ny forespørsel',
        path: '/leads/create',
        icon: PlusCircle,
        roles: ['user']
      },
      {
        key: 'add-property',
        title: 'Legg til eiendom',
        path: '/properties/create',
        icon: Home,
        roles: ['user']
      }
    ]
  },

  company: {
    main: [
      {
        key: 'dashboard',
        title: 'Dashboard',
        path: '/dashboard/company',
        icon: LayoutDashboard,
        description: 'Bedriftsoversikt',
        roles: ['company']
      },
      {
        key: 'leads',
        title: 'Lead-håndtering',
        path: '/leads',
        icon: Target,
        description: 'Administrer kundeemner',
        roles: ['company'],
        children: [
          {
            key: 'my-leads',
            title: 'Mine leads',
            path: '/leads/my',
            icon: Target,
            roles: ['company']
          },
          {
            key: 'lead-marketplace',
            title: 'Lead-markedsplass',
            path: '/marketplace',
            icon: Briefcase,
            roles: ['company']
          }
        ]
      },
      {
        key: 'analytics',
        title: 'Analyse',
        path: '/analytics',
        icon: BarChart3,
        description: 'Ytelse og rapporter',
        roles: ['company']
      }
    ]
  },

  content_editor: {
    main: [
      {
        key: 'dashboard',
        title: 'Dashboard',
        path: '/dashboard/content-editor',
        icon: LayoutDashboard,
        description: 'Redaktør-oversikt',
        roles: ['content_editor']
      },
      {
        key: 'content',
        title: 'Innholdshåndtering',
        path: '/content',
        icon: FileText,
        description: 'Rediger innhold',
        roles: ['content_editor']
      },
      {
        key: 'analytics',
        title: 'Innholdsanalyse',
        path: '/analytics/content',
        icon: BarChart3,
        description: 'Ytelse for innhold',
        roles: ['content_editor']
      }
    ]
  },

  admin: {
    main: [
      {
        key: 'dashboard',
        title: 'Admin Dashboard',
        path: '/dashboard/admin',
        icon: LayoutDashboard,
        description: 'Administrator-oversikt',
        roles: ['admin', 'master_admin']
      },
      {
        key: 'leads',
        title: 'Lead-administrasjon',
        path: '/admin/leads',
        icon: Target,
        description: 'Administrer alle leads',
        roles: ['admin', 'master_admin']
      },
      {
        key: 'users',
        title: 'Brukerhåndtering',
        path: '/admin/users',
        icon: Users,
        description: 'Administrer brukere',
        roles: ['admin', 'master_admin']
      },
      {
        key: 'analytics',
        title: 'Systemanalyse',
        path: '/admin/analytics',
        icon: BarChart3,
        description: 'Plattform-analyse',
        roles: ['admin', 'master_admin']
      },
      {
        key: 'settings',
        title: 'Systeminnstillinger',
        path: '/admin/settings',
        icon: Settings,
        description: 'Konfigurer systemet',
        roles: ['admin', 'master_admin']
      }
    ]
  },

  master_admin: {
    main: [
      {
        key: 'dashboard',
        title: 'Master Dashboard',
        path: '/dashboard/admin',
        icon: LayoutDashboard,
        description: 'Master administrator-oversikt',
        roles: ['master_admin']
      },
      {
        key: 'system',
        title: 'Systemkontroll',
        path: '/admin/system',
        icon: Shield,
        description: 'Avansert systemkontroll',
        roles: ['master_admin']
      },
      {
        key: 'leads',
        title: 'Lead-administrasjon',
        path: '/admin/leads',
        icon: Target,
        description: 'Administrer alle leads',
        roles: ['master_admin']
      },
      {
        key: 'users',
        title: 'Brukerhåndtering',
        path: '/admin/users',
        icon: Users,
        description: 'Administrer brukere',
        roles: ['master_admin']
      },
      {
        key: 'analytics',
        title: 'Systemanalyse',
        path: '/admin/analytics',
        icon: BarChart3,
        description: 'Plattform-analyse',
        roles: ['master_admin']
      },
      {
        key: 'settings',
        title: 'Systeminnstillinger',
        path: '/admin/settings',
        icon: Settings,
        description: 'Konfigurer systemet',
        roles: ['master_admin']
      }
    ]
  }
};

/**
 * Get navigation items for a specific role
 */
export function getNavigationForRole(role: UserRole): NavigationConfig {
  return navigationConfig[role] || navigationConfig.guest;
}

/**
 * Check if a navigation item is accessible for the given role
 */
export function hasAccessToNavItem(item: NavigationItem, role: UserRole): boolean {
  return item.roles.includes(role);
}

/**
 * Flatten navigation tree for search/filtering
 */
export function flattenNavigation(nav: NavigationConfig): NavigationItem[] {
  const flattened: NavigationItem[] = [];
  
  const addItems = (items: NavigationItem[]) => {
    items.forEach(item => {
      flattened.push(item);
      if (item.children) {
        addItems(item.children);
      }
    });
  };
  
  addItems(nav.main);
  if (nav.footer) addItems(nav.footer);
  if (nav.quickActions) addItems(nav.quickActions);
  
  return flattened;
}