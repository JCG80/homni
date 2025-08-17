
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assignLeadToProvider } from '../../utils/leadAssignment';
import { supabase } from '@/integrations/supabase/client';
import { DistributionStrategy } from '../../strategies/strategyFactory';
import { makeLead } from '../factories';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => mockQueryBuilder),
    rpc: vi.fn(() => mockRPCBuilder)
  }
}));

// Mock query builders
const mockQueryBuilder = {
  select: vi.fn(() => mockQueryBuilder),
  eq: vi.fn(() => mockQueryBuilder),
  update: vi.fn(() => mockQueryBuilder),
  single: vi.fn(() => mockQueryBuilder)
};

const mockRPCBuilder = {
  select: vi.fn(() => mockRPCBuilder)
};

describe('Lead Assignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('assignLeadToProvider', () => {
    it('should successfully assign a lead to a provider', async () => {
      // Arrange
      const mockLead = makeLead({
        id: 'lead-123',
        status: 'new',
        category: 'plumbing',
        title: 'Test Lead'
      });

      const strategy = 'round_robin' as DistributionStrategy;
      const mockProviderResponse = {
        data: { provider_id: 'provider-123', company_id: 'company-123' },
        error: null
      };

      const mockUpdateResponse = {
        data: { ...mockLead, company_id: 'company-123', provider_id: 'provider-123', status: 'assigned' },
        error: null
      };

      (supabase.rpc as any).mockReturnValue({
        ...mockRPCBuilder,
        select: vi.fn().mockResolvedValue(mockProviderResponse)
      });

      (supabase.from as any).mockReturnValue({
        ...mockQueryBuilder,
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue(mockUpdateResponse)
          })
        })
      });

      // Act
      const result = await assignLeadToProvider(mockLead, strategy);

      // Assert
      expect(result).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('find_matching_provider', {
        lead_category: mockLead.category,
        distribution_strategy: strategy
      });
      expect(supabase.from).toHaveBeenCalledWith('leads');
    });

    it('should return false when no matching provider is found', async () => {
      // Arrange
      const mockLead = makeLead({
        id: 'lead-123',
        status: 'new',
        category: 'plumbing',
        title: 'Test Lead'
      });

      const strategy = 'round_robin' as DistributionStrategy;
      const mockProviderResponse = {
        data: null,
        error: null
      };

      (supabase.rpc as any).mockReturnValue({
        ...mockRPCBuilder,
        select: vi.fn().mockResolvedValue(mockProviderResponse)
      });

      // Act
      const result = await assignLeadToProvider(mockLead, strategy);

      // Assert
      expect(result).toBe(false);
      expect(supabase.rpc).toHaveBeenCalledWith('find_matching_provider', {
        lead_category: mockLead.category,
        distribution_strategy: strategy
      });
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should handle errors during provider matching', async () => {
      // Arrange
      const mockLead = makeLead({
        id: 'lead-123',
        status: 'new',
        category: 'plumbing',
        title: 'Test Lead'
      });

      const strategy = 'round_robin' as DistributionStrategy;
      const mockError = new Error('Database error');
      const mockProviderResponse = {
        data: null,
        error: mockError
      };

      (supabase.rpc as any).mockReturnValue({
        ...mockRPCBuilder,
        select: vi.fn().mockResolvedValue(mockProviderResponse)
      });

      // Act & Assert
      await expect(assignLeadToProvider(mockLead, strategy)).rejects.toThrow(mockError);
    });

    it('should handle errors during lead update', async () => {
      // Arrange
      const mockLead = makeLead({
        id: 'lead-123',
        status: 'new',
        category: 'plumbing',
        title: 'Test Lead'
      });

      const strategy = 'round_robin' as DistributionStrategy;
      const mockError = new Error('Update error');
      
      const mockProviderResponse = {
        data: { provider_id: 'provider-123', company_id: 'company-123' },
        error: null
      };

      const mockUpdateResponse = {
        data: null,
        error: mockError
      };

      (supabase.rpc as any).mockReturnValue({
        ...mockRPCBuilder,
        select: vi.fn().mockResolvedValue(mockProviderResponse)
      });

      (supabase.from as any).mockReturnValue({
        ...mockQueryBuilder,
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue(mockUpdateResponse)
          })
        })
      });

      // Act & Assert
      await expect(assignLeadToProvider(mockLead, strategy)).rejects.toThrow(mockError);
    });
  });
});
