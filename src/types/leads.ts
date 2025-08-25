/**
 * Lead Status and Pipeline Types - Canonical Definitions
 * 
 * CRITICAL: These are the CANONICAL slugs used in DB/API.
 * Emojis are ONLY for UI display and should NEVER be stored in DB.
 */

// Database enum values - these MUST match the database schema
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

// Legacy support - array of valid statuses
export const LEAD_STATUSES: LeadStatus[] = [
  'new', 'qualified', 'contacted', 'negotiating', 'converted', 'lost', 'paused'
];

// UI-only mapping - emojis should NEVER be stored in database
export const LEAD_STATUS_EMOJI: Record<LeadStatus, string> = {
  new: '🆕',
  qualified: '✅', 
  contacted: '📞',
  negotiating: '🤝',
  converted: '🎉',
  lost: '❌',
  paused: '⏸️'
};

export const PIPELINE_STAGE_EMOJI: Record<PipelineStage, string> = {
  new: '🆕',
  in_progress: '🚀', 
  won: '🏆',
  lost: '❌'
};

// UI display labels (backward compatibility)
export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  qualified: 'Qualified',
  contacted: 'Contacted', 
  negotiating: 'Negotiating',
  converted: 'Converted',
  lost: 'Lost',
  paused: 'Paused'
};

export const PIPELINE_LABELS: Record<PipelineStage, string> = {
  new: 'New',
  in_progress: 'In Progress',
  won: 'Won',
  lost: 'Lost'
};

// Core interfaces
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
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface LeadFormValues {
  title: string;
  description: string;
  category: string;
  status?: LeadStatus;
  lead_type?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  service_type?: string;
  metadata?: Record<string, any>;
}

export interface CompanyProfile {
  id: string;
  user_id?: string;
  name: string;
  email?: string;
  phone?: string;
  industry?: string;
  contact_name?: string;
  status?: string;
  subscription_plan?: string;
  modules_access?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface LeadSettings {
  id: string;
  company_id?: string;
  strategy: string;
  budget?: number;
  daily_budget?: number;
  monthly_budget?: number;
  auto_distribute?: boolean;
  global_pause: boolean;
  agents_paused: boolean;
  globally_paused: boolean;
  paused?: boolean;
  filters: Record<string, any>;
  categories?: string[];
  lead_types?: string[];
  zipCodes?: string[];
  updated_at: string;
}

export interface LeadFilter {
  categories?: string[];
  statuses?: LeadStatus[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  company_id?: string;
}

export interface LeadCounts {
  new: number;
  qualified: number;
  contacted: number;
  negotiating: number;
  converted: number;
  lost: number;
  paused: number;
  // Pipeline stage counts (computed from statuses)
  in_progress: number;
  won: number;
}

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

// Status validation and normalization functions
export function isValidLeadStatus(status: any): status is LeadStatus {
  return LEAD_STATUSES.includes(status);
}

export function normalizeLeadStatus(status: string): LeadStatus {
  const normalized = status.toLowerCase().trim();
  
  // Map legacy/alternative values to canonical ones
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
      // If it's already a valid status, return it
      if (isValidLeadStatus(normalized)) {
        return normalized;
      }
      return 'new'; // Default fallback
  }
}

// Legacy function name support
export const normalizeStatus = normalizeLeadStatus;

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

// Legacy function name support
export const statusToPipeline = statusToPipelineStage;

export function pipelineStageToStatus(stage: PipelineStage): LeadStatus {
  switch (stage) {
    case 'new':
      return 'new';
    case 'in_progress':
      return 'contacted';
    case 'won':
      return 'converted';
    case 'lost':
      return 'lost';
    default:
      return 'new';
  }
}

// UI Display helpers
export function getStatusDisplay(status: LeadStatus): string {
  return `${LEAD_STATUS_EMOJI[status]} ${STATUS_LABELS[status]}`;
}

export function getPipelineStageDisplay(stage: PipelineStage): string {
  return `${PIPELINE_STAGE_EMOJI[stage]} ${PIPELINE_LABELS[stage]}`;
}

// Settings mapping function
export function mapDbToLeadSettings(dbSettings: any): LeadSettings {
  return {
    id: dbSettings.id,
    company_id: dbSettings.company_id,
    strategy: dbSettings.strategy || 'category_match',
    budget: dbSettings.budget,
    daily_budget: dbSettings.daily_budget,
    monthly_budget: dbSettings.monthly_budget,
    auto_distribute: dbSettings.auto_distribute || false,
    global_pause: dbSettings.global_pause || false,
    agents_paused: dbSettings.agents_paused || false,
    globally_paused: dbSettings.globally_paused || false,
    paused: dbSettings.paused || false,
    filters: dbSettings.filters || {},
    categories: dbSettings.categories || [],
    lead_types: dbSettings.lead_types || [],
    zipCodes: dbSettings.zipCodes || [],
    updated_at: dbSettings.updated_at
  };
}