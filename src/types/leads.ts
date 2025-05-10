
import { Json } from "@/integrations/supabase/types";

// Define allowed lead statuses as a constant
export const LEAD_STATUSES = [
  'new',
  'assigned',
  'under_review',
  'in_progress',
  'completed',
  'archived'
] as const;

// Define LeadStatus type from the constant
export type LeadStatus = typeof LEAD_STATUSES[number];

// Validation function to check if a value is a valid lead status
export function isValidLeadStatus(value: any): value is LeadStatus {
  return LEAD_STATUSES.includes(value);
}

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
  submitted_by: string; 
  provider_id?: string | null;
  property_id?: string | null;
  gdpr_deletion_date?: string | null;
  deleted_at?: string | null;
  content?: any;
  internal_notes?: string | null;
  zipCode?: string; // Added zipCode field
}

export interface LeadFormValues {
  title: string;
  description: string;
  category: string;
  zipCode?: string; // Added zipCode field
}

export interface LeadFilter {
  status?: LeadStatus;
  category?: string;
  zipCode?: string; // Added zipCode field
}

// Base lead settings that match our core type requirements
export interface LeadSettings {
  id: string;
  strategy: string;
  globally_paused: boolean;
  global_pause: boolean;
  agents_paused: boolean;
  filters: {
    categories?: string[];
    zipCodes?: string[];
    [key: string]: Json | undefined;
  };
  budget?: number;
  daily_budget?: number;
  monthly_budget?: number;
  updated_at: string;
  
  // Properties for direct access
  paused: boolean;
  categories: string[];
  zipCodes?: string[];
}

// Company profile interface
export interface CompanyProfile {
  id: string;
  name: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  tags?: string[];
}

// Conversion function to map DB model to our type
export function mapDbToLeadSettings(data: any): LeadSettings {
  return {
    id: data.id,
    strategy: data.strategy,
    globally_paused: data.globally_paused,
    global_pause: data.global_pause,
    agents_paused: data.agents_paused,
    filters: data.filters || { categories: [], zipCodes: [] },
    budget: data.budget,
    daily_budget: data.daily_budget,
    monthly_budget: data.monthly_budget,
    updated_at: data.updated_at,
    
    // Map to the base type properties
    paused: data.globally_paused || data.global_pause,
    categories: data.filters?.categories || [],
    zipCodes: data.filters?.zipCodes || []
  };
}
