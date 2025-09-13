/**
 * Navigation Configuration
 * Centralized navigation mapping for all roles
 */

import { 
  Home, 
  Building, 
  Users, 
  Settings, 
  FileText, 
  BarChart3, 
  Shield, 
  LayoutDashboard,
  Target,
  User,
  Briefcase,
  DollarSign
} from 'lucide-react';

export interface NavItem {
  href: string;
  title: string;
  icon: React.ComponentType;
  description?: string;
  children?: NavItem[];
}

export interface NavConfig {
  [role: string]: NavItem[];
}

const navConfig: NavConfig = {
  // Guest Navigation (Unauthenticated users)
  guest: [
    {
      href: '/',
      title: 'Hjem',
      icon: Home,
      description: 'Startside og oversikt'
    },
    {
      href: '/sammenlign',
      title: 'Sammenlign tjenester',
      icon: Target,
      description: 'Sammenlign strøm, forsikring og andre tjenester'
    },
    {
      href: '/om-oss',
      title: 'Om oss',
      icon: FileText,
      description: 'Les mer om Homni'
    }
  ],

  // User Navigation (Private users)
  user: [
    {
      href: '/dashboard/user',
      title: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Min personlige oversikt'
    },
    {
      href: '/leads/create',
      title: 'Send forespørsel',
      icon: Target,
      description: 'Send inn ny forespørsel til leverandører'
    },
    {
      href: '/leads/my',
      title: 'Mine forespørsler', 
      icon: FileText,
      description: 'Se og administrer mine forespørsler'
    },
    {
      href: '/properties',
      title: 'Mine eiendommer',
      icon: Building,
      description: 'Boligmappa - dokumenter og vedlikehold'
    },
    {
      href: '/account',
      title: 'Konto',
      icon: User,
      description: 'Administrer konto og profil'
    }
  ],

  // Company Navigation (Business users)
  company: [
    {
      href: '/dashboard/company',
      title: 'Bedriftsdashboard',
      icon: LayoutDashboard,
      description: 'Bedriftsoversikt og KPIer'
    },
    {
      href: '/leads',
      title: 'Lead-håndtering',
      icon: Target,
      description: 'Administrer kundeemner',
      children: [
        {
          href: '/leads/my',
          title: 'Mine leads',
          icon: Target,
          description: 'Aktive leads tildelt bedriften'
        },
        {
          href: '/marketplace',
          title: 'Lead-markedsplass',
          icon: Briefcase,
          description: 'Kjøp nye leads'
        }
      ]
    },
    {
      href: '/analytics',
      title: 'Analyser',
      icon: BarChart3,
      description: 'Ytelse, konvertering og ROI'
    },
    {
      href: '/budget',
      title: 'Budsjett',
      icon: DollarSign,
      description: 'Administrer budsjett og abonnement'
    },
    {
      href: '/account',
      title: 'Konto',
      icon: User,
      description: 'Administrer bedriftsprofil'
    }
  ],

  // Admin Navigation (System administration)
  admin: [
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
      href: '/admin/settings',
      title: 'Systeminnstillinger',
      icon: Settings,
      description: 'Konfigurer systemparametere'
    }
  ],

  // Master Admin Navigation (Full system control)
  master_admin: [
    {
      href: '/dashboard/master-admin',
      title: 'Master Admin Dashboard',
      icon: Shield,
      description: 'Fullstendig systemkontroll'
    },
    {
      href: '/admin/modules',
      title: 'Moduladministrasjon',
      icon: Settings,
      description: 'Aktivere/deaktivere moduler'
    },
    {
      href: '/admin/security',
      title: 'Sikkerhet',
      icon: Shield,
      description: 'Sikkerhetsovervåkning og logging'
    },
    {
      href: '/admin/api',
      title: 'API Gateway',
      icon: Settings,
      description: 'API-administrasjon og integrasjoner'
    }
  ]
};

export default navConfig;

export const getNavigationForRole = (role: string): NavItem[] => {
  return navConfig[role] || navConfig.guest;
};