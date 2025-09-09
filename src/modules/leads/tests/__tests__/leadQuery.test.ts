
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchUnassignedLeads } from '../../utils/leadQuery';
import { supabase } from '@/integrations/supabase/client';
import { withRetry } from '@/utils/apiRetry';
import { Lead } from '@/types/leads-canonical';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => mockQueryBuilder)
  }
}));

vi.mock('@/utils/apiRetry', () => ({
  withRetry: vi.fn()
}));

// Create a comprehensive mock query builder
const mockQueryBuilder = {
  select: vi.fn(() => mockQueryBuilder),
  eq: vi.fn(() => mockQueryBuilder),
  is: vi.fn(() => mockQueryBuilder)
};

describe('Lead Query', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
  
  describe('fetchUnassignedLeads', () => {
    it('should fetch unassigned leads with the correct query', async () => {
      // Arrange
      const mockLeads = [
        { id: 'lead-1', status: 'new' },
        { id: 'lead-2', status: 'new' }
      ] as Lead[];
      
      (withRetry as any).mockResolvedValue({
        data: mockLeads,
        error: null
      });
      
      // Act
      const result = await fetchUnassignedLeads({});
      
      // Assert
      expect(result).toEqual(mockLeads);
      expect(supabase.from).toHaveBeenCalledWith('leads');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('status', 'new');
      expect(mockQueryBuilder.is).toHaveBeenCalledWith('company_id', null);
      expect(withRetry).toHaveBeenCalledTimes(1);
    });
    
    it('should apply lead type filter when provided', async () => {
      // Arrange
      const mockLeads = [
        { id: 'lead-1', status: 'new', lead_type: 'premium' }
      ] as Lead[];
      
      (withRetry as any).mockResolvedValue({
        data: mockLeads,
        error: null
      });
      
      // Act
      const result = await fetchUnassignedLeads({ leadType: 'premium' });
      
      // Assert
      expect(result).toEqual(mockLeads);
      expect(supabase.from).toHaveBeenCalledWith('leads');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('status', 'new');
      expect(mockQueryBuilder.is).toHaveBeenCalledWith('company_id', null);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('lead_type', 'premium');
    });
    
    it('should handle errors and throw them', async () => {
      // Arrange
      const errorMessage = 'Database error';
      (withRetry as any).mockResolvedValue({
        data: null,
        error: new Error(errorMessage)
      });
      
      // Act & Assert
      await expect(fetchUnassignedLeads({})).rejects.toThrow(errorMessage);
    });
    
    it('should return empty array when no leads found', async () => {
      // Arrange
      (withRetry as any).mockResolvedValue({
        data: null,
        error: null
      });
      
      // Act
      const result = await fetchUnassignedLeads({});
      
      // Assert
      expect(result).toEqual([]);
    });
    
    it('should configure retry options correctly', async () => {
      // Arrange
      (withRetry as any).mockResolvedValue({
        data: [],
        error: null
      });
      
      // Act
      await fetchUnassignedLeads({});
      
      // Assert
      const retryOptions = (withRetry as any).mock.calls[0][1];
      expect(retryOptions).toEqual({
        maxAttempts: 3,
        delayMs: 800,
        backoffFactor: 1.5,
        onRetry: expect.any(Function)
      });
    });
  });
});
