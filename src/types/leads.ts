
/**
 * Lead management and related types
 */

// Define the lead status type supporting both legacy and emoji statuses for transition
export type LeadStatus = '📥 new' | '👀 qualified' | '💬 contacted' | '📞 negotiating' | '✅ converted' | '❌ lost' | '⏸️ paused' | 'new' | 'in_progress' | 'won' | 'lost' | 'assigned' | 'under_review' | 'completed' | 'archived';

// Export an array of all possible lead statuses for validation and UI purposes
export const LEAD_STATUSES: LeadStatus[] = [
  '📥 new',
  '👀 qualified',
  '💬 contacted',
  '📞 negotiating',
  '✅ converted',
  '❌ lost',
  '⏸️ paused',
  'new',
  'in_progress', 
  'won',
  'lost',
  'assigned',
  'under_review',
  'completed',
  'archived'
];

/**
 * Lead categories
 */
export const LEAD_CATEGORIES = [
  'energy',
  'insurance',
  'telecom',
  'fleet',
  'facility',
  'general'
] as const;

export type LeadCategory = typeof LEAD_CATEGORIES[number];

// Runtime type guard for lead status validation
export function isValidLeadStatus(status: any): status is LeadStatus {
  if (typeof status !== 'string') return false;
  return LEAD_STATUSES.includes(status as LeadStatus);
}

/**
 * Legacy status mapping for backward compatibility
 */
export const LEGACY_STATUS_MAP: Record<string, LeadStatus> = {
  'new': '📥 new',
  'qualified': '👀 qualified', 
  'contacted': '💬 contacted',
  'negotiating': '📞 negotiating',
  'converted': '✅ converted',
  'won': '✅ converted',
  'lost': '❌ lost',
  'paused': '⏸️ paused',
  'in_progress': '💬 contacted',
  'assigned': '👀 qualified',
  'under_review': '👀 qualified',
  'completed': '✅ converted',
  'archived': '❌ lost'
};

export function mapToEmojiStatus(status: string): LeadStatus {
  return LEGACY_STATUS_MAP[status] || '📥 new';
}

// Define lead priority as a union type
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent' | null;

// Main Lead interface matching the database schema
export interface Lead {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: LeadStatus;
  priority?: LeadPriority;
  content?: any;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  service_type?: string;
  zipCode?: string;
  company_id?: string;
  submitted_by?: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any>;
  lead_type?: string;
}

// Form values for creating/editing leads
export interface LeadFormValues {
  title: string;
  description: string;
  category: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  service_type?: string;
  metadata?: Record<string, any>;
  lead_type?: string;
  content?: any;
}

// Filter interface for lead queries
export interface LeadFilter {
  status?: LeadStatus[];
  category?: string[];
  priority?: LeadPriority[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
  company_id?: string;
  submitted_by?: string;
}

// Lead counts by status type (supporting both legacy and emoji)
export interface LeadCounts {
  '📥 new': number;
  '👀 qualified': number;
  '💬 contacted': number;
  '📞 negotiating': number;
  '✅ converted': number;
  '❌ lost': number;
  '⏸️ paused': number;
  new: number;
  in_progress: number;
  won: number;
  lost: number;
  archived?: number;
  assigned?: number;
  under_review?: number;
  completed?: number;
}

// Lead settings from the lead_settings table
export interface LeadSettings {
  id: string;
  strategy: string;
  globally_paused: boolean;
  global_pause: boolean;
  agents_paused: boolean;
  filters: Record<string, any>;
  budget: number | null;
  daily_budget: number | null;
  monthly_budget: number | null;
  updated_at: string;
  auto_distribute: boolean;
  
  // Computed properties
  paused: boolean;
  categories: string[];
  zipCodes: string[];
  lead_types: string[];
}

// Company profile interface matching company_profiles table
export interface CompanyProfile {
  id: string;
  name: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  tags: string[];
  contact_name: string;
  email: string;
  phone: string;
  industry: string;
  subscription_plan: string;
  modules_access: string[];
  metadata?: Record<string, any>;
}

// Map database lead settings object to LeadSettings interface
export function mapDbToLeadSettings(data: any): LeadSettings {
  // Ensure filters is an object (not a string or other non-object type)
  const filters = typeof data.filters === 'object' && data.filters !== null
    ? data.filters
    : {};

  return {
    id: data.id,
    strategy: data.strategy || 'round_robin',
    globally_paused: !!data.globally_paused,
    global_pause: !!data.global_pause,
    agents_paused: !!data.agents_paused,
    filters: filters,
    budget: data.budget,
    daily_budget: data.daily_budget,
    monthly_budget: data.monthly_budget,
    updated_at: data.updated_at,
    auto_distribute: !!data.auto_distribute,
    
    // Computed properties
    paused: !!data.globally_paused || !!data.global_pause,
    categories: Array.isArray(filters.categories) ? filters.categories : [],
    zipCodes: Array.isArray(filters.zipCodes) ? filters.zipCodes : [],
    lead_types: Array.isArray(filters.lead_types) ? filters.lead_types : []
  };
}
