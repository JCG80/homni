import { useState, useEffect, useMemo } from 'react';
import { Lead } from '@/types/leads-canonical';

interface UseLazyLeadDataOptions {
  leads: Lead[];
  pageSize?: number;
  searchTerm?: string;
}

/**
 * Hook for lazy loading lead data to improve performance with large datasets
 */
export function useLazyLeadData({ 
  leads, 
  pageSize = 20, 
  searchTerm = '' 
}: UseLazyLeadDataOptions) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Filter leads based on search term
  const filteredLeads = useMemo(() => {
    if (!searchTerm) return leads;
    
    const search = searchTerm.toLowerCase();
    return leads.filter(lead =>
      lead.title?.toLowerCase().includes(search) ||
      lead.description?.toLowerCase().includes(search) ||
      lead.customer_name?.toLowerCase().includes(search) ||
      lead.customer_email?.toLowerCase().includes(search) ||
      lead.category?.toLowerCase().includes(search)
    );
  }, [leads, searchTerm]);

  // Get current page data
  const paginatedLeads = useMemo(() => {
    const startIndex = 0;
    const endIndex = (currentPage + 1) * pageSize;
    return filteredLeads.slice(startIndex, endIndex);
  }, [filteredLeads, currentPage, pageSize]);

  // Load next page
  const loadMore = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Simulate network delay for realistic loading behavior
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setIsLoading(false);
    }, 100);
  };

  // Check if there are more items to load
  const hasMore = paginatedLeads.length < filteredLeads.length;

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  // Reset pagination when leads array changes
  useEffect(() => {
    setCurrentPage(0);
  }, [leads.length]);

  return {
    paginatedLeads,
    isLoading,
    hasMore,
    loadMore,
    totalCount: filteredLeads.length,
    currentCount: paginatedLeads.length,
    currentPage,
    setCurrentPage,
  };
}