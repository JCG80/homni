import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLeadFilters } from '../../hooks/useLeadFilters';
import { Lead } from '@/types/leads-canonical';

// Mock lead data for testing
const mockLeads: Lead[] = [
  {
    id: '1',
    title: 'Electrical Work Oslo',
    description: 'Need electrical installation',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    customer_phone: '12345678',
    status: 'new',
    category: 'electrical',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    company_id: 'company1',
    metadata: {
      postcode: '0101',
      location: 'Oslo',
      estimated_value: 50000
    }
  },
  {
    id: '2', 
    title: 'Plumbing Bergen',
    description: 'Bathroom renovation',
    customer_name: 'Jane Smith',
    customer_email: 'jane@example.com',
    customer_phone: '87654321',
    status: 'contacted',
    category: 'plumbing',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    company_id: 'company2',
    metadata: {
      postcode: '5001',
      location: 'Bergen',
      estimated_value: 75000
    }
  },
  {
    id: '3',
    title: 'Painting Work',
    description: 'House exterior painting',
    customer_name: 'Bob Wilson',
    customer_email: 'bob@example.com', 
    customer_phone: '11223344',
    status: 'qualified',
    category: 'painting',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
    metadata: {
      postcode: '7001',
      location: 'Trondheim',
      estimated_value: 30000
    }
  }
];

describe('useLeadFilters', () => {
  it('should filter leads by search term', () => {
    const { result } = renderHook(() => useLeadFilters(mockLeads));
    
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        search: 'Oslo'
      });
    });
    
    expect(result.current.filteredLeads).toHaveLength(1);
    expect(result.current.filteredLeads[0].title).toBe('Electrical Work Oslo');
  });

  it('should filter leads by status', () => {
    const { result } = renderHook(() => useLeadFilters(mockLeads));
    
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        status: 'contacted'
      });
    });
    
    expect(result.current.filteredLeads).toHaveLength(1);
    expect(result.current.filteredLeads[0].status).toBe('contacted');
  });

  it('should filter leads by category', () => {
    const { result } = renderHook(() => useLeadFilters(mockLeads));
    
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        category: 'electrical'
      });
    });
    
    expect(result.current.filteredLeads).toHaveLength(1);
    expect(result.current.filteredLeads[0].category).toBe('electrical');
  });

  it('should filter leads by date range', () => {
    const { result } = renderHook(() => useLeadFilters(mockLeads));
    
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        dateRange: '30days'
      });
    });
    
    // Should filter out leads older than 30 days
    expect(result.current.filteredLeads.length).toBeLessThan(mockLeads.length);
  });

  it('should apply multiple filters simultaneously', () => {
    const { result } = renderHook(() => useLeadFilters(mockLeads));
    
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        search: 'electrical',
        status: 'new',
        category: 'electrical'
      });
    });
    
    expect(result.current.filteredLeads).toHaveLength(1);
    expect(result.current.filteredLeads[0].id).toBe('1');
  });

  it('should reset filters correctly', () => {
    const { result } = renderHook(() => useLeadFilters(mockLeads));
    
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        search: 'test',
        status: 'contacted'
      });
    });
    
    act(() => {
      result.current.resetFilters();
    });
    
    expect(result.current.filters.search).toBe('');
    expect(result.current.filters.status).toBe('all');
    expect(result.current.filteredLeads).toHaveLength(mockLeads.length);
  });

  it('should return correct counts', () => {
    const { result } = renderHook(() => useLeadFilters(mockLeads));
    
    expect(result.current.totalCount).toBe(3);
    expect(result.current.filteredCount).toBe(3);
    
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        category: 'electrical'
      });
    });
    
    expect(result.current.totalCount).toBe(3);
    expect(result.current.filteredCount).toBe(1);
  });
});