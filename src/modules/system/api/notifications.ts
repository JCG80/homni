import { supabase } from '@/lib/supabaseClient';
import { ApiError } from '@/utils/apiHelpers';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

/**
 * System Notifications API - Real-time lead notifications
 */

export interface NotificationData {
  id: string;
  user_id: string;
  type: 'lead_assigned' | 'lead_status_change' | 'response_received' | 'budget_alert' | 'system_alert';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expires_at?: string;
  created_at: string;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  lead_assignments: boolean;
  status_updates: boolean;
  budget_alerts: boolean;
  system_announcements: boolean;
  digest_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

/**
 * Send real-time notification to user
 */
export async function sendNotification(
  userId: string,
  notification: Omit<NotificationData, 'id' | 'user_id' | 'is_read' | 'created_at'>
): Promise<boolean> {
  try {
    logger.info('Sending notification', { 
      module: 'notificationsApi', 
      userId, 
      type: notification.type 
    });

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        priority: notification.priority,
        expires_at: notification.expires_at,
        is_read: false,
      });

    if (error) {
      throw new ApiError('sendNotification', error);
    }

    // Trigger real-time notification via channel
    const channel = supabase.channel(`user_${userId}`);
    channel.send({
      type: 'broadcast',
      event: 'notification',
      payload: notification,
    });

    return true;
  } catch (error) {
    logger.error('Failed to send notification', { module: 'notificationsApi' }, error);
    throw new ApiError('sendNotification', error);
  }
}

/**
 * Send lead assignment notification to company
 */
export async function notifyLeadAssignment(
  companyUserId: string,
  leadData: {
    leadId: string;
    leadTitle: string;
    category: string;
    cost: number;
    expiresAt?: string;
  }
): Promise<boolean> {
  try {
    logger.info('Sending lead assignment notification', { 
      module: 'notificationsApi', 
      companyUserId, 
      leadId: leadData.leadId 
    });

    return await sendNotification(companyUserId, {
      type: 'lead_assigned',
      title: 'Ny lead tildelt',
      message: `Du har fått en ny lead: "${leadData.leadTitle}" i kategorien ${leadData.category}`,
      data: {
        lead_id: leadData.leadId,
        cost: leadData.cost,
        expires_at: leadData.expiresAt,
      },
      priority: 'high',
      expires_at: leadData.expiresAt,
    });
  } catch (error) {
    logger.error('Failed to send lead assignment notification', { module: 'notificationsApi' }, error);
    throw new ApiError('notifyLeadAssignment', error);
  }
}

/**
 * Send status update notification to user
 */
export async function notifyStatusUpdate(
  userId: string,
  leadData: {
    leadId: string;
    leadTitle: string;
    oldStatus: string;
    newStatus: string;
    companyName?: string;
  }
): Promise<boolean> {
  try {
    logger.info('Sending status update notification', { 
      module: 'notificationsApi', 
      userId, 
      leadId: leadData.leadId 
    });

    return await sendNotification(userId, {
      type: 'lead_status_change',
      title: 'Lead status oppdatert',
      message: `Din lead "${leadData.leadTitle}" har endret status fra ${leadData.oldStatus} til ${leadData.newStatus}${leadData.companyName ? ` av ${leadData.companyName}` : ''}`,
      data: {
        lead_id: leadData.leadId,
        old_status: leadData.oldStatus,
        new_status: leadData.newStatus,
        company_name: leadData.companyName,
      },
      priority: 'medium',
    });
  } catch (error) {
    logger.error('Failed to send status update notification', { module: 'notificationsApi' }, error);
    throw new ApiError('notifyStatusUpdate', error);
  }
}

/**
 * Send budget alert to company
 */
export async function notifyBudgetAlert(
  companyUserId: string,
  alertData: {
    alertType: 'low_budget' | 'budget_exceeded';
    currentBudget: number;
    threshold: number;
    recommendedAction: string;
  }
): Promise<boolean> {
  try {
    logger.info('Sending budget alert notification', { 
      module: 'notificationsApi', 
      companyUserId, 
      alertType: alertData.alertType 
    });

    const title = alertData.alertType === 'low_budget' 
      ? 'Lavt budsjett' 
      : 'Budsjett overskredet';
    
    const message = alertData.alertType === 'low_budget'
      ? `Ditt budsjett er lavt (NOK ${alertData.currentBudget.toLocaleString()}). ${alertData.recommendedAction}`
      : `Ditt budsjett er overskredet. ${alertData.recommendedAction}`;

    return await sendNotification(companyUserId, {
      type: 'budget_alert',
      title,
      message,
      data: {
        alert_type: alertData.alertType,
        current_budget: alertData.currentBudget,
        threshold: alertData.threshold,
        recommended_action: alertData.recommendedAction,
      },
      priority: alertData.alertType === 'budget_exceeded' ? 'urgent' : 'high',
    });
  } catch (error) {
    logger.error('Failed to send budget alert notification', { module: 'notificationsApi' }, error);
    throw new ApiError('notifyBudgetAlert', error);
  }
}

/**
 * Fetch user notifications
 */
export async function fetchUserNotifications(
  userId: string,
  filters?: {
    unread_only?: boolean;
    types?: string[];
    limit?: number;
  }
): Promise<NotificationData[]> {
  try {
    logger.info('Fetching user notifications', { 
      module: 'notificationsApi', 
      userId, 
      filters 
    });

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters?.unread_only) {
      query = query.eq('is_read', false);
    }

    if (filters?.types?.length) {
      query = query.in('type', filters.types);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new ApiError('fetchUserNotifications', error);
    }

    return data || [];
  } catch (error) {
    logger.error('Failed to fetch user notifications', { module: 'notificationsApi' }, error);
    throw new ApiError('fetchUserNotifications', error);
  }
}

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(
  notificationIds: string[]
): Promise<boolean> {
  try {
    logger.info('Marking notifications as read', { 
      module: 'notificationsApi', 
      count: notificationIds.length 
    });

    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        updated_at: new Date().toISOString(),
      })
      .in('id', notificationIds);

    if (error) {
      throw new ApiError('markNotificationsAsRead', error);
    }

    return true;
  } catch (error) {
    logger.error('Failed to mark notifications as read', { module: 'notificationsApi' }, error);
    throw new ApiError('markNotificationsAsRead', error);
  }
}

/**
 * Update user notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<boolean> {
  try {
    logger.info('Updating notification preferences', { 
      module: 'notificationsApi', 
      userId 
    });

    const { error } = await supabase
      .from('user_profiles')
      .update({
        notification_preferences: supabase.sql`notification_preferences || ${JSON.stringify(preferences)}`,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      throw new ApiError('updateNotificationPreferences', error);
    }

    toast({
      title: "Varslingsinnstillinger oppdatert",
      description: "Dine varslingsinnstillinger er oppdatert",
    });

    return true;
  } catch (error) {
    logger.error('Failed to update notification preferences', { module: 'notificationsApi' }, error);
    toast({
      title: "Feil",
      description: "Kunne ikke oppdatere varslingsinnstillinger",
      variant: "destructive",
    });
    throw new ApiError('updateNotificationPreferences', error);
  }
}

/**
 * Subscribe to real-time notifications for user
 */
export function subscribeToUserNotifications(
  userId: string,
  callback: (notification: NotificationData) => void
) {
  try {
    logger.info('Subscribing to user notifications', { 
      module: 'notificationsApi', 
      userId 
    });

    const channel = supabase
      .channel(`user_notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          logger.info('New notification received', { 
            module: 'notificationsApi', 
            userId, 
            notificationId: payload.new.id 
          });
          callback(payload.new as NotificationData);
        }
      )
      .on(
        'broadcast',
        { event: 'notification' },
        (payload) => {
          logger.info('Broadcast notification received', { 
            module: 'notificationsApi', 
            userId 
          });
          callback(payload.payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    logger.error('Failed to subscribe to user notifications', { module: 'notificationsApi' }, error);
    throw new ApiError('subscribeToUserNotifications', error);
  }
}

/**
 * Send system-wide announcement
 */
export async function sendSystemAnnouncement(
  announcement: {
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    target_roles?: string[];
    expires_at?: string;
  }
): Promise<number> {
  try {
    logger.info('Sending system announcement', { 
      module: 'notificationsApi', 
      title: announcement.title 
    });

    const { data, error } = await supabase
      .rpc('send_system_announcement', {
        announcement_title: announcement.title,
        announcement_message: announcement.message,
        announcement_priority: announcement.priority,
        target_roles: announcement.target_roles || null,
        expires_at: announcement.expires_at || null,
      });

    if (error) {
      throw new ApiError('sendSystemAnnouncement', error);
    }

    return data || 0;
  } catch (error) {
    logger.error('Failed to send system announcement', { module: 'notificationsApi' }, error);
    throw new ApiError('sendSystemAnnouncement', error);
  }
}