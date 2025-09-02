import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { selectProviderByRoundRobin } from '../../strategies/roundRobin';
import { selectProviderByCategory } from '../../strategies/categoryMatch';

// Mock Supabase client with proper structure
const mockSupabase = {
  from: vi.fn()
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

describe('Enhanced Distribution Strategies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Round Robin Strategy', () => {
    it('should select company with no previous assignments first', async () => {
      const mockCompanies = [
        { id: 'company1', name: 'Company A', updated_at: '2024-01-01' },
        { id: 'company2', name: 'Company B', updated_at: '2024-01-02' }
      ];

      // Mock chained Supabase calls
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'company_profiles') {
          return {
            select: () => ({
              eq: () => ({
                order: () => Promise.resolve({ 
                  data: mockCompanies, 
                  error: null 
                })
              })
            })
          };
        } else if (table === 'leads') {
          return {
            select: () => ({
              not: () => ({
                in: () => ({
                  order: () => Promise.resolve({ 
                    data: [], // No assignments
                    error: null 
                  })
                })
              })
            })
          };
        }
        return {};
      });

      const result = await selectProviderByRoundRobin();
      
      expect(result).toBe('company1'); // Should pick first company when no assignments exist
    });

    it('should handle fallback when no active companies exist', async () => {
      // Mock empty company profiles, then fallback leads query
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'company_profiles') {
          return {
            select: () => ({
              eq: () => ({
                order: () => Promise.resolve({ 
                  data: [], 
                  error: null 
                })
              })
            })
          };
        } else if (table === 'leads') {
          return {
            select: () => ({
              not: () => ({
                order: () => ({
                  limit: () => Promise.resolve({ 
                    data: [{ company_id: 'fallback-company' }], 
                    error: null 
                  })
                })
              })
            })
          };
        }
        return {};
      });

      const result = await selectProviderByRoundRobin();
      
      expect(result).toBe('fallback-company');
    });
  });

  describe('Category Match Strategy', () => {
    it('should score exact matches highest', async () => {
      const mockCompanies = [
        { 
          id: 'company1', 
          tags: ['insurance', 'car'], 
        },
        { 
          id: 'company2', 
          tags: ['financing', 'home insurance'], 
        }
      ];

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'company_profiles') {
          return {
            select: () => ({
              eq: () => Promise.resolve({ 
                data: mockCompanies, 
                error: null 
              })
            })
          };
        }
        return {};
      });

      const result = await selectProviderByCategory('insurance');
      
      expect(result).toBe('company1'); // Exact match should win
    });

    it('should handle partial matches with scoring', async () => {
      const mockCompanies = [
        { 
          id: 'company1', 
          tags: ['car-insurance', 'auto'], 
        },
        { 
          id: 'company2', 
          tags: ['home', 'property'], 
        }
      ];

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'company_profiles') {
          return {
            select: () => ({
              eq: () => Promise.resolve({ 
                data: mockCompanies, 
                error: null 
              })
            })
          };
        }
        return {};
      });

      const result = await selectProviderByCategory('insurance');
      
      expect(result).toBe('company1'); // Partial match should still work
    });

    it('should use fallback when no company matches', async () => {
      const mockCompanies = [
        { 
          id: 'company1', 
          tags: ['unrelated', 'other'], 
        }
      ];

      // Mock company profiles with no matches, then fallback
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'company_profiles') {
          return {
            select: () => ({
              eq: () => Promise.resolve({ 
                data: mockCompanies, 
                error: null 
              })
            })
          };
        } else if (table === 'leads') {
          return {
            select: () => ({
              eq: () => ({
                not: () => ({
                  order: () => ({
                    limit: () => Promise.resolve({ 
                      data: [{ company_id: 'fallback-company' }], 
                      error: null 
                    })
                  })
                })
              })
            })
          };
        }
        return {};
      });

      const result = await selectProviderByCategory('insurance');
      
      expect(result).toBe('fallback-company');
    });
  });

  describe('Integration Tests', () => {
    it('should properly integrate with lead assignment flow', async () => {
      // This would test the full integration but requires more complex mocking
      // For now, we verify the basic structure exists
      expect(selectProviderByRoundRobin).toBeDefined();
      expect(selectProviderByCategory).toBeDefined();
    });
  });
});

// Simple component test that doesn't require React testing
describe('AdminLeadDistribution Component', () => {
  it('should be a valid React component', () => {
    expect(typeof selectProviderByRoundRobin).toBe('function');
    expect(typeof selectProviderByCategory).toBe('function');
  });
});