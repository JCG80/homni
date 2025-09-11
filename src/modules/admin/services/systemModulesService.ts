import { supabase } from '@/integrations/supabase/client';

export interface SystemModule {
  id: string;
  name: string;
  description?: string;
  route?: string;
  icon?: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  dependencies: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserModuleAccess {
  id: string;
  user_id: string;
  module_id: string;
  is_enabled: boolean;
  settings: Record<string, any>;
  module: SystemModule;
}

export const systemModulesService = {
  async getAll(): Promise<SystemModule[]> {
    const { data, error } = await supabase
      .from('system_modules')
      .select('*')
      .order('category, sort_order, name');

    if (error) throw error;
    return (data || []).map(module => ({
      ...module,
      metadata: (module as any).metadata || {}
    }));
  },

  async getByCategory(): Promise<Record<string, SystemModule[]>> {
    const modules = await this.getAll();
    return modules.reduce((acc, module) => {
      if (!acc[module.category]) {
        acc[module.category] = [];
      }
      acc[module.category].push(module);
      return acc;
    }, {} as Record<string, SystemModule[]>);
  },

  async create(module: Omit<SystemModule, 'id' | 'created_at' | 'updated_at'>): Promise<SystemModule> {
    const { data, error } = await supabase
      .from('system_modules')
      .insert(module)
      .select()
      .single();

    if (error) throw error;

    // Log admin action
    await supabase.rpc('log_admin_action', {
      p_action: 'create_system_module',
      p_target_type: 'system_module',
      p_target_id: data.id,
      p_new_values: data
    });

    return {
      ...data,
      metadata: (data as any).metadata || {}
    };
  },

  async update(id: string, updates: Partial<SystemModule>): Promise<SystemModule> {
    // Get old values for audit
    const { data: oldData } = await supabase
      .from('system_modules')
      .select('*')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('system_modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log admin action
    await supabase.rpc('log_admin_action', {
      p_action: 'update_system_module',
      p_target_type: 'system_module',
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
    const { data: moduleData } = await supabase
      .from('system_modules')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('system_modules')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log admin action
    await supabase.rpc('log_admin_action', {
      p_action: 'delete_system_module',
      p_target_type: 'system_module',
      p_target_id: id,
      p_old_values: moduleData
    });
  },

  async toggleActive(id: string, active: boolean): Promise<SystemModule> {
    return this.update(id, { is_active: active });
  },

  async getUserModules(userId?: string): Promise<UserModuleAccess[]> {
    const { data, error } = await supabase
      .from('user_modules')
      .select(`
        *,
        module:system_modules(*)
      `)
      .eq(userId ? 'user_id' : 'user_id', userId || (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      settings: item.settings as Record<string, any> || {},
      module: {
        ...item.module,
        metadata: (item.module as any).metadata || {}
      }
    }));
  },

  async updateUserModuleAccess(userId: string, moduleId: string, enabled: boolean): Promise<void> {
    const { error } = await supabase
      .from('user_modules')
      .upsert({
        user_id: userId,
        module_id: moduleId,
        is_enabled: enabled
      });

    if (error) throw error;

    // Log admin action
    await supabase.rpc('log_admin_action', {
      p_action: enabled ? 'grant_module_access' : 'revoke_module_access',
      p_target_type: 'user_module_access',
      p_target_id: moduleId,
      p_new_values: { user_id: userId, module_id: moduleId, is_enabled: enabled }
    });
  },

  async bulkUpdateUserModuleAccess(userId: string, moduleIds: string[], enabled: boolean): Promise<void> {
    const { error } = await supabase.rpc('bulk_update_user_module_access', {
      target_user_id: userId,
      module_ids: moduleIds,
      enable_access: enabled,
      reason: `Bulk ${enabled ? 'grant' : 'revoke'} by admin`
    });

    if (error) throw error;
  }
};