
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/modules/auth/utils/roles/types';

export type AdminAction = 
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'access_grant'
  | 'access_revoke'
  | 'login'
  | 'logout'
  | 'module_access_update';

export type ResourceType = 
  | 'user'
  | 'company'
  | 'module'
  | 'lead'
  | 'system';

/**
 * Logs administrative actions for audit purposes
 */
export const logAdminAction = async (
  action: AdminAction, 
  resourceType: ResourceType,
  resourceId?: string,
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('log_admin_action', {
      target_kind_param: resourceType,
      target_id_param: resourceId,
      action_param: action,
      metadata_param: details
    });
    
    if (error) {
      console.error('Failed to log admin action:', error);
    }
  } catch (err) {
    console.error('Error logging admin action:', err);
  }
};

/**
 * Fetches admin logs for a specific admin or all logs if admin is a master admin
 */
export const getAdminLogs = async (
  adminId: string, 
  isAdmin: boolean, 
  limit = 50, 
  offset = 0
) => {
  try {
    // Use type assertion for the admin_logs table
    let query = supabase
      .from('admin_logs' as any)
      .select('*');
    
    // If not a master admin, only show their own logs
    if (!isAdmin) {
      query = query.eq('admin_id', adminId);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    return [];
  }
};
