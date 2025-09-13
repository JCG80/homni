/**
 * Audit Logger - System activity tracking
 * Part of Homni platform development plan
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface AuditLogEntry {
  user_id?: string;
  company_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  metadata?: Record<string, any>;
}

export class AuditLogger {
  /**
   * Log a user action to the audit trail
   */
  static async logAction(entry: AuditLogEntry): Promise<void> {
    try {
      // Get current user session for context
      const { data: { session } } = await supabase.auth.getSession();
      
      // Prepare audit entry with additional context
      const auditEntry = {
        ...entry,
        user_id: entry.user_id || session?.user?.id,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        metadata: {
          ...entry.metadata,
          timestamp: new Date().toISOString(),
          session_id: session?.access_token ? 'authenticated' : 'anonymous'
        }
      };

      const { error } = await supabase
        .from('audit_log')
        .insert(auditEntry);

      if (error) {
        logger.error('Failed to log audit entry:', error);
      } else {
        logger.debug('Audit entry logged:', { 
          action: entry.action, 
          resource_type: entry.resource_type 
        });
      }
    } catch (error) {
      logger.error('Error logging audit entry:', error);
    }
  }

  /**
   * Log user login event
   */
  static async logLogin(userId: string, metadata?: Record<string, any>): Promise<void> {
    await this.logAction({
      user_id: userId,
      action: 'user_login',
      resource_type: 'authentication',
      resource_id: userId,
      metadata: {
        ...metadata,
        event_type: 'login'
      }
    });
  }

  /**
   * Log user logout event
   */
  static async logLogout(userId: string, metadata?: Record<string, any>): Promise<void> {
    await this.logAction({
      user_id: userId,
      action: 'user_logout',
      resource_type: 'authentication',
      resource_id: userId,
      metadata: {
        ...metadata,
        event_type: 'logout'
      }
    });
  }

  /**
   * Log data modification event
   */
  static async logDataChange(
    action: 'create' | 'update' | 'delete',
    resourceType: string,
    resourceId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAction({
      action: `${resourceType}_${action}`,
      resource_type: resourceType,
      resource_id: resourceId,
      old_values: oldValues,
      new_values: newValues,
      metadata
    });
  }

  /**
   * Log permission change event
   */
  static async logPermissionChange(
    targetUserId: string,
    action: 'grant' | 'revoke',
    permission: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAction({
      action: `permission_${action}`,
      resource_type: 'user_permissions',
      resource_id: targetUserId,
      new_values: { permission },
      metadata
    });
  }

  /**
   * Log system configuration change
   */
  static async logConfigChange(
    configType: string,
    configId: string,
    oldConfig?: Record<string, any>,
    newConfig?: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAction({
      action: 'config_update',
      resource_type: configType,
      resource_id: configId,
      old_values: oldConfig,
      new_values: newConfig,
      metadata
    });
  }

  /**
   * Log security event
   */
  static async logSecurityEvent(
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAction({
      action: 'security_event',
      resource_type: 'security',
      resource_id: eventType,
      metadata: {
        ...metadata,
        severity,
        description,
        event_type: eventType
      }
    });
  }

  /**
   * Get client IP address (best effort)
   */
  private static async getClientIP(): Promise<string | undefined> {
    try {
      // This is a simplified approach - in production you'd want more robust IP detection
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      // Fallback or ignore IP detection errors
      return undefined;
    }
  }

  /**
   * Query audit logs (admin only)
   */
  static async queryLogs(filters: {
    user_id?: string;
    action?: string;
    resource_type?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
  } = {}): Promise<any[]> {
    try {
      let query = supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.resource_type) {
        query = query.eq('resource_type', filters.resource_type);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to query audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error querying audit logs:', error);
      return [];
    }
  }
}