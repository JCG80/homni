
export interface SystemModule {
  id: string;
  name: string;
  description: string;
  active: boolean;
  dependencies?: string[];
  icon?: string;
  route?: string;
}

export const ALL_MODULES: SystemModule[] = [
  {
    id: 'auth',
    name: 'Autentisering',
    description: 'Håndterer brukerinnlogging og rolletildeling',
    active: true,
    icon: 'key',
    route: '/admin/auth'
  },
  {
    id: 'leads',
    name: 'Forespørsler',
    description: 'Håndtering og distribusjon av leads',
    active: true,
    icon: 'clipboard',
    route: '/admin/leads'
  },
  {
    id: 'content',
    name: 'Innhold',
    description: 'Administrasjon av nettsideinnhold',
    active: true,
    icon: 'file-text',
    route: '/admin/content'
  },
  {
    id: 'company',
    name: 'Bedrifter',
    description: 'Administrasjon av bedriftskontoer',
    active: true,
    icon: 'building',
    route: '/admin/companies'
  },
  {
    id: 'users',
    name: 'Brukere',
    description: 'Administrasjon av brukerkontoer',
    active: true,
    icon: 'users',
    route: '/admin/users'
  },
  {
    id: 'reports',
    name: 'Rapporter',
    description: 'Statistikk og rapportering',
    active: true,
    icon: 'bar-chart',
    route: '/admin/reports'
  },
  {
    id: 'geo',
    name: 'Geotjenester',
    description: 'Adressesøk og geografiske tjenester',
    active: true,
    icon: 'map',
    route: '/admin/geo'
  },
  {
    id: 'system',
    name: 'System',
    description: 'Systemadministrasjon og konfigurasjon',
    active: true,
    icon: 'settings',
    route: '/admin/system'
  }
];

export function getModuleDependencies(moduleId: string): string[] {
  const module = ALL_MODULES.find(m => m.id === moduleId);
  return module?.dependencies || [];
}

export function isModuleActive(moduleId: string): boolean {
  const module = ALL_MODULES.find(m => m.id === moduleId);
  return module?.active || false;
}

export function getModuleByRoute(route: string): SystemModule | undefined {
  return ALL_MODULES.find(m => m.route === route);
}
