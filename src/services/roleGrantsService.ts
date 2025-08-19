import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/modules/auth/utils/roles/types';

export interface RoleGrant {
  id: string;
  user_id: string;
  granted_role: UserRole;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  context: Record<string, any>;
  is_active: boolean;
}

/**
 * Service for managing role grants system
 * Note: This is a stub implementation until DB types are regenerated
 */
export class RoleGrantsService {
  /**
   * Get all role grants for a user
   */
  static async getUserRoleGrants(userId: string): Promise<RoleGrant[]> {
    try {
      // For now, return empty array until database is set up
      // This will be implemented when the role_grants table is created
      console.log('getUserRoleGrants called for:', userId);
      return [];
    } catch (error) {
      console.error('Failed to fetch user role grants:', error);
      return [];
    }
  }

  /**
   * Grant a role to a user
   */
  static async grantRole(
    userId: string,
    role: UserRole,
    context?: Record<string, any>,
    expiresAt?: string
  ): Promise<void> {
    try {
      // For now, just log the action until database is set up
      console.info(`Role granted: ${role} to user ${userId}${context ? ` in context ${JSON.stringify(context)}` : ''}`);
    } catch (error) {
      console.error('Failed to grant role:', error);
      throw error;
    }
  }

  /**
   * Revoke a role from a user
   */
  static async revokeRole(
    userId: string, 
    role: UserRole, 
    context?: Record<string, any>
  ): Promise<void> {
    try {
      // For now, just log the action until database is set up
      console.info(`Role revoked: ${role} from user ${userId}${context ? ` in context ${JSON.stringify(context)}` : ''}`);
    } catch (error) {
      console.error('Failed to revoke role:', error);
      throw error;
    }
  }

  /**
   * Check if user has a specific role grant
   */
  static async hasRoleGrant(
    userId: string, 
    role: UserRole, 
    context?: Record<string, any>
  ): Promise<boolean> {
    try {
      // For now, return false until database is set up
      return false;
    } catch (error) {
      console.error('Failed to check role grant:', error);
      return false;
    }
  }

  /**
   * Check if user is master admin
   */
  static async isMasterAdmin(userId: string): Promise<boolean> {
    try {
      // Check both base role and granted roles
      const effectiveRoles = await this.getUserEffectiveRoles(userId);
      return effectiveRoles.includes('master_admin');
    } catch (error) {
      console.error('Failed to check master admin status:', error);
      return false;
    }
  }

  /**
   * Get user's effective roles (base role + granted roles)
   */
  static async getUserEffectiveRoles(userId: string): Promise<UserRole[]> {
    try {
      // For now, return empty array until database is set up
      return [];
    } catch (error) {
      console.error('Failed to fetch effective roles:', error);
      return [];
    }
  }

  /**
   * Helper method to check if contexts match
   */
  private static contextMatches(grantContext: Record<string, any>, checkContext: Record<string, any>): boolean {
    if (!checkContext || Object.keys(checkContext).length === 0) return true;
    
    return Object.entries(checkContext).every(([key, value]) => 
      grantContext[key] === value
    );
  }
}