import { createContext, useContext } from 'react';

export interface Translation {
  [key: string]: string | Translation;
}

export interface Translations {
  no: Translation;
  en: Translation;
  se: Translation;
  dk: Translation;
}

export type SupportedLocale = 'no' | 'en' | 'se' | 'dk';

export interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextType | null>(null);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Default translations structure
export const defaultTranslations: Translations = {
  no: {
    common: {
      loading: 'Laster...',
      error: 'Feil',
      save: 'Lagre',
      cancel: 'Avbryt',
      delete: 'Slett',
      edit: 'Rediger',
      back: 'Tilbake',
      next: 'Neste',
      previous: 'Forrige',
      search: 'Søk',
      filter: 'Filter',
      sort: 'Sorter'
    },
    navigation: {
      dashboard: 'Dashboard',
      leads: 'Leads',
      companies: 'Bedrifter',
      admin: 'Admin',
      profile: 'Profil',
      logout: 'Logg ut'
    },
    leads: {
      title: 'Leads',
      new: 'Nye',
      in_progress: 'I gang',
      won: 'Vunnet',
      lost: 'Tapt',
      kanban: 'Kanban tavle',
      create: 'Opprett lead',
      edit: 'Rediger lead',
      delete: 'Slett lead',
      no_leads: 'Ingen leads funnet'
    }
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort'
    },
    navigation: {
      dashboard: 'Dashboard',
      leads: 'Leads',
      companies: 'Companies',
      admin: 'Admin',
      profile: 'Profile',
      logout: 'Logout'
    },
    leads: {
      title: 'Leads',
      new: 'New',
      in_progress: 'In Progress',
      won: 'Won',
      lost: 'Lost',
      kanban: 'Kanban Board',
      create: 'Create Lead',
      edit: 'Edit Lead',
      delete: 'Delete Lead',
      no_leads: 'No leads found'
    }
  },
  se: {
    common: {
      loading: 'Laddar...',
      error: 'Fel',
      save: 'Spara',
      cancel: 'Avbryt',
      delete: 'Radera',
      edit: 'Redigera',
      back: 'Tillbaka',
      next: 'Nästa',
      previous: 'Föregående',
      search: 'Sök',
      filter: 'Filter',
      sort: 'Sortera'
    },
    navigation: {
      dashboard: 'Dashboard',
      leads: 'Leads',
      companies: 'Företag',
      admin: 'Admin',
      profile: 'Profil',
      logout: 'Logga ut'
    },
    leads: {
      title: 'Leads',
      new: 'Nya',
      in_progress: 'Pågående',
      won: 'Vunna',
      lost: 'Förlorade',
      kanban: 'Kanban tavla',
      create: 'Skapa lead',
      edit: 'Redigera lead',
      delete: 'Radera lead',
      no_leads: 'Inga leads hittades'
    }
  },
  dk: {
    common: {
      loading: 'Indlæser...',
      error: 'Fejl',
      save: 'Gem',
      cancel: 'Annuller',
      delete: 'Slet',
      edit: 'Rediger',
      back: 'Tilbage',
      next: 'Næste',
      previous: 'Forrige',
      search: 'Søg',
      filter: 'Filter',
      sort: 'Sorter'
    },
    navigation: {
      dashboard: 'Dashboard',
      leads: 'Leads',
      companies: 'Virksomheder',
      admin: 'Admin',
      profile: 'Profil',
      logout: 'Log ud'
    },
    leads: {
      title: 'Leads',
      new: 'Nye',
      in_progress: 'I gang',
      won: 'Vundet',
      lost: 'Tabt',
      kanban: 'Kanban tavle',
      create: 'Opret lead',
      edit: 'Rediger lead',
      delete: 'Slet lead',
      no_leads: 'Ingen leads fundet'
    }
  }
};