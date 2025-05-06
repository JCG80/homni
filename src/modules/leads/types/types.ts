
export const LEAD_STATUSES = [
  'new',
  'assigned',
  'under_review',
  'in_progress',
  'completed',
  'archived'
] as const;

export type LeadStatus = typeof LEAD_STATUSES[number];

export type LeadPriority = 'low' | 'medium' | 'high';

export interface Lead {
  id: string;
  title: string;
  description: string;
  category: string;
  status: LeadStatus;
  priority?: LeadPriority;
  created_at: string;
  updated_at?: string;
  company_id?: string | null;
  created_by: string;
  provider_id?: string | null;
  property_id?: string | null;
  gdpr_deletion_date?: string | null;
  deleted_at?: string | null;
  content?: any;
  internal_notes?: string | null;
}

export interface LeadFormValues {
  title: string;
  description: string;
  category: string;
}

export interface LeadFilter {
  status?: LeadStatus;
  category?: string;
}
