/**
 * Auth service that leverages the new unified role system and database functions
 */
import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserProfile, UserRoleAssignment } from '@/modules/auth/types/unified-types';

export class AuthService {
  /**
   * Get user's roles from the user_roles table
   */
  static async getUserRoles(userId: string): Promise<UserRoleAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as UserRoleAssignment[];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }

  /**
   * Get user's primary role using the database function
   */
  static async getUserRole(userId?: string): Promise<UserRole> {
    try {
      const { data, error } = await supabase
        .rpc('get_auth_user_role');

      if (error) throw error;
      return (data as UserRole) || 'user';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'user';
    }
  }

  /**
   * Check if user has a specific role
   */
  static async hasRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('has_role', { 
          _user_id: userId, 
          _role: role 
        });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }

  /**
   * Check if user has minimum role level
   */
  static async hasRoleLevel(userId: string, minLevel: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('has_role_level', { 
          _user_id: userId, 
          _min_level: minLevel 
        });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking role level:', error);
      return false;
    }
  }

  /**
   * Get user's role level (0-100 scale)
   */
  static async getUserRoleLevel(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_role_level', { _user_id: userId });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error fetching user role level:', error);
      return 0;
    }
  }

  /**
   * Assign role to user
   */
  static async assignRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      return false;
    }
  }

  /**
   * Remove role from user
   */
  static async removeRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      return false;
    }
  }

  /**
   * Get user profile with enhanced data
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  /**
   * Check if feature is enabled for user
   */
  static async isFeatureEnabled(flagName: string, userId?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('is_feature_enabled', { 
          flag_name: flagName,
          user_id: userId || undefined
        });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking feature flag:', error);
      return false;
    }
  }

  /**
   * Get enabled modules for user
   */
  static async getUserEnabledModules(userId?: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_enabled_modules', { 
          user_id: userId || undefined
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user modules:', error);
      return [];
    }
  }

  /**
   * Check if user has module access
   */
  static async hasModuleAccess(moduleName: string, userId?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('has_module_access', { 
          module_name: moduleName,
          user_id: userId || undefined
        });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking module access:', error);
      return false;
    }
  }

  /**
   * Ensure user profile exists (using the database function)
   */
  static async ensureUserProfile(
    userId: string, 
    role?: UserRole, 
    companyId?: string
  ): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .rpc('ensure_user_profile', {
          p_user_id: userId,
          p_role: role,
          p_company_id: companyId
        });

      if (error) throw error;
      return data as UserProfile;
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      return null;
    }
  }
}