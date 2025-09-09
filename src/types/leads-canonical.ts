/**
 * CANONICAL Lead Types and Status Definitions (Find-Before-Build Consolidation)
 * 
 * This is the SINGLE SOURCE OF TRUTH for all lead-related types.
 * All other Lead interfaces have been consolidated into this file.
 * 
 * Database Fields: Matches leads table schema exactly
 * Status Values: Must align with lead_status enum in database
 * PII Fields: customer_* fields are PII and must comply with GDPR
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

// Status color mapping for UI (semantic tokens)
export const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'hsl(var(--accent))',
  qualified: 'hsl(var(--primary))',
  contacted: 'hsl(var(--secondary))',
  negotiating: 'hsl(var(--warning))',
  converted: 'hsl(var(--success))',
  lost: 'hsl(var(--destructive))',
  paused: 'hsl(var(--muted))'
};

// UI-only emoji mapping (NEVER stored in database)
export const LEAD_STATUS_EMOJI: Record<LeadStatus, string> = {
  new: '🆕',
  qualified: '✅', 
  contacted: '📞',
  negotiating: '🤝',
  converted: '🎉',
  lost: '❌',
  paused: '⏸️'
};

/**
 * CANONICAL Lead Interface - Single Source of Truth
 * 
 * Matches database table 'public.leads' schema exactly.
 * Consolidated from multiple duplicate interfaces.
 */
export interface Lead {
  // Primary key
  id: string;
  
  // Core lead data
  title: string;
  description: string;
  category: string;
  lead_type?: string;
  status: LeadStatus;
  pipeline_stage?: PipelineStage;
  
  // Ownership and assignment
  submitted_by?: string;        // UUID reference to user who submitted
  company_id?: string;          // UUID reference to assigned company
  
  // PII Customer Contact Information (GDPR compliant)
  customer_name?: string;       // Added in migration - PII
  customer_email?: string;      // Added in migration - PII  
  customer_phone?: string;      // Added in migration - PII
  
  // Service details
  service_type?: string;
  
  // Anonymous lead tracking  
  anonymous_email?: string;     // For attribution before auth
  session_id?: string;          // Track anonymous sessions
  
  // Attribution and processing
  attributed_at?: string;       // When anonymous lead was attributed to user
  confirmation_email_sent_at?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Flexible metadata (legacy support)
  metadata?: Record<string, any>;
}

/**
 * Form data interface for creating/editing leads
 */
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

/**
 * Legacy form values interface (backward compatibility)
 */
export interface LeadFormValues extends LeadFormData {
  status?: LeadStatus;
  lead_type?: string;
}

/**
 * Lead filter interface for queries
 */
export interface LeadFilter {
  categories?: string[];
  statuses?: LeadStatus[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  company_id?: string;
  assigned?: 'all' | 'assigned' | 'unassigned';
}

/**
 * Lead counts by status (for dashboard widgets)
 */
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

// === UTILITY FUNCTIONS ===

/**
 * Validate if a string is a valid lead status
 */
export function isValidLeadStatus(status: any): status is LeadStatus {
  return LEAD_STATUSES.includes(status);
}

/**
 * Normalize legacy status values to canonical ones
 */
export function normalizeLeadStatus(status: string): LeadStatus {
  const normalized = status.toLowerCase().trim();
  
  // Handle legacy emoji statuses  
  if (normalized.includes('new') || normalized.includes('🆕')) return 'new';
  if (normalized.includes('qualified') || normalized.includes('✅')) return 'qualified';
  if (normalized.includes('contacted') || normalized.includes('📞')) return 'contacted';
  if (normalized.includes('negotiating') || normalized.includes('🤝')) return 'negotiating';
  if (normalized.includes('converted') || normalized.includes('🎉')) return 'converted';
  if (normalized.includes('lost') || normalized.includes('❌')) return 'lost';
  if (normalized.includes('paused') || normalized.includes('⏸')) return 'paused';
  
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

/**
 * Map lead status to pipeline stage
 */
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

/**
 * Map pipeline stage back to default status
 */
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

/**
 * Get UI display for status (with emoji)
 */
export function getStatusDisplay(status: LeadStatus): string {
  return `${LEAD_STATUS_EMOJI[status]} ${STATUS_LABELS[status]}`;
}

/**
 * Get UI display for pipeline stage
 */
export function getPipelineStageDisplay(stage: PipelineStage): string {
  return PIPELINE_LABELS[stage];
}

// Legacy function name support (backward compatibility)
export const normalizeStatus = normalizeLeadStatus;
export const statusToPipeline = statusToPipelineStage;

// === COMPANY/SETTINGS INTERFACES ===

// CompanyProfile moved to src/types/company.ts as canonical source
// Re-export from canonical location
export type { CompanyProfile } from '@/types/company';

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

/**
 * Map database lead_settings to LeadSettings interface
 */
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
    paused: dbSettings.globally_paused || dbSettings.global_pause || false,
    filters: dbSettings.filters || {},
    categories: dbSettings.filters?.categories || [],
    lead_types: dbSettings.filters?.lead_types || [],
    zipCodes: dbSettings.filters?.zipCodes || [],
    updated_at: dbSettings.updated_at
  };
}