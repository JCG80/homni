/**
 * Tests for lead query validation and security
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeadQuerySchema, validateLeadQueryOptions, fetchLeadsValidated } from '../api/lead-query';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          eq: vi.fn(() => ({
            not: vi.fn(),
            is: vi.fn(),
            in: vi.fn(),
            gte: vi.fn(),
            lte: vi.fn(),
            or: vi.fn(),
          })),
          not: vi.fn(() => ({
            is: vi.fn(),
          })),
          is: vi.fn(),
          in: vi.fn(),
          gte: vi.fn(),
          lte: vi.fn(),
          or: vi.fn(),
        })),
      })),
    })),
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

vi.mock('@/utils/apiHelpers', () => ({
  dedupeByKey: vi.fn((items) => items),
}));

import { supabase } from '@/integrations/supabase/client';

describe('LeadQuerySchema', () => {
  it('should validate valid query options', () => {
    const validOptions = {
      status: ['new', 'in_progress'],
      categories: ['residential', 'commercial'],
      zipCodes: ['0180', '1234'],
      searchTerm: 'test search',
      assigned: 'all' as const,
    };

    expect(() => LeadQuerySchema.parse(validOptions)).not.toThrow();
  });

  it('should reject invalid zip codes', () => {
    const invalidOptions = {
      zipCodes: ['12', '1234567890'], // Too short and too long
    };

    expect(() => LeadQuerySchema.parse(invalidOptions)).toThrow();
  });

  it('should reject malicious search terms', () => {
    const maliciousOptions = {
      searchTerm: '<script>alert("xss")</script>',
    };

    expect(() => LeadQuerySchema.parse(maliciousOptions)).toThrow();
  });

  it('should reject too long search terms', () => {
    const longSearchTerm = 'a'.repeat(65);
    const invalidOptions = {
      searchTerm: longSearchTerm,
    };

    expect(() => LeadQuerySchema.parse(invalidOptions)).toThrow();
  });

  it('should accept Nordic characters in search terms', () => {
    const validOptions = {
      searchTerm: 'æøå ÆØÅ test',
    };

    expect(() => LeadQuerySchema.parse(validOptions)).not.toThrow();
  });

  it('should limit zip code array size', () => {
    const tooManyZips = Array.from({ length: 51 }, (_, i) => `${1000 + i}`);
    const invalidOptions = {
      zipCodes: tooManyZips,
    };

    expect(() => LeadQuerySchema.parse(invalidOptions)).toThrow();
  });

  it('should validate date range format', () => {
    const validOptions = {
      dateRange: {
        start: '2024-01-01T00:00:00Z',
        end: '2024-12-31T23:59:59Z',
      },
    };

    expect(() => LeadQuerySchema.parse(validOptions)).not.toThrow();
  });

  it('should reject invalid date formats', () => {
    const invalidOptions = {
      dateRange: {
        start: '2024-01-01', // Missing time
        end: 'invalid-date',
      },
    };

    expect(() => LeadQuerySchema.parse(invalidOptions)).toThrow();
  });
});

describe('validateLeadQueryOptions', () => {
  it('should return validated options for valid input', () => {
    const input = {
      status: ['new'],
      searchTerm: 'test',
    };

    const result = validateLeadQueryOptions(input);
    expect(result).toEqual(input);
  });

  it('should throw for invalid input', () => {
    const invalidInput = {
      zipCodes: ['invalid'],
    };

    expect(() => validateLeadQueryOptions(invalidInput)).toThrow();
  });
});

describe('fetchLeadsValidated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock auth context resolution
    (supabase.rpc as any).mockImplementation((rpcName: string) => {
      if (rpcName === 'get_auth_user_role') {
        return Promise.resolve({ data: 'user' });
      }
      if (rpcName === 'get_current_user_company_id') {
        return Promise.resolve({ data: null });
      }
      return Promise.resolve({ data: null });
    });

    (supabase.auth.getUser as any).mockResolvedValue({
      user: { id: 'test-user-id' },
    });

    // Mock query chain
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
    };

    (supabase.from as any).mockReturnValue(mockQuery);
    
    // Mock the final query result
    Object.assign(mockQuery, {
      then: vi.fn().mockResolvedValue({
        data: [{ id: 'lead-1', title: 'Test Lead' }],
        error: null,
      }),
    });
  });

  it('should fetch leads with valid options', async () => {
    const options = {
      status: ['new'],
      searchTerm: 'test',
    };

    const result = await fetchLeadsValidated(options);
    
    expect(supabase.from).toHaveBeenCalledWith('leads');
    expect(result).toEqual([{ id: 'lead-1', title: 'Test Lead' }]);
  });

  it('should apply role-based scoping for company users', async () => {
    // Mock company user context
    (supabase.rpc as any).mockImplementation((rpcName: string) => {
      if (rpcName === 'get_auth_user_role') {
        return Promise.resolve({ data: 'company' });
      }
      if (rpcName === 'get_current_user_company_id') {
        return Promise.resolve({ data: 'company-123' });
      }
      return Promise.resolve({ data: null });
    });

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };

    (supabase.from as any).mockReturnValue(mockQuery);

    await fetchLeadsValidated({});

    expect(mockQuery.eq).toHaveBeenCalledWith('company_id', 'company-123');
  });

  it('should apply role-based scoping for regular users', async () => {
    // Mock user context
    (supabase.rpc as any).mockImplementation((rpcName: string) => {
      if (rpcName === 'get_auth_user_role') {
        return Promise.resolve({ data: 'user' });
      }
      return Promise.resolve({ data: null });
    });

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };

    (supabase.from as any).mockReturnValue(mockQuery);

    await fetchLeadsValidated({});

    expect(mockQuery.eq).toHaveBeenCalledWith('submitted_by', 'test-user-id');
  });

  it('should reject invalid query options', async () => {
    const invalidOptions = {
      zipCodes: ['invalid-zip'],
    };

    await expect(fetchLeadsValidated(invalidOptions)).rejects.toThrow();
  });

  it('should handle database errors', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      }),
    };

    (supabase.from as any).mockReturnValue(mockQuery);

    await expect(fetchLeadsValidated({})).rejects.toThrow('Database error');
  });
});