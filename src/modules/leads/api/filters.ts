import { supabase } from '@/integrations/supabase/client';
import { UserLeadFilter, CreateUserFilterRequest, UpdateUserFilterRequest } from '../types/user-filters';

// Type helper for database results
interface DatabaseUserFilter {
  id: string;
  user_id: string;
  filter_name: string | null;
  filter_data: any; // JSON from database
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const userFiltersApi = {
  async getUserFilters(): Promise<UserLeadFilter[]> {
    const { data, error } = await supabase
      .from('user_filters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map((item: DatabaseUserFilter): UserLeadFilter => ({
      ...item,
      filter_data: item.filter_data as UserLeadFilter['filter_data']
    }));
  },

  async createUserFilter(filter: CreateUserFilterRequest): Promise<UserLeadFilter> {
    const { data, error } = await supabase
      .from('user_filters')
      .insert({
        filter_name: filter.filter_name,
        filter_data: filter.filter_data,
        is_default: filter.is_default || false,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      filter_data: data.filter_data as UserLeadFilter['filter_data']
    };
  },

  async updateUserFilter(id: string, filter: UpdateUserFilterRequest): Promise<UserLeadFilter> {
    const { data, error } = await supabase
      .from('user_filters')
      .update({
        filter_name: filter.filter_name,
        filter_data: filter.filter_data,
        is_default: filter.is_default,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      filter_data: data.filter_data as UserLeadFilter['filter_data']
    };
  },

  async deleteUserFilter(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_filters')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  },

  async setDefaultFilter(id: string): Promise<boolean> {
    // First, clear all default flags for this user
    await supabase
      .from('user_filters')
      .update({ is_default: false })
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    // Then set this filter as default
    const { error } = await supabase
      .from('user_filters')
      .update({ is_default: true })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  }
};