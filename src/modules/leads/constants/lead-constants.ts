
import { LEAD_STATUSES } from '../types/types';

export { LEAD_STATUSES };

export const LEAD_CATEGORIES = [
  'bolig',
  'hytter',
  'næring',
  'rehabilitering',
  'annet'
] as const;

export type LeadCategory = typeof LEAD_CATEGORIES[number];

// Map clean status values to Norwegian display text
export const LEAD_STATUS_LABELS: Record<string, string> = {
  'new': 'Ny',
  'qualified': 'Kvalifisert',
  'contacted': 'Kontaktet',
  'negotiating': 'Forhandler',
  'converted': 'Konvertert',
  'lost': 'Tapt',
  'paused': 'Pauset'
};

// Map clean status values to badge colors
export const LEAD_STATUS_COLORS: Record<string, string> = {
  'new': 'bg-blue-500',
  'qualified': 'bg-purple-500', 
  'contacted': 'bg-amber-500',
  'negotiating': 'bg-orange-500',
  'converted': 'bg-green-500',
  'lost': 'bg-red-500',
  'paused': 'bg-gray-500'
};

// Define allowed status transitions using clean status values
export const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  'new': ['qualified', 'paused'],
  'qualified': ['contacted', 'converted', 'lost', 'paused'],
  'contacted': ['negotiating', 'converted', 'lost', 'paused'],
  'negotiating': ['converted', 'lost', 'paused'],
  'converted': ['paused'], // Allow pausing completed leads
  'lost': ['new'], // Allow reopening lost leads
  'paused': ['new', 'qualified', 'contacted', 'negotiating'] // Resume from pause
};
