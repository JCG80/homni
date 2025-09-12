import React, { useState, useCallback, useMemo, createContext, useContext } from 'react';

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

// Enhanced default translations with comprehensive maintenance module support
export const defaultTranslations: Translations = {
  no: {
    common: {
      loading: 'Laster...',
      error: 'Feil',
      success: 'Vellykket',
      save: 'Lagre',
      cancel: 'Avbryt',
      delete: 'Slett',
      edit: 'Rediger',
      add: 'Legg til',
      close: 'Lukk',
      back: 'Tilbake',
      next: 'Neste',
      previous: 'Forrige',
      search: 'Søk',
      filter: 'Filter',
      sort: 'Sorter',
      view: 'Vis',
      download: 'Last ned',
      upload: 'Last opp',
      settings: 'Innstillinger',
      profile: 'Profil',
      logout: 'Logg ut',
      login: 'Logg inn',
      register: 'Registrer',
      home: 'Hjem',
      dashboard: 'Dashboard',
      admin: 'Admin',
      help: 'Hjelp',
      contact: 'Kontakt',
      about: 'Om oss'
    },
    navigation: {
      dashboard: 'Dashboard',
      leads: 'Leads',
      companies: 'Bedrifter',
      properties: 'Eiendommer',
      maintenance: 'Vedlikehold',
      documents: 'Dokumenter',
      reports: 'Rapporter',
      analytics: 'Analyse',
      content: 'Innhold',
      users: 'Brukere',
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
    },
    maintenance: {
      title: 'Vedlikehold',
      dashboard: 'Vedlikeholdsdashboard',
      admin: 'Vedlikeholdsadministrasjon',
      tasks: 'Oppgaver',
      due_tasks: 'Forfalle oppgaver',
      completed_tasks: 'Fullførte oppgaver',
      overdue_tasks: 'Forfalte oppgaver',
      upcoming_tasks: 'Kommende oppgaver',
      labels: {
        title: 'Tittel',
        description: 'Beskrivelse',
        priority: 'Prioritet',
        frequency: 'Frekvens (måneder)',
        estimated_time: 'Estimert tid',
        cost_estimate: 'Kostnadsestimat',
        seasons: 'Årstider',
        property_types: 'Boligtyper',
        status: 'Status',
        due_date: 'Forfallsdato',
        completed_at: 'Fullført',  
        notes: 'Notater'
      },
      priorities: {
        low: 'Lav',
        medium: 'Middels',
        high: 'Høy',
        critical: 'Kritisk'
      },
      seasons: {
        spring: 'Vår',
        summer: 'Sommer',
        autumn: 'Høst',
        winter: 'Vinter'
      },
      property_types: {
        apartment: 'Leilighet',
        house: 'Hus',
        cabin: 'Hytte',
        commercial: 'Kommersiell'
      },
      actions: {
        add_task: 'Legg til oppgave',
        mark_completed: 'Marker som fullført',
        view_details: 'Vis detaljer',
        edit_task: 'Rediger oppgave',
        delete_task: 'Slett oppgave'
      },
      messages: {
        task_completed: 'Oppgave merket som fullført',
        task_created: 'Oppgave opprettet',
        task_updated: 'Oppgave oppdatert',
        task_deleted: 'Oppgave slettet',
        no_due_tasks: 'Ingen oppgaver forfaller denne sesongen',
        loading_tasks: 'Laster oppgaver...',
        error_loading: 'Feil ved lasting av oppgaver'
      }
    }
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      view: 'View',
      download: 'Download',
      upload: 'Upload',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',
      home: 'Home',
      dashboard: 'Dashboard',
      admin: 'Admin',
      help: 'Help',
      contact: 'Contact',
      about: 'About'
    },
    navigation: {
      dashboard: 'Dashboard',
      leads: 'Leads',
      companies: 'Companies',
      properties: 'Properties',
      maintenance: 'Maintenance',
      documents: 'Documents',
      reports: 'Reports',
      analytics: 'Analytics',
      content: 'Content',
      users: 'Users',
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
    },
    maintenance: {
      title: 'Maintenance',
      dashboard: 'Maintenance Dashboard',
      admin: 'Maintenance Administration',
      tasks: 'Tasks',
      due_tasks: 'Due Tasks',
      completed_tasks: 'Completed Tasks',
      overdue_tasks: 'Overdue Tasks',
      upcoming_tasks: 'Upcoming Tasks',
      labels: {
        title: 'Title',
        description: 'Description',
        priority: 'Priority',
        frequency: 'Frequency (months)',
        estimated_time: 'Estimated Time',
        cost_estimate: 'Cost Estimate',
        seasons: 'Seasons',
        property_types: 'Property Types',
        status: 'Status',
        due_date: 'Due Date',
        completed_at: 'Completed',
        notes: 'Notes'
      },
      priorities: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical'
      },
      seasons: {
        spring: 'Spring',
        summer: 'Summer',
        autumn: 'Autumn',
        winter: 'Winter'
      },
      property_types: {
        apartment: 'Apartment',
        house: 'House',
        cabin: 'Cabin',
        commercial: 'Commercial'
      },
      actions: {
        add_task: 'Add Task',
        mark_completed: 'Mark Completed',
        view_details: 'View Details',
        edit_task: 'Edit Task',
        delete_task: 'Delete Task'
      },
      messages: {
        task_completed: 'Task marked as completed',
        task_created: 'Task created',
        task_updated: 'Task updated',
        task_deleted: 'Task deleted',
        no_due_tasks: 'No tasks due this season',
        loading_tasks: 'Loading tasks...',
        error_loading: 'Error loading tasks'
      }
    }
  },
  se: {
    common: {
      loading: 'Laddar...',
      error: 'Fel',
      success: 'Framgång',
      save: 'Spara',
      cancel: 'Avbryt',
      delete: 'Radera',
      edit: 'Redigera',
      add: 'Lägg till',
      close: 'Stäng',
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
      properties: 'Fastigheter',
      maintenance: 'Underhåll',
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
    },
    maintenance: {
      title: 'Underhåll',
      dashboard: 'Underhållsdashboard',
      admin: 'Underhållsadministration'
    }
  },
  dk: {
    common: {
      loading: 'Indlæser...',
      error: 'Fejl',
      success: 'Succes', 
      save: 'Gem',
      cancel: 'Annuller',
      delete: 'Slet',
      edit: 'Rediger',
      add: 'Tilføj',
      close: 'Luk',
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
      properties: 'Ejendomme',
      maintenance: 'Vedligeholdelse',
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
    },
    maintenance: {
      title: 'Vedligeholdelse',
      dashboard: 'Vedligeholdelsesdashboard',
      admin: 'Vedligeholdelsesadministration'
    }
  }
};