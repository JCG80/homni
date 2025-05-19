
// Only add this if the file doesn't already define these types
export type LeadStatus = 'new' | 'in_progress' | 'won' | 'lost' | 'archived';

export interface Lead {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
  description: string;
  status: LeadStatus;
  created_at: string;
  company_id?: string;
  submitted_by?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
  lead_type?: string;
  title?: string;
  category?: string;
}

export interface LeadCounts {
  new: number;
  in_progress: number;
  won: number;
  lost: number;
}
