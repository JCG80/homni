
import {
  Home,
  Users,
  Building,
  FileText,
  Settings,
  BarChart,
  Layers,
  ShieldCheck,
  Activity,
  FilePlus,
  User,
  LayoutDashboard,
  HelpCircle,
  Zap,
  Smartphone,
  Shield,
  Wifi,
  Anchor,
  Database,
  Kanban,
} from "lucide-react";
import { UserRole } from "@/modules/auth/types/unified-types";
import { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  children?: NavItem[];
  description?: string;
  isFeatureFlag?: boolean;
  roles?: UserRole[];
}

// Shared navigation items that appear in multiple role dashboards
const sharedNavItems: Record<string, NavItem> = {
  home: {
    title: "Hjem",
    href: "/",
    icon: Home,
    description: "Tilbake til forside",
  },
  dashboard: {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Oversikt over dashboard",
  },
  profile: {
    title: "Min profil",
    href: "/profile",
    icon: User,
    description: "Se og rediger din profil",
  },
  settings: {
    title: "Innstillinger",
    href: "/account",
    icon: Settings,
    description: "Administrer dine innstillinger",
  },
  leads: {
    title: "Forespørsler",
    href: "/leads",
    icon: Activity,
    description: "Håndter forespørsler",
  },
  leadsKanban: {
    title: "Kanban-tavle",
    href: "/leads/kanban",
    icon: Kanban,
    description: "Kanban visning av forespørsler",
  },
};

// Service navigation items
const serviceNavItems: NavItem[] = [
  {
    title: "Strøm",
    href: "/strom",
    icon: Zap,
    description: "Sammenlign strømavtaler",
  },
  {
    title: "Mobil",
    href: "/mobil",
    icon: Smartphone,
    description: "Finn den beste mobilavtalen",
  },
  {
    title: "Forsikring",
    href: "/forsikring",
    icon: Shield,
    description: "Sammenlign forsikringstilbud",
  },
  {
    title: "Bredbånd",
    href: "/bredband",
    icon: Wifi,
    description: "Finn den beste bredbåndsavtalen",
  },
  {
    title: "Marina",
    href: "/marina",
    icon: Anchor,
    description: "Administrer havneplass",
  },
];

// Documentation navigation items
const docNavItems: NavItem[] = [
  {
    title: "Prosjektplan",
    href: "/docs/project-plan",
    icon: FileText,
    description: "Se prosjektplan",
  },
  {
    title: "FAQ",
    href: "/docs/faq",
    icon: HelpCircle,
    description: "Ofte stilte spørsmål",
  },
];

// Role-specific navigation configurations
export const navConfig: Record<UserRole, NavItem[]> = {
  user: [
    sharedNavItems.dashboard,
    {
      title: "Mine eiendommer",
      href: "/dashboard/properties",
      icon: Building,
      description: "Se og administrer dine eiendommer",
    },
    {
      title: "Mine dokumenter",
      href: "/dashboard/documents",
      icon: FileText,
      description: "Tilgang til dine dokumenter",
    },
    sharedNavItems.leads,
    sharedNavItems.profile,
    sharedNavItems.settings,
  ],
  
  company: [
    sharedNavItems.dashboard,
    sharedNavItems.leads,
    sharedNavItems.leadsKanban,
    {
      title: "Analysere",
      href: "/dashboard/analytics",
      icon: BarChart,
      description: "Se bedriftsanalyser",
    },
    sharedNavItems.settings,
  ],
  
  content_editor: [
    sharedNavItems.dashboard,
    {
      title: "Innhold",
      href: "/dashboard/content",
      icon: FilePlus,
      description: "Administrere nettstedinnhold",
    },
    {
      title: "Mediebibliotek",
      href: "/dashboard/media",
      icon: FileText,
      description: "Administrere mediefiler",
    },
    sharedNavItems.settings,
  ],
  
  admin: [
    sharedNavItems.dashboard,
    {
      title: "Bedrifter",
      href: "/admin/companies",
      icon: Building,
      description: "Administrer bedriftskontoer",
    },
    {
      title: "Brukere",
      href: "/admin/members",
      icon: Users,
      description: "Administrer medlemskontoer",
    },
    {
      title: "System moduler",
      href: "/admin/system-modules",
      icon: Database,
      description: "Administrer systemmoduler",
    },
    {
      title: "Forespørsler",
      href: "/admin/leads",
      icon: Activity,
      description: "Administrer forespørsler",
    },
    {
      title: "Innstillinger",
      href: "/admin/settings",
      icon: Settings,
      description: "Systeminnstillinger",
    },
  ],
  
  master_admin: [
    sharedNavItems.dashboard,
    {
      title: "Bedrifter",
      href: "/admin/companies",
      icon: Building,
      description: "Administrer bedriftskontoer",
    },
    {
      title: "Brukere",
      href: "/admin/members",
      icon: Users,
      description: "Administrer medlemskontoer",
    },
    {
      title: "System",
      href: "/admin/system-modules",
      icon: Database,
      description: "Systemadministrasjon",
    },
    {
      title: "Forespørsler",
      href: "/admin/leads",
      icon: Activity,
      description: "Administrer forespørsler",
    },
    {
      title: "Roller",
      href: "/admin/roles",
      icon: ShieldCheck,
      description: "Administrer brukerroller",
    },
    {
      title: "Modultilgang",
      href: "/admin/internal-access",
      icon: ShieldCheck,
      description: "Administrer modultilgang",
    },
    {
      title: "Innstillinger",
      href: "/admin/settings",
      icon: Settings,
      description: "Master systeminnstillinger",
    },
  ],
  
  guest: [
    {
      title: "Hjem",
      href: "/",
      icon: Home,
      description: "Tilbake til hjemmesiden",
    },
    {
      title: "Logg inn",
      href: "/login",
      icon: Users,
      description: "Logg inn på konto",
    },
  ],
};

// Service navigation configuration
export const serviceConfig: NavItem[] = serviceNavItems;

// Documentation navigation configuration
export const docConfig: NavItem[] = docNavItems;

// Helper function to get navigation items based on user role
export function getNavigation(role: UserRole = 'guest'): NavItem[] {
  return navConfig[role] || navConfig.guest;
}

// Helper function to get service navigation items
export function getServiceNavigation(): NavItem[] {
  return serviceConfig;
}

// Helper function to get documentation navigation items
export function getDocNavigation(): NavItem[] {
  return docConfig;
}
