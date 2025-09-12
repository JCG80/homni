/**
 * Business Analytics Implementation
 * Lead conversion tracking and business intelligence
 */

import { supabase } from '@/lib/supabaseClient';
import { track } from '@/lib/analytics';
import { logger } from '@/utils/logger';

export interface LeadConversionFunnel {
  visitors: number;
  leads: number;
  qualified: number;
  contacted: number;
  converted: number;
  conversionRate: number;
}

export interface PropertyPortfolioMetrics {
  totalProperties: number;
  activeListings: number;
  averagePrice: number;
  pricePerSqm: number;
  daysOnMarket: number;
  viewsPerListing: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  leadValue: number;
  customerLifetimeValue: number;
}

class BusinessAnalyticsCollector {
  private static instance: BusinessAnalyticsCollector;

  static getInstance(): BusinessAnalyticsCollector {
    if (!BusinessAnalyticsCollector.instance) {
      BusinessAnalyticsCollector.instance = new BusinessAnalyticsCollector();
    }
    return BusinessAnalyticsCollector.instance;
  }

  // Lead Conversion Analytics
  async trackLeadConversionFunnel(dateRange?: { start: string; end: string }): Promise<LeadConversionFunnel> {
    try {
      let query = supabase
        .from('analytics_events')
        .select('event_name, properties, created_at');

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      const { data: events, error } = await query;
      
      if (error) throw error;

      const funnel: LeadConversionFunnel = {
        visitors: 0,
        leads: 0,
        qualified: 0,
        contacted: 0,
        converted: 0,
        conversionRate: 0
      };

      events?.forEach(event => {
        const properties = event.properties as Record<string, any> || {};
        switch (event.event_name) {
          case 'page_view':
            if (properties.path === '/') funnel.visitors++;
            break;
          case 'lead_created':
            funnel.leads++;
            break;
          case 'lead_qualified':
            funnel.qualified++;
            break;
          case 'lead_contacted':
            funnel.contacted++;
            break;
          case 'lead_converted':
            funnel.converted++;
            break;
        }
      });

      funnel.conversionRate = funnel.visitors > 0 ? (funnel.converted / funnel.visitors) * 100 : 0;

      // Store funnel metrics
      await this.storeFunnelMetrics(funnel, dateRange);

      return funnel;
    } catch (error) {
      logger.error('Failed to track lead conversion funnel', {
        module: 'BusinessAnalytics',
        action: 'trackLeadConversionFunnel',
        dateRange
      }, error);
      throw error;
    }
  }

  // Property Portfolio Analytics
  async trackPropertyPortfolioMetrics(userId?: string): Promise<PropertyPortfolioMetrics> {
    try {
      let propertyQuery = supabase.from('properties').select('*');
      let analyticsQuery = supabase.from('analytics_events').select('*');

      if (userId) {
        propertyQuery = propertyQuery.eq('user_id', userId);
        analyticsQuery = analyticsQuery.eq('user_id', userId);
      }

      const [{ data: properties }, { data: events }] = await Promise.all([
        propertyQuery,
        analyticsQuery.eq('event_name', 'property_viewed')
      ]);

      const metrics: PropertyPortfolioMetrics = {
        totalProperties: properties?.length || 0,
        activeListings: properties?.filter(p => p.type === 'active_listing').length || 0,
        averagePrice: 0,
        pricePerSqm: 0,
        daysOnMarket: 0,
        viewsPerListing: 0
      };

      if (properties && properties.length > 0) {
        // Use size field directly from properties table
        const avgSize = properties.reduce((sum, p) => sum + (p.size || 0), 0) / properties.length;
        
        // Calculate average days on market
        const daysOnMarket = properties
          .map(p => {
            const createdAt = new Date(p.created_at);
            const now = new Date();
            return (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
          });
        
        metrics.daysOnMarket = daysOnMarket.reduce((sum, days) => sum + days, 0) / daysOnMarket.length;
        metrics.pricePerSqm = avgSize; // Use size as proxy for price per sqm calculation
      }

      if (events && properties) {
        metrics.viewsPerListing = properties.length > 0 ? events.length / properties.length : 0;
      }

      // Store portfolio metrics
      await this.storePortfolioMetrics(metrics, userId);

      return metrics;
    } catch (error) {
      logger.error('Failed to track property portfolio metrics', {
        module: 'BusinessAnalytics',
        action: 'trackPropertyPortfolioMetrics',
        userId
      }, error);
      throw error;
    }
  }

  // Revenue Analytics
  async trackRevenueMetrics(dateRange?: { start: string; end: string }): Promise<RevenueMetrics> {
    try {
      let query = supabase
        .from('company_budget_transactions')
        .select('amount, transaction_type, created_at');

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      const { data: transactions, error } = await query;
      
      if (error) throw error;

      const revenueTransactions = transactions?.filter(t => t.transaction_type === 'debit') || [];
      
      const metrics: RevenueMetrics = {
        totalRevenue: 0,
        monthlyRevenue: 0,
        averageOrderValue: 0,
        leadValue: 0,
        customerLifetimeValue: 0
      };

      if (revenueTransactions.length > 0) {
        metrics.totalRevenue = revenueTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        metrics.averageOrderValue = metrics.totalRevenue / revenueTransactions.length;

        // Calculate monthly revenue (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const monthlyTransactions = revenueTransactions.filter(t => 
          new Date(t.created_at) >= thirtyDaysAgo
        );
        metrics.monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      }

      // Calculate lead value from lead assignments
      const { data: leadAssignments } = await supabase
        .from('lead_assignments')
        .select('cost');

      if (leadAssignments) {
        const totalLeadValue = leadAssignments.reduce((sum, la) => sum + (la.cost || 0), 0);
        metrics.leadValue = leadAssignments.length > 0 ? totalLeadValue / leadAssignments.length : 0;
      }

      // Store revenue metrics
      await this.storeRevenueMetrics(metrics, dateRange);

      return metrics;
    } catch (error) {
      logger.error('Failed to track revenue metrics', {
        module: 'BusinessAnalytics',
        action: 'trackRevenueMetrics',
        dateRange
      }, error);
      throw error;
    }
  }

  // Customer Journey Analytics
  async trackCustomerJourney(userId: string): Promise<any[]> {
    try {
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('event_name, properties, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Process events to create journey map
      const journeyStages = [
        'page_view',
        'lead_form_started',
        'lead_form_submitted',
        'property_searched',
        'property_viewed',
        'contact_initiated',
        'conversion_completed'
      ];

      const journey = journeyStages.map(stage => {
        const stageEvents = events?.filter(e => e.event_name === stage) || [];
        return {
          stage,
          count: stageEvents.length,
          firstOccurrence: stageEvents[0]?.created_at || null,
          lastOccurrence: stageEvents[stageEvents.length - 1]?.created_at || null
        };
      });

      // Track journey completion rate
      await track('business_event', 'customer_journey_analyzed', {
        user_id: userId,
        journey_stages: journey,
        completion_rate: this.calculateJourneyCompletionRate(journey)
      });

      return journey;
    } catch (error) {
      logger.error('Failed to track customer journey', {
        module: 'BusinessAnalytics',
        action: 'trackCustomerJourney',
        userId
      }, error);
      throw error;
    }
  }

  // A/B Testing Analytics
  async trackABTestMetrics(testName: string, variant: string, outcome: 'conversion' | 'bounce'): Promise<void> {
    try {
      await track('business_event', 'ab_test_event', {
        test_name: testName,
        variant,
        outcome,
        timestamp: new Date().toISOString()
      });

      // Store in analytics events with special type
      await track('business_event', 'ab_test_result', {
        test_name: testName,
        variant,
        outcome,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to track A/B test metrics', {
        module: 'BusinessAnalytics',
        action: 'trackABTestMetrics',
        testName,
        variant,
        outcome
      }, error);
    }
  }

  // Helper methods for storing metrics
  private async storeFunnelMetrics(funnel: LeadConversionFunnel, dateRange?: { start: string; end: string }): Promise<void> {
    try {
      // Store as analytics events with business_metrics type
      await track('business_event', 'funnel_metrics_calculated', {
        metric_type: 'lead_funnel',
        metric_data: funnel,
        date_range: dateRange,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.warn('Failed to store funnel metrics', {
        module: 'BusinessAnalytics',
        action: 'storeFunnelMetrics',
        dateRange
      }, error);
    }
  }

  private async storePortfolioMetrics(metrics: PropertyPortfolioMetrics, userId?: string): Promise<void> {
    try {
      // Store as analytics events with business_metrics type
      await track('business_event', 'portfolio_metrics_calculated', {
        metric_type: 'property_portfolio',
        metric_data: metrics,
        user_id: userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.warn('Failed to store portfolio metrics', {
        module: 'BusinessAnalytics',
        action: 'storePortfolioMetrics',
        userId
      }, error);
    }
  }

  private async storeRevenueMetrics(metrics: RevenueMetrics, dateRange?: { start: string; end: string }): Promise<void> {
    try {
      // Store as analytics events with business_metrics type
      await track('business_event', 'revenue_metrics_calculated', {
        metric_type: 'revenue',
        metric_data: metrics,
        date_range: dateRange,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.warn('Failed to store revenue metrics', {
        module: 'BusinessAnalytics',
        action: 'storeRevenueMetrics',
        dateRange
      }, error);
    }
  }

  private calculateJourneyCompletionRate(journey: any[]): number {
    const completedStages = journey.filter(stage => stage.count > 0).length;
    return (completedStages / journey.length) * 100;
  }
}

// Export singleton instance
export const businessAnalytics = BusinessAnalyticsCollector.getInstance();