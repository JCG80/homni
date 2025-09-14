/**
 * Dashboard Module Plugin - Core dashboard and analytics functionality
 * Part of the modular plugin architecture
 */

import { PluginManifest, PluginContext } from '@/types/unified-models';
import { logger } from '@/utils/logger';

export const manifest: PluginManifest = {
  id: 'dashboard',
  name: 'Dashboard Module',
  version: '1.0.0',
  description: 'Core dashboard and analytics functionality',
  author: 'Homni Team',
  dependencies: ['auth'],
  permissions: ['dashboard:read', 'analytics:read', 'analytics:write'],
  entry_point: './DashboardModule',
  hooks: {
    'dashboard:loaded': ['onDashboardLoaded'],
    'widget:rendered': ['onWidgetRendered'],
    'analytics:track': ['trackAnalyticsEvent'],
    'navigation:items': ['provideNavigationItems']
  }
};

export default class DashboardModule {
  private context: PluginContext | null = null;

  async initialize(context: PluginContext) {
    this.context = context;
    logger.info('Dashboard module initialized');
  }

  hooks = {
    onDashboardLoaded: {
      name: 'onDashboardLoaded',
      priority: 85,
      execute: async (context: PluginContext, dashboardId: string) => {
        logger.info('Dashboard loaded hook executed', { dashboardId });
        
        // Track dashboard view
        await this.trackDashboardView(context.user.id, dashboardId);
        
        // Load dashboard preferences
        const preferences = await this.loadDashboardPreferences(context.user.id);
        
        return { preferences, viewTracked: true };
      }
    },

    onWidgetRendered: {
      name: 'onWidgetRendered',
      priority: 85,
      execute: async (context: PluginContext, widgetData: any) => {
        logger.info('Widget rendered hook executed', { widgetId: widgetData.id });
        
        // Track widget usage
        await this.trackWidgetUsage(context.user.id, widgetData);
        
        return { tracked: true };
      }
    },

    trackAnalyticsEvent: {
      name: 'trackAnalyticsEvent',
      priority: 85,
      execute: async (context: PluginContext, eventData: any) => {
        logger.info('Analytics event tracked', { event: eventData.name });
        
        // Store analytics event
        await this.storeAnalyticsEvent(context.user.id, eventData);
        
        return { stored: true };
      }
    },

    provideNavigationItems: {
      name: 'provideNavigationItems',
      priority: 85,
      execute: async (context: PluginContext) => {
        const items = [];
        
        // Dashboard access for all authenticated users
        if (context.user.role !== 'anonymous') {
          items.push({
            id: 'dashboard',
            title: 'Dashboard',
            href: '/dashboard',
            icon: 'LayoutDashboard',
            module_id: 'dashboard',
            required_permissions: ['dashboard:read']
          });
        }
        
        // Analytics access for admins
        if (context.user.role === 'admin' || context.user.role === 'master_admin') {
          items.push({
            id: 'analytics',
            title: 'Analytics',
            href: '/analytics',
            icon: 'BarChart3',
            module_id: 'dashboard',
            required_permissions: ['analytics:read']
          });
        }
        
        return items;
      }
    }
  };

  // Private methods
  private async trackDashboardView(userId: string, dashboardId: string) {
    logger.debug('Dashboard view tracked', { userId, dashboardId });
  }

  private async loadDashboardPreferences(userId: string) {
    logger.debug('Loading dashboard preferences', { userId });
    return { theme: 'light', layout: 'grid' };
  }

  private async trackWidgetUsage(userId: string, widgetData: any) {
    logger.debug('Widget usage tracked', { userId, widgetId: widgetData.id });
  }

  private async storeAnalyticsEvent(userId: string, eventData: any) {
    logger.debug('Analytics event stored', { userId, event: eventData.name });
  }

  async cleanup() {
    logger.info('Dashboard module cleanup completed');
  }
}