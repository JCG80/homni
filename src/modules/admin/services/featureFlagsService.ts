import { supabase } from '@/integrations/supabase/client';

export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_roles: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const featureFlagsService = {
  async getAll(): Promise<FeatureFlag[]> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('name');

    if (error) throw error;
    return (data || []).map(flag => ({
      ...flag,
      metadata: (flag as any).metadata || {}
    }));
  },

  async create(flag: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>): Promise<FeatureFlag> {
    const { data, error } = await supabase
      .from('feature_flags')
      .insert({
        ...flag,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;

    // Log admin action
    await supabase.rpc('log_admin_action', {
      p_action: 'create_feature_flag',
      p_target_type: 'feature_flag',
      p_target_id: data.id,
      p_new_values: data
    });

    return {
      ...data,
      metadata: (data as any).metadata || {}
    };
  },

  async update(id: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag> {
    // Get old values for audit
    const { data: oldData } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('feature_flags')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log admin action
    await supabase.rpc('log_admin_action', {
      p_action: 'update_feature_flag',
      p_target_type: 'feature_flag',
      p_target_id: id,
      p_old_values: oldData,
      p_new_values: data
    });

    return {
      ...data,
      metadata: (data as any).metadata || {}
    };
  },

  async delete(id: string): Promise<void> {
    // Get data for audit
    const { data: flagData } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('feature_flags')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log admin action
    await supabase.rpc('log_admin_action', {
      p_action: 'delete_feature_flag',
      p_target_type: 'feature_flag',
      p_target_id: id,
      p_old_values: flagData
    });
  },

  async toggle(id: string, enabled: boolean): Promise<FeatureFlag> {
    return this.update(id, { is_enabled: enabled });
  },

  async checkFlag(flagName: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_feature_enabled', {
      flag_name: flagName
    });

    if (error) {
      console.error(`Error checking feature flag ${flagName}:`, error);
      return false;
    }

    return data === true;
  }
};