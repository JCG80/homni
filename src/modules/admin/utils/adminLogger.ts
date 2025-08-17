
import { supabase } from '@/lib/supabaseClient';
import { UserRole } from '@/modules/auth/utils/roles/types';

export type AdminAction = 
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'access_grant'
  | 'access_revoke'
  | 'login'
  | 'logout';

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
  adminId: string, 
  action: AdminAction, 
  resourceType: ResourceType,
  resourceId?: string,
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    // Use type assertion to handle the admin_logs table that isn't in TypeScript definitions yet
    const { error } = await supabase
      .from('admin_logs' as any)
      .insert({
        admin_id: adminId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        ip_address: window.location.hostname // Basic client IP tracking
      } as any);
    
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
