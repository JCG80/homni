import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userFiltersApi } from '../../api/filters';
import { supabase } from '@/lib/supabaseClient';

// Mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id' } },
        error: null
      }))
    }
  }
}));

const mockSupabaseChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(), 
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

describe('userFiltersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.from as any).mockReturnValue(mockSupabaseChain);
  });

  describe('getUserFilters', () => {
    it('should fetch user filters successfully', async () => {
      const mockFilters = [
        {
          id: '1',
          user_id: 'test-user-id',
          filter_name: 'My Filter',
          filter_data: { category: 'electrical' },
          is_default: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      mockSupabaseChain.single.mockResolvedValue({ data: mockFilters, error: null });

      const result = await userFiltersApi.getUserFilters();
      
      expect(supabase.from).toHaveBeenCalledWith('user_filters');
      expect(result).toEqual(mockFilters);
    });

    it('should handle fetch error', async () => {
      mockSupabaseChain.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Network error' } 
      });

      await expect(userFiltersApi.getUserFilters()).rejects.toThrow('Network error');
    });
  });

  describe('createUserFilter', () => {
    it('should create filter successfully', async () => {
      const mockFilter = {
        id: '1',
        user_id: 'test-user-id',
        filter_name: 'New Filter',
        filter_data: { status: 'new' },
        is_default: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      mockSupabaseChain.single.mockResolvedValue({ data: mockFilter, error: null });

      const filterRequest = {
        filter_name: 'New Filter',
        filter_data: { status: 'new' }
      };

      const result = await userFiltersApi.createUserFilter(filterRequest);

      expect(supabase.from).toHaveBeenCalledWith('user_filters');
      expect(mockSupabaseChain.insert).toHaveBeenCalled();
      expect(result).toEqual(mockFilter);
    });
  });

  describe('updateUserFilter', () => {
    it('should update filter successfully', async () => {
      const mockUpdatedFilter = {
        id: '1',
        user_id: 'test-user-id',
        filter_name: 'Updated Filter',
        filter_data: { status: 'contacted' },
        is_default: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-02'
      };

      mockSupabaseChain.single.mockResolvedValue({ data: mockUpdatedFilter, error: null });

      const updateRequest = {
        filter_name: 'Updated Filter',
        filter_data: { status: 'contacted' },
        is_default: true
      };

      const result = await userFiltersApi.updateUserFilter('1', updateRequest);

      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(mockUpdatedFilter);
    });
  });

  describe('deleteUserFilter', () => {
    it('should delete filter successfully', async () => {
      mockSupabaseChain.single.mockResolvedValue({ data: null, error: null });

      const result = await userFiltersApi.deleteUserFilter('1');

      expect(mockSupabaseChain.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toBe(true);
    });

    it('should handle delete error', async () => {
      mockSupabaseChain.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Delete failed' } 
      });

      await expect(userFiltersApi.deleteUserFilter('1')).rejects.toThrow('Delete failed');
    });
  });
});