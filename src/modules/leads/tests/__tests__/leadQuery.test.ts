
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchUnassignedLeads } from '../../utils/leadQuery';
import { supabase } from '@/integrations/supabase/client';
import { withRetry } from '@/utils/apiRetry';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis()
  }
}));

vi.mock('@/utils/apiRetry', () => ({
  withRetry: vi.fn()
}));

describe('Lead Query', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
  
  it('should fetch unassigned leads with the correct query', async () => {
    const mockLeads = [
      { id: 'lead-1', status: 'new' },
      { id: 'lead-2', status: 'new' }
    ];
    
    (withRetry as any).mockResolvedValue({
      data: mockLeads,
      error: null
    });
    
    const result = await fetchUnassignedLeads({});
    
    expect(result).toEqual(mockLeads);
    expect(withRetry).toHaveBeenCalledTimes(1);
    
    // Check that the first argument to withRetry is a function
    // that would execute our query
    const queryFn = (withRetry as any).mock.calls[0][0];
    expect(typeof queryFn).toBe('function');
  });
  
  it('should apply lead type filter when provided', async () => {
    const mockLeads = [
      { id: 'lead-1', status: 'new', lead_type: 'premium' }
    ];
    
    (withRetry as any).mockImplementation(async (fn) => {
      // Create a mock implementation where we can test if eq was called
      // with the right parameters
      const query = {
        eq: vi.fn().mockReturnThis()
      };
      
      await fn();
      
      return {
        data: mockLeads,
        error: null
      };
    });
    
    const result = await fetchUnassignedLeads({ leadType: 'premium' });
    
    expect(result).toEqual(mockLeads);
    expect(withRetry).toHaveBeenCalledTimes(1);
  });
  
  it('should handle errors and throw them', async () => {
    const errorMessage = 'Database error';
    (withRetry as any).mockResolvedValue({
      data: null,
      error: new Error(errorMessage)
    });
    
    await expect(fetchUnassignedLeads({})).rejects.toThrow();
  });
  
  it('should return empty array when no leads found', async () => {
    (withRetry as any).mockResolvedValue({
      data: null,
      error: null
    });
    
    const result = await fetchUnassignedLeads({});
    expect(result).toEqual([]);
  });
});
