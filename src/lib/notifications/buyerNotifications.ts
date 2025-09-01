/**
 * Buyer Notification System
 * Handles real-time notifications to buyers when new leads are available
 */

import { logger } from '@/utils/logger';

export interface NotificationChannel {
  id: string;
  type: 'email' | 'sms' | 'push' | 'webhook';
  active: boolean;
  settings: Record<string, any>;
}

export interface BuyerNotificationPreferences {
  buyerId: string;
  channels: NotificationChannel[];
  frequency: 'immediate' | 'hourly' | 'daily';
  categories: string[];
  geographicFilters: string[];
  quietHours?: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
}

export interface LeadNotification {
  leadId: string;
  category: string;
  location: string;
  score: number;
  urgency: 'low' | 'medium' | 'high';
  estimatedValue?: number;
  metadata: Record<string, any>;
}

class BuyerNotificationService {
  private notificationQueue: Map<string, LeadNotification[]> = new Map();
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startProcessingQueue();
  }

  /**
   * Send notification to a specific buyer about a new lead
   */
  async notifyBuyer(
    buyerId: string, 
    notification: LeadNotification,
    preferences?: BuyerNotificationPreferences
  ): Promise<void> {
    try {
      logger.debug('Notifying buyer about new lead', { buyerId, leadId: notification.leadId });

      // Get buyer preferences (mock for now)
      const buyerPrefs = preferences || this.getMockPreferences(buyerId);
      
      // Check if notification should be sent based on preferences
      if (!this.shouldNotify(notification, buyerPrefs)) {
        logger.debug('Notification filtered out by preferences', { buyerId, leadId: notification.leadId });
        return;
      }

      // Queue notification for processing
      if (!this.notificationQueue.has(buyerId)) {
        this.notificationQueue.set(buyerId, []);
      }
      
      this.notificationQueue.get(buyerId)!.push(notification);
      
      // For immediate notifications, process right away
      if (buyerPrefs.frequency === 'immediate') {
        await this.processNotificationsForBuyer(buyerId);
      }

    } catch (error) {
      logger.error('Failed to notify buyer', { buyerId, leadId: notification.leadId, error });
    }
  }

  /**
   * Notify multiple buyers about a lead
   */
  async notifyBuyers(
    buyerIds: string[],
    notification: LeadNotification
  ): Promise<void> {
    const promises = buyerIds.map(buyerId => 
      this.notifyBuyer(buyerId, notification)
    );
    
    await Promise.allSettled(promises);
  }

  private shouldNotify(
    notification: LeadNotification,
    preferences: BuyerNotificationPreferences
  ): boolean {
    // Check category filter
    if (preferences.categories.length > 0 && 
        !preferences.categories.includes(notification.category)) {
      return false;
    }

    // Check geographic filter
    if (preferences.geographicFilters.length > 0) {
      const leadPostalPrefix = notification.location.substring(0, 1);
      if (!preferences.geographicFilters.includes(leadPostalPrefix)) {
        return false;
      }
    }

    // Check quiet hours
    if (preferences.quietHours && this.isQuietTime(preferences.quietHours)) {
      return false;
    }

    return true;
  }

  private isQuietTime(quietHours: { start: string; end: string }): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return currentTime >= quietHours.start && currentTime <= quietHours.end;
  }

  private async processNotificationsForBuyer(buyerId: string): Promise<void> {
    const notifications = this.notificationQueue.get(buyerId);
    if (!notifications || notifications.length === 0) return;

    try {
      // Get buyer preferences to determine which channels to use
      const preferences = this.getMockPreferences(buyerId);
      
      for (const channel of preferences.channels) {
        if (!channel.active) continue;
        
        await this.sendNotification(buyerId, notifications, channel);
      }

      // Clear processed notifications
      this.notificationQueue.set(buyerId, []);
      
    } catch (error) {
      logger.error('Failed to process notifications for buyer', { buyerId, error });
    }
  }

  private async sendNotification(
    buyerId: string,
    notifications: LeadNotification[],
    channel: NotificationChannel
  ): Promise<void> {
    switch (channel.type) {
      case 'email':
        await this.sendEmailNotification(buyerId, notifications, channel);
        break;
      case 'sms':
        await this.sendSMSNotification(buyerId, notifications, channel);
        break;
      case 'push':
        await this.sendPushNotification(buyerId, notifications, channel);
        break;
      case 'webhook':
        await this.sendWebhookNotification(buyerId, notifications, channel);
        break;
      default:
        logger.warn('Unknown notification channel type', { channelType: channel.type });
    }
  }

  private async sendEmailNotification(
    buyerId: string,
    notifications: LeadNotification[],
    channel: NotificationChannel
  ): Promise<void> {
    // Mock email sending for now
    logger.debug('Email notification sent', { 
      buyerId, 
      leadCount: notifications.length,
      email: channel.settings.email 
    });
  }

  private async sendSMSNotification(
    buyerId: string,
    notifications: LeadNotification[],
    channel: NotificationChannel
  ): Promise<void> {
    // Mock SMS sending for now
    logger.debug('SMS notification sent', { 
      buyerId, 
      leadCount: notifications.length,
      phone: channel.settings.phone 
    });
  }

  private async sendPushNotification(
    buyerId: string,
    notifications: LeadNotification[],
    channel: NotificationChannel
  ): Promise<void> {
    // Mock push notification for now
    logger.debug('Push notification sent', { 
      buyerId, 
      leadCount: notifications.length,
      deviceToken: channel.settings.deviceToken 
    });
  }

  private async sendWebhookNotification(
    buyerId: string,
    notifications: LeadNotification[],
    channel: NotificationChannel
  ): Promise<void> {
    // Mock webhook call for now
    logger.debug('Webhook notification sent', { 
      buyerId, 
      leadCount: notifications.length,
      webhookUrl: channel.settings.url 
    });
  }

  private getMockPreferences(buyerId: string): BuyerNotificationPreferences {
    // Mock preferences - in production, this would come from database
    return {
      buyerId,
      channels: [
        {
          id: 'email_primary',
          type: 'email',
          active: true,
          settings: { email: `buyer${buyerId}@example.com` }
        },
        {
          id: 'sms_backup',
          type: 'sms',
          active: false,
          settings: { phone: '+4798765432' }
        }
      ],
      frequency: 'immediate',
      categories: [], // Empty means all categories
      geographicFilters: [], // Empty means all locations
      quietHours: {
        start: '22:00',
        end: '08:00'
      }
    };
  }

  private startProcessingQueue(): void {
    // Process batched notifications every 5 minutes
    this.processingInterval = setInterval(async () => {
      for (const buyerId of this.notificationQueue.keys()) {
        await this.processNotificationsForBuyer(buyerId);
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Stop the notification service
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }
}

export const buyerNotificationService = new BuyerNotificationService();