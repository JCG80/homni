
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

// Map status to Norwegian display text
export const LEAD_STATUS_LABELS: Record<string, string> = {
  'new': 'Ny',
  'assigned': 'Tildelt',
  'under_review': 'Under vurdering',
  'in_progress': 'Pågående',
  'completed': 'Fullført',
  'archived': 'Arkivert'
};

// Map status to badge color
export const LEAD_STATUS_COLORS: Record<string, string> = {
  'new': 'bg-blue-500',
  'assigned': 'bg-purple-500',
  'under_review': 'bg-amber-500',
  'in_progress': 'bg-green-500',
  'completed': 'bg-emerald-700',
  'archived': 'bg-gray-500'
};

// Define allowed status transitions
export const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  'new': ['assigned', 'archived'],
  'assigned': ['under_review', 'in_progress', 'archived'],
  'under_review': ['in_progress', 'archived'],
  'in_progress': ['completed', 'archived'],
  'completed': ['archived'],
  'archived': ['new'] // Allow reopening from archive
};
