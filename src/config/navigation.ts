/**
 * Enhanced navigation configuration with business module integration
 */

import { UserRole } from '@/types/auth';
import { Home, Search, Building, FileText, Target, DollarSign } from 'lucide-react';

export interface NavigationItem {
  href: string;
  title: string;
  icon?: any;
  badge?: string | number;
  children?: NavigationItem[];
  permission?: UserRole[];
}

/**
 * Get navigation items based on user role
 */
export const getNavigation = (role: UserRole): NavigationItem[] => {
  switch (role) {
    case 'guest':
      return [
        { href: '/', title: 'Forside', icon: Home },
        { href: '/sammenlign', title: 'Sammenlign', icon: Search },
        { href: '/om-oss', title: 'Om oss', icon: Building },
      ];

    case 'user':
      return [
        { href: '/dashboard', title: 'Dashboard', icon: Home },
        { href: '/leads', title: 'Lead Engine', icon: Target },
        { href: '/property', title: 'Eiendomsforvaltning', icon: Building },
        { href: '/sales', title: 'DIY Salg', icon: DollarSign },
        { href: '/documents', title: 'Dokumenter', icon: FileText },
      ];

    case 'company':
      return [
        { href: '/dashboard/company', title: 'Bedrift Dashboard', icon: Home },
        { href: '/leads/manage', title: 'Lead Management', icon: Target },
        { href: '/property/portfolio', title: 'Portefølje', icon: Building },
        { href: '/sales/pipeline', title: 'Salg Pipeline', icon: DollarSign },
        { href: '/leads/kanban', title: 'Lead Pipeline', icon: Target },
      ];

    case 'content_editor':
      return [
        { href: '/dashboard', title: 'Dashboard', icon: Home },
        { href: '/cms', title: 'Innholdsstyring', icon: FileText },
        { href: '/cms/artikler', title: 'Artikler', icon: FileText },
        { href: '/cms/preview', title: 'Forhåndsvisning', icon: Search },
      ];

    case 'admin':
    case 'master_admin':
      return [
        { href: '/admin', title: 'Admin Dashboard', icon: Home },
        { href: '/admin/leads', title: 'Alle Leads', icon: Target },
        { href: '/admin/leads/distribution', title: 'Lead-distribusjon', icon: Target },
        { href: '/admin/modules', title: 'Moduler', icon: Building },
        { href: '/admin/users', title: 'Brukere', icon: Building },
      ];

    default:
      return [];
  }
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