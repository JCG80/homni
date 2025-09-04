/**
 * CANONICAL Lead Types and Status Definitions
 * 
 * This is the single source of truth for all lead-related types.
 * All other files should import from here to avoid duplicates.
 */

// Core enum values - these MUST match the database schema exactly
export type LeadStatus = 
  | 'new'
  | 'qualified' 
  | 'contacted'
  | 'negotiating'
  | 'converted'
  | 'lost'
  | 'paused';

export type PipelineStage = 
  | 'new'
  | 'in_progress' 
  | 'won'
  | 'lost';

// Canonical array of valid statuses
export const LEAD_STATUSES: LeadStatus[] = [
  'new', 'qualified', 'contacted', 'negotiating', 'converted', 'lost', 'paused'
];

export const PIPELINE_STAGES: PipelineStage[] = [
  'new', 'in_progress', 'won', 'lost'
];

// UI display labels - Norwegian
export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Ny',
  qualified: 'Kvalifisert',
  contacted: 'Kontaktet', 
  negotiating: 'Forhandling',
  converted: 'Konvertert',
  lost: 'Tapt',
  paused: 'Pauset'
};

export const PIPELINE_LABELS: Record<PipelineStage, string> = {
  new: 'Nye',
  in_progress: 'I gang',
  won: 'Vunnet',
  lost: 'Tapt'
};

// Status color mapping for UI
export const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'hsl(var(--accent))',
  qualified: 'hsl(var(--primary))',
  contacted: 'hsl(var(--secondary))',
  negotiating: 'hsl(var(--warning))',
  converted: 'hsl(var(--success))',
  lost: 'hsl(var(--destructive))',
  paused: 'hsl(var(--muted))'
};

// Core Lead interface
export interface Lead {
  id: string;
  title: string;
  description: string;
  category: string;
  status: LeadStatus;
  pipeline_stage?: PipelineStage;
  lead_type?: string;
  submitted_by?: string;
  company_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  service_type?: string;
  anonymous_email?: string;
  session_id?: string;
  attributed_at?: string;
  confirmation_email_sent_at?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface LeadFormData {
  title: string;
  description: string;
  category: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  service_type?: string;
  metadata?: Record<string, any>;
}

// Utility functions
export function isValidLeadStatus(status: any): status is LeadStatus {
  return LEAD_STATUSES.includes(status);
}

export function normalizeLeadStatus(status: string): LeadStatus {
  const normalized = status.toLowerCase().trim();
  
  switch (normalized) {
    case 'active':
    case 'open':
      return 'new';
    case 'in_progress':
    case 'working':
      return 'contacted';
    case 'closed_won':
    case 'won':
      return 'converted';
    case 'closed_lost':
      return 'lost';
    case 'on_hold':
      return 'paused';
    default:
      if (isValidLeadStatus(normalized)) {
        return normalized;
      }
      return 'new';
  }
}

export function statusToPipelineStage(status: LeadStatus): PipelineStage {
  switch (status) {
    case 'new':
    case 'qualified':
      return 'new';
    case 'contacted':
    case 'negotiating':
      return 'in_progress';
    case 'converted':
      return 'won';  
    case 'lost':
    case 'paused':
      return 'lost';
    default:
      return 'new';
  }
}

export function getStatusDisplay(status: LeadStatus): string {
  return STATUS_LABELS[status] || status;
}

export function getPipelineStageDisplay(stage: PipelineStage): string {
  return PIPELINE_LABELS[stage] || stage;
}