
export const LEAD_STATUSES = [
  'new',
  'assigned',
  'under_review',
  'in_progress',
  'completed',
  'archived'
] as const;

export type LeadStatus = typeof LEAD_STATUSES[number];

export interface Lead {
  id: string;
  title: string;
  description: string;
  category: string;
  status: LeadStatus;
  created_at: string;
  updated_at: string | null;
  company_id: string | null;
  created_by: string;
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
