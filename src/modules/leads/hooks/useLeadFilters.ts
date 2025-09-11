import { useState, useMemo } from 'react';
import { Lead, LeadStatus } from '@/types/leads-canonical';

interface BasicLeadFilters {
  search: string;
  status: LeadStatus | 'all';
  category: string | 'all';
  dateRange: '7days' | '30days' | '90days' | 'all';
}

const DEFAULT_FILTERS: BasicLeadFilters = {
  search: '',
  status: 'all',
  category: 'all',
  dateRange: 'all'
};

export const useLeadFilters = (leads: Lead[]) => {
  const [filters, setFilters] = useState<BasicLeadFilters>(DEFAULT_FILTERS);

  const filteredLeads = useMemo(() => {
    let filtered = [...leads];

    // Search filter - enhanced with more fields
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.title?.toLowerCase().includes(searchLower) ||
        lead.description?.toLowerCase().includes(searchLower) ||
        lead.customer_name?.toLowerCase().includes(searchLower) ||
        lead.customer_email?.toLowerCase().includes(searchLower) ||
        lead.customer_phone?.toLowerCase().includes(searchLower) ||
        lead.category?.toLowerCase().includes(searchLower) ||
        lead.anonymous_email?.toLowerCase().includes(searchLower) ||
        (lead.metadata && JSON.stringify(lead.metadata).toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(lead => lead.category === filters.category);
    }

    // Basic date range filter (only support predefined ranges)
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case '7days':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          cutoffDate.setDate(now.getDate() - 90);
          break;
      }

      filtered = filtered.filter(lead => 
        new Date(lead.created_at) >= cutoffDate
      );
    }

    return filtered;
  }, [leads, filters]);

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return {
    filters,
    setFilters,
    resetFilters,
    filteredLeads,
    totalCount: leads.length,
    filteredCount: filteredLeads.length
  };
};