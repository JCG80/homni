import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/modules/auth/normalizeRole';

/**
 * Enhanced role management service using new database functions
 */
export class RoleManagementService {
  
  /**
   * Check if user has specific role
   */
  static async hasRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: role
      });
      
      if (error) {
        console.error('Error checking role:', error);
        return false;
      }
      
      return data || false;
    } catch (error) {
      console.error('Error in hasRole:', error);
      return false;
    }
  }

  /**
   * Get user's role level (0-100)
   */
  static async getUserRoleLevel(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_user_role_level', {
        _user_id: userId
      });
      
      if (error) {
        console.error('Error getting role level:', error);
        return 0;
      }
      
      return data || 0;
    } catch (error) {
      console.error('Error in getUserRoleLevel:', error);
      return 0;
    }
  }

  /**
   * Check if user meets minimum role level
   */
  static async hasRoleLevel(userId: string, minLevel: number): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('has_role_level', {
        _user_id: userId,
        _min_level: minLevel
      });
      
      if (error) {
        console.error('Error checking role level:', error);
        return false;
      }
      
      return data || false;
    } catch (error) {
      console.error('Error in hasRoleLevel:', error);
      return false;
    }
  }

  /**
   * Grant role to user (admin only)
   */
  static async grantRole(userId: string, role: UserRole, expiresAt?: Date): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('grant_user_role', {
        _user_id: userId,
        _role: role,
        _expires_at: expiresAt?.toISOString() || null
      });
      
      if (error) {
        console.error('Error granting role:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in grantRole:', error);
      return false;
    }
  }

  /**
   * Revoke role from user (admin only)
   */
  static async revokeRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('revoke_user_role', {
        _user_id: userId,
        _role: role
      });
      
      if (error) {
        console.error('Error revoking role:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in revokeRole:', error);
      return false;
    }
  }

  /**
   * Get all user roles from user_roles table
   */
  static async getUserRoles(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .is('revoked_at', null)
        .or('expires_at.is.null,expires_at.gt.now()');
      
      if (error) {
        console.error('Error getting user roles:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getUserRoles:', error);
      return [];
    }
  }

  /**
   * Run cleanup of expired roles manually
   */
  static async cleanupExpiredRoles(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_roles');
      
      if (error) {
        console.error('Error cleaning up expired roles:', error);
        return 0;
      }
      
      return data || 0;
    } catch (error) {
      console.error('Error in cleanupExpiredRoles:', error);
      return 0;
    }
  }

  /**
   * Role level constants
   */
  static readonly ROLE_LEVELS = {
    guest: 0,
    user: 20,
    company: 40,
    content_editor: 60,
    admin: 80,
    master_admin: 100
  } as const;

  /**
   * Check if user is admin (level 80+)
   */
  static async isAdmin(userId: string): Promise<boolean> {
    return this.hasRoleLevel(userId, this.ROLE_LEVELS.admin);
  }

  /**
   * Check if user is master admin (level 100)
   */
  static async isMasterAdmin(userId: string): Promise<boolean> {
    return this.hasRole(userId, 'master_admin');
  }
}