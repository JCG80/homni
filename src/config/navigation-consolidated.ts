/**
 * CONSOLIDATED NAVIGATION SYSTEM
 * Single source of truth for all navigation across the platform
 * Phase 1 implementation of Ultimate Master 2.0
 */

import type { UserRole } from '@/modules/auth/normalizeRole';
import type { NavigationItem, NavigationConfig, UnifiedNavConfig } from '@/types/consolidated-types';

// Re-export types for convenience
export type { NavigationItem, NavigationConfig, UnifiedNavConfig } from '@/types/consolidated-types';

import { 
  Home, 
  Building, 
  Users, 
  Settings, 
  FileText, 
  BarChart3, 
  Shield, 
  Zap, 
  LayoutDashboard,
  Target,
  MapPin,
  PlusCircle,
  Search,
  Briefcase,
  User,
  Bell,
  Globe,
  Calculator,
  DollarSign,
  TrendingUp,
  Database,
  FilePlus,
  Activity,
  Kanban,
  HelpCircle,
  Wifi,
  Smartphone,
  Anchor
} from 'lucide-react';

/**
 * ROLE-BASED NAVIGATION DEFINITIONS
 * Clear separation between user interfaces and control panels
 */

// Guest Navigation (Unauthenticated users)
const guestNavigation: NavigationItem[] = [
  {
    href: '/',
    title: 'navigation.home',
    icon: Home,
    description: 'Startside og oversikt'
  },
  {
    href: '/sammenlign',
    title: 'navigation.compare_services',
    icon: Search,
    description: 'Sammenlign strøm, forsikring og andre tjenester'
  },
  {
    href: '/om-oss',
    title: 'navigation.about_us',
    icon: FileText,
    description: 'Les mer om Homni'
  }
];

// User Navigation (Private users - eiendommer, forespørsler, vedlikehold)
const userNavigation: NavigationItem[] = [
  {
    href: '/dashboard/user',
    title: 'navigation.dashboard',
    icon: LayoutDashboard,
    description: 'Min personlige oversikt'
  },
  {
    href: '/leads/my',
    title: 'navigation.my_requests',
    icon: Target,
    description: 'Se og administrer mine forespørsler'
  },
  {
    href: '/properties',
    title: 'navigation.my_properties',
    icon: Building,
    description: 'Boligmappa - dokumenter og vedlikehold'
  },
  {
    href: '/maintenance',
    title: 'navigation.maintenance',
    icon: Settings,
    description: 'Planlegg og spor vedlikehold'
  },
  {
    href: '/account',
    title: 'navigation.account',
    icon: User,
    description: 'Administrer konto og profil'
  },
  {
    href: '/sales',
    title: 'navigation.diy_sales',
    icon: DollarSign,
    description: 'Selg eiendom selv med Propr'
  },
  {
    href: '/documents',
    title: 'navigation.my_documents',
    icon: FileText,
    description: 'Alle eiendomsdokumenter'
  }
];

// Company Navigation (Business users - leads, analytics, portfolio)
const companyNavigation: NavigationItem[] = [
  {
    href: '/dashboard/company',
    title: 'navigation.company_dashboard',
    icon: LayoutDashboard,
    description: 'Bedriftsoversikt og KPIer'
  },
  {
    href: '/leads',
    title: 'navigation.lead_management',
    icon: Target,
    description: 'Administrer kundeemner',
    children: [
      {
        href: '/leads/my',
        title: 'navigation.my_leads',
        icon: Target,
        description: 'Aktive leads tildelt bedriften'
      },
      {
        href: '/leads/kanban',
        title: 'navigation.kanban_view',
        icon: Kanban,
        description: 'Visuell lead-pipeline'
      },
      {
        href: '/marketplace',
        title: 'navigation.lead_marketplace',
        icon: Briefcase,
        description: 'Kjøp nye leads',
        featureFlag: 'ENABLE_LEAD_MARKETPLACE'
      }
    ]
  },
  {
    href: '/analytics',
    title: 'navigation.analytics_reports',
    icon: BarChart3,
    description: 'Ytelse, konvertering og ROI'
  },
  {
    href: '/properties/portfolio',
    title: 'navigation.property_portfolio',
    icon: Building,
    description: 'Oversikt over alle eiendommer'
  },
  {
    href: '/sales/pipeline',
    title: 'navigation.sales_pipeline',
    icon: DollarSign,
    description: 'Salgsaktiviteter og fremgang'
  }
];

// Content Editor Navigation (Content management only)
const contentEditorNavigation: NavigationItem[] = [
  {
    href: '/dashboard/content-editor',
    title: 'Innholdsdashboard',
    icon: LayoutDashboard,
    description: 'Redaktør-oversikt'
  },
  {
    href: '/content',
    title: 'Innholdshåndtering',
    icon: FileText,
    description: 'Rediger artikler og sider',
    children: [
      {
        href: '/content/articles',
        title: 'Artikler',
        icon: FileText,
        description: 'Rediger og publiser artikler'
      },
      {
        href: '/content/pages',
        title: 'Sider',
        icon: Globe,
        description: 'Administrer nettsider'
      },
      {
        href: '/content/media',
        title: 'Mediebibliotek',
        icon: FilePlus,
        description: 'Bilder og dokumenter'
      }
    ]
  },
  {
    href: '/analytics/content',
    title: 'Innholdsanalyse',
    icon: BarChart3,
    description: 'Ytelse for innhold og artikler'
  }
];

// Admin Navigation (System administration - NO personal data)
const adminNavigation: NavigationItem[] = [
  {
    href: '/dashboard/admin',
    title: 'Admin Dashboard',
    icon: Shield,
    description: 'Administrativ systemoversikt'
  },
  {
    href: '/admin/leads',
    title: 'Lead-administrasjon',
    icon: Target,
    description: 'Overvåk og administrer alle leads'
  },
  {
    href: '/admin/companies',
    title: 'Bedriftshåndtering',
    icon: Building,
    description: 'Administrer bedriftskontoer'
  },
  {
    href: '/admin/users',
    title: 'Brukerhåndtering',
    icon: Users,
    description: 'Administrer brukerkontoer'
  },
  {
    href: '/admin/analytics',
    title: 'Systemanalyse',
    icon: BarChart3,
    description: 'Plattform-KPIer og rapporter'
  },
  {
    href: '/admin/content',
    title: 'Innholdsadministrasjon',
    icon: FileText,
    description: 'Moderering og godkjenning'
  },
  {
    href: '/admin/settings',
    title: 'Systeminnstillinger',
    icon: Settings,
    description: 'Konfigurer systemparametere'
  }
];

// Master Admin Navigation (Full system control)
const masterAdminNavigation: NavigationItem[] = [
  {
    href: '/dashboard/master-admin',
    title: 'Master Admin Dashboard',
    icon: Shield,
    description: 'Fullstendig systemkontroll'
  },
  {
    href: '/admin/roles',
    title: 'Rolleadministrasjon',
    icon: Users,
    description: 'Administrer brukerroller og tilganger'
  },
  {
    href: '/admin/modules',
    title: 'Moduladministrasjon',
    icon: Database,
    description: 'Aktivere/deaktivere moduler'
  },
  {
    href: '/admin/feature-flags',
    title: 'Feature Flags',
    icon: Zap,
    description: 'Funksjonsbrytere og utrulling'
  },
  {
    href: '/admin/security',
    title: 'Sikkerhet og revisjonslogg',
    icon: Shield,
    description: 'Sikkerhetsovervåkning og logging'
  },
  {
    href: '/admin/system',
    title: 'Systemkontroll',
    icon: Database,
    description: 'Avansert systemkonfigurasjon'
  },
  {
    href: '/admin/api',
    title: 'API Gateway',
    icon: Activity,
    description: 'API-administrasjon og integrasjoner'
  },
  {
    href: '/admin/monitoring',
    title: 'Systemovervåkning',
    icon: TrendingUp,
    description: 'Performance og feilsporing'
  }
];

// Secondary Navigation (Common to most roles)
const secondaryNavigation: NavigationItem[] = [
  {
    href: '/account',
    title: 'Kontoinnstillinger',
    icon: User,
    description: 'Profil og preferanser'
  },
  {
    href: '/notifications',
    title: 'Varsler',
    icon: Bell,
    description: 'Notifikasjoner og meldinger'
  },
  {
    href: '/help',
    title: 'Hjelp og support',
    icon: HelpCircle,
    description: 'Dokumentasjon og kundestøtte'
  }
];

// Service Navigation (For service comparison pages)
const serviceNavigation: NavigationItem[] = [
  {
    href: '/strom',
    title: 'Strøm',
    icon: Zap,
    description: 'Sammenlign strømavtaler'
  },
  {
    href: '/forsikring',
    title: 'Forsikring',
    icon: Shield,
    description: 'Sammenlign forsikringer'
  },
  {
    href: '/bredband',
    title: 'Bredbånd',
    icon: Wifi,
    description: 'Sammenlign internettleverandører'
  },
  {
    href: '/mobil',
    title: 'Mobilabonnement',
    icon: Smartphone,
    description: 'Sammenlign mobilavtaler'
  }
];

// Quick Actions (Role-specific shortcuts)
const getQuickActionsForRole = (role: UserRole): NavigationItem[] => {
  switch (role) {
    case 'user':
      return [
        {
          href: '/leads/create',
          title: 'Ny forespørsel',
          icon: PlusCircle,
          description: 'Send inn ny forespørsel'
        },
        {
          href: '/properties/add',
          title: 'Legg til eiendom',
          icon: Building,
          description: 'Registrer ny eiendom'
        }
      ];
    
    case 'company':
      return [
        {
          href: '/leads/new',
          title: 'Registrer lead',
          icon: Target,
          description: 'Manuell lead-registrering'
        },
        {
          href: '/marketplace',
          title: 'Kjøp leads',
          icon: Briefcase,
          description: 'Gå til lead-markedsplass',
          featureFlag: 'ENABLE_LEAD_MARKETPLACE'
        }
      ];
      
    case 'content_editor':
      return [
        {
          href: '/content/articles/new',
          title: 'Ny artikkel',
          icon: FileText,
          description: 'Opprett ny artikkel'
        }
      ];
      
    default:
      return [];
  }
};

/**
 * LEGACY COMPATIBILITY - navControl export
 * Maintains backward compatibility with existing admin navigation
 */
export const navControl = {
  admin: adminNavigation,
  master_admin: [...adminNavigation, ...masterAdminNavigation.slice(1)] // Skip master dashboard, use admin dashboard
};

/**
 * LEGACY COMPATIBILITY - navUser export  
 * Maintains backward compatibility with existing user navigation
 */
export const navUser = {
  guest: guestNavigation,
  user: userNavigation,
  company: companyNavigation,
  content_editor: contentEditorNavigation
};

/**
 * Get next suggested navigation based on current route and role
 */
export const getNextSuggestions = (currentRoute: string, role: UserRole): NavigationItem[] => {
  const suggestions: NavigationItem[] = [];

  // Business flow suggestions
  if (currentRoute === '/leads' && ['user', 'company'].includes(role)) {
    suggestions.push(
      { href: '/properties', title: 'Registrer eiendom', icon: Building },
      { href: '/sales', title: 'Start salg', icon: DollarSign }
    );
  }

  if (currentRoute === '/properties' && ['user', 'company'].includes(role)) {
    suggestions.push(
      { href: '/sales', title: 'Opprett salg', icon: DollarSign },
      { href: '/leads', title: 'Finn flere leads', icon: Target }
    );
  }

  if (currentRoute === '/sales' && ['user', 'company'].includes(role)) {
    suggestions.push(
      { href: '/properties', title: 'Oppdater eiendom', icon: Building },
      { href: '/leads', title: 'Finn nye leads', icon: Target }
    );
  }

  return suggestions;
};
export function getConsolidatedNavigation(role: UserRole): UnifiedNavConfig {
  let primary: NavigationItem[] = [];
  let secondary: NavigationItem[] = [];
  let mobile: NavigationItem[] = [];
  
  switch (role) {
    case 'guest':
      primary = [...guestNavigation];
      secondary = []; // No secondary nav for guests
      mobile = [...guestNavigation];
      break;
      
    case 'user':
      primary = [...userNavigation];
      secondary = [...secondaryNavigation];
      mobile = [...userNavigation.slice(0, 4), ...secondaryNavigation.slice(0, 2)];
      break;
      
    case 'company':
      // Companies get user navigation + company-specific features
      primary = [...userNavigation, ...companyNavigation.slice(1)]; // Skip company dashboard, use user dashboard
      secondary = [...secondaryNavigation];
      mobile = [...userNavigation.slice(0, 2), ...companyNavigation.slice(0, 3)];
      break;
      
    case 'content_editor':
      // Content editors get basic user features + content management
      primary = [...userNavigation.slice(0, 1), ...contentEditorNavigation]; // Only user dashboard + content tools
      secondary = [...secondaryNavigation];
      mobile = [...contentEditorNavigation.slice(0, 3)];
      break;
      
    case 'admin':
      // Admins get user baseline + all admin tools (NO personal data mixing)
      primary = [...userNavigation.slice(0, 1), ...adminNavigation]; // Only user dashboard + admin tools
      secondary = [...secondaryNavigation];
      mobile = [...adminNavigation.slice(0, 4)];
      break;
      
    case 'master_admin':
      // Master admins get everything
      primary = [
        ...userNavigation.slice(0, 1), // Just user dashboard
        ...adminNavigation, 
        ...masterAdminNavigation.slice(1) // Skip master dashboard, use admin dashboard
      ];
      secondary = [...secondaryNavigation];
      mobile = [...adminNavigation.slice(0, 3), ...masterAdminNavigation.slice(0, 2)];
      break;
  }
  
  return {
    primary: primary.filter(Boolean),
    secondary: secondary.filter(Boolean),
    quickActions: getQuickActionsForRole(role),
    mobile: mobile.filter(Boolean)
  };
}

/**
 * LEGACY COMPATIBILITY FUNCTIONS
 * Maintain backward compatibility with existing code
 */

// For navConfig.ts compatibility
export function getNavigationForRole(role: UserRole): NavigationConfig {
  const unified = getConsolidatedNavigation(role);
  return {
    primary: unified.primary,
    secondary: unified.secondary,
    quickActions: unified.quickActions,
    mobile: unified.mobile,
    breadcrumbs: []
  };
}

// For navigation.ts compatibility  
export function getNavigation(role: UserRole = 'guest'): NavigationItem[] {
  const unified = getConsolidatedNavigation(role);
  return unified.primary;
}

// For unifiedNavigation.ts compatibility
export function getUnifiedNavigation(role: UserRole): UnifiedNavConfig {
  return getConsolidatedNavigation(role);
}

/**
 * UTILITY FUNCTIONS
 */

// Check if user has access to navigation item
export function hasAccessToNavItem(item: NavigationItem, role: UserRole): boolean {
  if (!item.requiredRole) return true;
  if (Array.isArray(item.requiredRole)) {
    return item.requiredRole.includes(role);
  }
  return item.requiredRole === role;
}

// Filter navigation based on feature flags and modules
export function filterNavigation(
  nav: UnifiedNavConfig,
  enabledModules: string[] = [],
  enabledFlags: Record<string, boolean> = {}
): UnifiedNavConfig {
  const filterItems = (items: NavigationItem[]): NavigationItem[] => {
    return items.filter(item => {
      // Check feature flag if specified
      if (item.featureFlag && !enabledFlags[item.featureFlag]) {
        return false;
      }
      
      // Check module key if specified  
      if (item.moduleKey && !enabledModules.includes(item.moduleKey)) {
        return false;
      }
      
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

// Get breadcrumbs for navigation (corrected signature)
export function getBreadcrumbs(path: string, role: UserRole): NavigationItem[] {
  const nav = getConsolidatedNavigation(role);
  const breadcrumbs: NavigationItem[] = [];
  
  const findInNav = (items: NavigationItem[], currentPath: NavigationItem[] = []): boolean => {
    for (const item of items) {
      const newPath = [...currentPath, item];
      
      if (item.href === path) {
        breadcrumbs.push(...newPath);
        return true;
      }
      
      if (item.children && findInNav(item.children, newPath)) {
        return true;
      }
    }
    return false;
  };
  
  findInNav([...nav.primary, ...nav.secondary]);
  return breadcrumbs;
}

// Flatten navigation for search
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
  
  addItems(nav.primary);
  if (nav.secondary) addItems(nav.secondary);
  if (nav.quickActions) addItems(nav.quickActions);
  
  return flattened;
}

// Get service navigation
export function getServiceNavigation(): NavigationItem[] {
  return serviceNavigation;
}

// Check route permissions
export const hasRoutePermission = (route: string, userRole: UserRole): boolean => {
  const items = getNavigation(userRole);
  return items.some(item => 
    item.href === route || 
    (item.children && item.children.some(child => child.href === route))
  );
};