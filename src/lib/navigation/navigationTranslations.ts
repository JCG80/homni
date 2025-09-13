/**
 * Navigation Translation Helper
 * Converts navigation items to use i18n translation keys
 */

import type { NavigationItem } from '@/types/consolidated-types';
import type { UserRole } from '@/modules/auth/normalizeRole';

// Translation key mappings for navigation titles
export const navigationTranslationKeys: Record<string, string> = {
  // Guest navigation
  'Hjem': 'navigation.home',
  'Sammenlign tjenester': 'navigation.compare_services',
  'Om oss': 'navigation.about_us',
  
  // User navigation  
  'Dashboard': 'navigation.dashboard',
  'Mine forespørsler': 'navigation.my_requests',
  'Mine eiendommer': 'navigation.my_properties',
  'Vedlikehold': 'navigation.maintenance',
  'DIY Salg': 'navigation.diy_sales',
  'Mine dokumenter': 'navigation.my_documents',
  
  // Company navigation
  'Bedriftsdashboard': 'navigation.company_dashboard',
  'Lead-håndtering': 'navigation.lead_management',
  'Mine leads': 'navigation.my_leads',
  'Kanban-oversikt': 'navigation.kanban_view',
  'Lead-markedsplass': 'navigation.lead_marketplace',
  'Analyse og rapporter': 'navigation.analytics_reports',
  'Eiendomsportefølje': 'navigation.property_portfolio',
  'Salg Pipeline': 'navigation.sales_pipeline',
  
  // Content editor navigation
  'Innholdsdashboard': 'navigation.content_dashboard',
  'Innholdshåndtering': 'navigation.content_management',
  'Artikler': 'navigation.articles',
  'Sider': 'navigation.pages',
  'Mediebibliotek': 'navigation.media_library',
  'Innholdsanalyse': 'navigation.content_analytics',
  
  // Admin navigation
  'Admin Dashboard': 'navigation.admin_dashboard',
  'Lead-administrasjon': 'navigation.lead_administration',
  'Bedriftshåndtering': 'navigation.company_management',
  'Brukerhåndtering': 'navigation.user_management',
  'Systemanalyse': 'navigation.system_analytics',
  'Innholdsadministrasjon': 'navigation.content_administration',
  'Systeminnstillinger': 'navigation.system_settings',
  
  // Master admin navigation
  'Master Admin Dashboard': 'navigation.master_admin_dashboard',
  'Moduladministrasjon': 'navigation.module_administration',
  'Feature Flags': 'navigation.feature_flags',
  'Sikkerhet og revisjonslogg': 'navigation.security_audit',
  'Systemkontroll': 'navigation.system_control',
  'API Gateway': 'navigation.api_gateway',
  'Systemovervåkning': 'navigation.system_monitoring',
  
  // Secondary navigation
  'Kontoinnstillinger': 'navigation.account_settings',
  'Varsler': 'navigation.notifications',
  'Hjelp og support': 'navigation.help_support',
  
  // Service navigation
  'Strøm': 'navigation.power',
  'Forsikring': 'navigation.insurance',
  'Bredbånd': 'navigation.broadband',
  'Mobilabonnement': 'navigation.mobile'
};

/**
 * Converts a navigation item to use translation keys
 */
export function translateNavigationItem(item: NavigationItem): NavigationItem {
  const translationKey = navigationTranslationKeys[item.title];
  
  return {
    ...item,
    title: translationKey || item.title,
    children: item.children?.map(translateNavigationItem)
  };
}

/**
 * Converts an array of navigation items to use translation keys
 */
export function translateNavigationItems(items: NavigationItem[]): NavigationItem[] {
  return items.map(translateNavigationItem);
}

/**
 * Gets role display name translation key
 */
export function getRoleDisplayKey(role: UserRole): string {
  switch (role) {
    case 'guest':
      return 'navigation.menu';
    case 'user':
      return 'navigation.my_page';
    case 'company':
      return 'navigation.company';
    case 'content_editor':
      return 'navigation.content';
    case 'admin':
      return 'navigation.administration';
    case 'master_admin':
      return 'navigation.system';
    default:
      return 'navigation.menu';
  }
}