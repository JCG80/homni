import { describe, it, expect, vi, beforeEach } from 'vitest';
import { linkAnonymousLeadsAndCreateProfile, checkUnlinkedLeads } from '../profileLinking';
import { supabase } from '@/integrations/supabase/client';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        count: vi.fn(() => ({
          eq: vi.fn(() => ({
            is: vi.fn(() => Promise.resolve({ count: 0, error: null }))
          }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  }
}));

vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}));

describe('profileLinking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('linkAnonymousLeadsAndCreateProfile', () => {
    const mockUserId = 'user-123';
    const mockProfileData = {
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '12345678',
      role: 'user' as const,
      metadata: { source: 'onboarding' }
    };

    it('successfully links anonymous leads and creates profile', async () => {
      const mockLinkedLeads = [
        { id: 'lead-1', title: 'Test Lead 1', created_at: '2024-01-01' },
        { id: 'lead-2', title: 'Test Lead 2', created_at: '2024-01-02' }
      ];

      // Mock the chain of supabase calls
      const mockUpdate = vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ data: mockLinkedLeads, error: null }))
          }))
        }))
      }));

      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }));

      const mockInsert = vi.fn(() => Promise.resolve({ data: null, error: null }));

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'leads') {
          return { update: mockUpdate } as any;
        } else if (table === 'user_profiles') {
          return { 
            select: mockSelect,
            insert: mockInsert
          } as any;
        }
        return {} as any;
      });

      const result = await linkAnonymousLeadsAndCreateProfile(mockUserId, mockProfileData);

      expect(result).toEqual({
        linkedLeadsCount: 2,
        linkedLeads: mockLinkedLeads,
        profileCreated: true,
        profileUpdated: false
      });

      expect(mockUpdate).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalled();
    });

    it('updates existing profile instead of creating new one', async () => {
      const existingProfile = {
        id: mockUserId,
        full_name: 'Existing User',
        metadata: { existing: 'data' }
      };

      const mockUpdate = vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }));

      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: existingProfile, error: null }))
        }))
      }));

      const mockProfileUpdate = vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }));

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'leads') {
          return { update: mockUpdate } as any;
        } else if (table === 'user_profiles') {
          return { 
            select: mockSelect,
            update: mockProfileUpdate
          } as any;
        }
        return {} as any;
      });

      const result = await linkAnonymousLeadsAndCreateProfile(mockUserId, mockProfileData);

      expect(result.profileCreated).toBe(false);
      expect(result.profileUpdated).toBe(true);
      expect(mockProfileUpdate).toHaveBeenCalled();
    });

    it('creates company profile for company users', async () => {
      const companyProfileData = {
        ...mockProfileData,
        role: 'company' as const,
        metadata: { companyName: 'Test Company AS' }
      };

      const mockUpdate = vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }));

      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }));

      const mockInsert = vi.fn(() => Promise.resolve({ data: null, error: null }));

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'leads') {
          return { update: mockUpdate } as any;
        } else if (table === 'user_profiles' || table === 'company_profiles') {
          return { 
            select: mockSelect,
            insert: mockInsert
          } as any;
        }
        return {} as any;
      });

      await linkAnonymousLeadsAndCreateProfile(mockUserId, companyProfileData);

      expect(mockInsert).toHaveBeenCalledTimes(2); // user_profiles + company_profiles
    });

    it('handles errors gracefully', async () => {
      const mockUpdate = vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' } }))
          }))
        }))
      }));

      vi.mocked(supabase.from).mockImplementation(() => ({
        update: mockUpdate
      }) as any);

      await expect(
        linkAnonymousLeadsAndCreateProfile(mockUserId, mockProfileData)
      ).rejects.toThrow();
    });
  });

  describe('checkUnlinkedLeads', () => {
    it('returns count of unlinked leads', async () => {
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => Promise.resolve({ count: 3, error: null }))
        }))
      }));

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: mockSelect
      }) as any);

      const count = await checkUnlinkedLeads('test@example.com');

      expect(count).toBe(3);
      expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact', head: true });
    });

    it('returns 0 on error', async () => {
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => Promise.resolve({ count: null, error: { message: 'Error' } }))
        }))
      }));

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: mockSelect
      }) as any);

      const count = await checkUnlinkedLeads('test@example.com');

      expect(count).toBe(0);
    });
  });
});