import { LeadStatus } from '@/types/leads-canonical';

export interface EnhancedLeadFilters {
  search: string;
  status: LeadStatus | 'all';
  category: string | 'all';
  dateRange: '7days' | '30days' | '90days' | 'custom' | 'all';
  customDateStart?: Date;
  customDateEnd?: Date;
  location?: string;
  minValue?: number;
  maxValue?: number;
  assignedTo?: string | 'all';
  source?: string | 'all';
}

export const DEFAULT_ENHANCED_FILTERS: EnhancedLeadFilters = {
  search: '',
  status: 'all',
  category: 'all',
  dateRange: 'all',
  location: '',
  assignedTo: 'all',
  source: 'all'
};