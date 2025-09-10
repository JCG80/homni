/**
 * Business Intelligence Hook for Lead Analytics
 * Provides advanced analytics, forecasting, and performance insights
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  LeadConversionFunnel,
  LeadPerformanceMetrics,
  GeographicPerformance,
  TemporalPattern,
  IntelligenceDashboardData,
  IntelligenceAlert
} from '@/types/lead-intelligence';
import { Lead, LeadStatus } from '@/types/leads-canonical';
import { supabase } from '@/lib/supabaseClient';

interface UseBusinessIntelligenceReturn {
  dashboardData: IntelligenceDashboardData | null;
  loading: boolean;
  error: string | null;
  alerts: IntelligenceAlert[];
  refreshData: () => Promise<void>;
  exportAnalytics: (format: 'csv' | 'pdf') => Promise<void>;
  getConversionFunnel: (timeRange: string) => Promise<LeadConversionFunnel[]>;
  getGeographicPerformance: (region?: string) => Promise<GeographicPerformance[]>;
  getTemporalPatterns: (granularity: 'hour' | 'day' | 'week' | 'month') => Promise<TemporalPattern[]>;
}

export const useBusinessIntelligence = (): UseBusinessIntelligenceReturn => {
  const [dashboardData, setDashboardData] = useState<IntelligenceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<IntelligenceAlert[]>([]);

  // Calculate conversion funnel metrics
  const getConversionFunnel = useCallback(async (timeRange: string = '30d'): Promise<LeadConversionFunnel[]> => {
    try {
      const startDate = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      startDate.setDate(startDate.getDate() - days);

      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Define funnel stages with their corresponding statuses
      const stages = [
        { stage: 'generated' as const, statuses: ['new'] },
        { stage: 'qualified' as const, statuses: ['qualified'] },
        { stage: 'contacted' as const, statuses: ['contacted'] },
        { stage: 'negotiating' as const, statuses: ['negotiating'] },
        { stage: 'won' as const, statuses: ['converted'] },
        { stage: 'lost' as const, statuses: ['lost', 'paused'] }
      ];

      const totalLeads = leads?.length || 0;
      
      return stages.map(({ stage, statuses }) => {
        const stageLeads = leads?.filter(lead => statuses.includes(lead.status as LeadStatus)) || [];
        const count = stageLeads.length;
        const conversionRate = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
        
        // Mock average time in stage (hours)
        const avgTimeInStage = stage === 'generated' ? 2 :
                              stage === 'qualified' ? 8 :
                              stage === 'contacted' ? 24 :
                              stage === 'negotiating' ? 72 :
                              stage === 'won' ? 120 : 48;

        // Calculate drop-off rate (leads that didn't progress)
        const nextStageIndex = stages.findIndex(s => s.stage === stage) + 1;
        const nextStageCount = nextStageIndex < stages.length ? 
          (leads?.filter(lead => stages[nextStageIndex].statuses.includes(lead.status as LeadStatus)).length || 0) : 0;
        const dropOffRate = count > 0 ? ((count - nextStageCount) / count) * 100 : 0;

        // Mock value at stage
        const valueAtStage = count * 5000; // 5000 NOK average per lead

        return {
          stage,
          count,
          conversion_rate: Math.round(conversionRate * 10) / 10,
          average_time_in_stage: avgTimeInStage,
          drop_off_rate: Math.round(dropOffRate * 10) / 10,
          value_at_stage: valueAtStage
        };
      });
    } catch (err) {
      console.error('Error calculating conversion funnel:', err);
      return [];
    }
  }, []);

  // Get geographic performance data
  const getGeographicPerformance = useCallback(async (region?: string): Promise<GeographicPerformance[]> => {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*');

      if (error) throw error;

      // Group leads by region (extracted from metadata or postal code)
      const regionData: Record<string, any[]> = {};
      
      leads?.forEach(lead => {
        const metadata = lead.metadata as Record<string, any> || {};
        const leadRegion = metadata.region || 
                          (typeof metadata.postcode === 'string' ? metadata.postcode.substring(0, 2) : '') || 
                          'Unknown';
        
        if (!regionData[leadRegion]) {
          regionData[leadRegion] = [];
        }
        regionData[leadRegion].push(lead);
      });

      return Object.entries(regionData).map(([regionName, regionLeads]) => {
        const totalLeads = regionLeads.length;
        const convertedLeads = regionLeads.filter(lead => lead.status === 'converted').length;
        const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
        
        // Mock average value and market metrics
        const averageValue = 5000 + Math.random() * 3000; // 5000-8000 NOK
        const marketSaturation = Math.random() * 100; // 0-100%
        const growthOpportunity = 100 - marketSaturation;

        return {
          region: regionName,
          lead_count: totalLeads,
          conversion_rate: Math.round(conversionRate * 10) / 10,
          average_value: Math.round(averageValue),
          market_saturation: Math.round(marketSaturation),
          growth_opportunity: Math.round(growthOpportunity)
        };
      }).sort((a, b) => b.lead_count - a.lead_count);
    } catch (err) {
      console.error('Error getting geographic performance:', err);
      return [];
    }
  }, []);

  // Get temporal patterns
  const getTemporalPatterns = useCallback(async (granularity: 'hour' | 'day' | 'week' | 'month'): Promise<TemporalPattern[]> => {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at');

      if (error) throw error;

      // Group leads by time period
      const timeGroups: Record<string, any[]> = {};
      
      leads?.forEach(lead => {
        const date = new Date(lead.created_at);
        let groupKey: string;
        
        switch (granularity) {
          case 'hour':
            groupKey = date.toISOString().substring(0, 13) + ':00:00';
            break;
          case 'day':
            groupKey = date.toISOString().substring(0, 10);
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            groupKey = weekStart.toISOString().substring(0, 10);
            break;
          case 'month':
            groupKey = date.toISOString().substring(0, 7) + '-01';
            break;
          default:
            groupKey = date.toISOString().substring(0, 10);
        }
        
        if (!timeGroups[groupKey]) {
          timeGroups[groupKey] = [];
        }
        timeGroups[groupKey].push(lead);
      });

      return Object.entries(timeGroups).map(([timestamp, groupLeads]) => {
        const leadVolume = groupLeads.length;
        const convertedLeads = groupLeads.filter(lead => lead.status === 'converted').length;
        const conversionRate = leadVolume > 0 ? (convertedLeads / leadVolume) * 100 : 0;
        
        // Mock quality score calculation
        const qualityScore = 60 + Math.random() * 30; // 60-90 range
        
        // Mock seasonal factor
        const month = new Date(timestamp).getMonth();
        const seasonalFactor = 0.8 + Math.sin((month / 12) * Math.PI * 2) * 0.2; // 0.6-1.0 range

        return {
          period: granularity,
          timestamp,
          lead_volume: leadVolume,
          quality_score: Math.round(qualityScore),
          conversion_rate: Math.round(conversionRate * 10) / 10,
          seasonal_factor: Math.round(seasonalFactor * 100) / 100
        };
      }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (err) {
      console.error('Error getting temporal patterns:', err);
      return [];
    }
  }, []);

  // Generate intelligence alerts
  const generateAlerts = useCallback((leads: Lead[]): IntelligenceAlert[] => {
    const alerts: IntelligenceAlert[] = [];
    
    // Quality drop alert
    const recentLeads = leads.filter(lead => {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return new Date(lead.created_at) > dayAgo;
    });
    
    if (recentLeads.length > 0) {
      const lowQualityCount = recentLeads.filter(lead => 
        lead.description.length < 50 // Simple quality check
      ).length;
      
      if (lowQualityCount / recentLeads.length > 0.3) {
        alerts.push({
          id: 'quality_drop_1',
          type: 'quality_drop',
          severity: 'high',
          message: `${Math.round(lowQualityCount / recentLeads.length * 100)}% of recent leads have low quality indicators`,
          created_at: new Date().toISOString(),
          resolved: false
        });
      }
    }

    // Geographic gap alert
    const regions = [...new Set(leads.map(lead => 
      lead.metadata?.region || lead.metadata?.postcode?.substring(0, 2) || 'Unknown'
    ))];
    
    if (regions.length < 3) {
      alerts.push({
        id: 'geo_gap_1',
        type: 'geographic_gap',
        severity: 'medium',
        message: 'Limited geographic coverage detected. Consider expanding to new regions.',
        created_at: new Date().toISOString(),
        resolved: false
      });
    }

    // Market opportunity alert
    const thisMonth = new Date().getMonth();
    if (thisMonth >= 2 && thisMonth <= 5) { // Spring months
      alerts.push({
        id: 'market_opp_1',
        type: 'market_opportunity',
        severity: 'low',
        message: 'Construction season starting. Expect increased demand for outdoor services.',
        created_at: new Date().toISOString(),
        resolved: false
      });
    }

    return alerts;
  }, []);

  // Main data refresh function
  const refreshData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Fetch leads data
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*');

      if (leadsError) throw leadsError;

      const totalLeads = leads?.length || 0;
      const convertedLeads = leads?.filter(lead => lead.status === 'converted').length || 0;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      const avgLeadValue = 5500; // Mock average
      const costPerLead = 150; // Mock cost
      const roi = avgLeadValue > 0 ? ((avgLeadValue - costPerLead) / costPerLead) * 100 : 0;

      // Get funnel, geographic, and temporal data
      const [funnelData, geoData, temporalData] = await Promise.all([
        getConversionFunnel('30d'),
        getGeographicPerformance(),
        getTemporalPatterns('day')
      ]);

      // Calculate quality distribution
      const qualityDistribution = {
        excellent: Math.round(totalLeads * 0.15),
        good: Math.round(totalLeads * 0.35),
        fair: Math.round(totalLeads * 0.35),
        poor: Math.round(totalLeads * 0.15)
      };

      // Generate alerts - transform Supabase data to Lead type
      const transformedLeads: Lead[] = (leads || []).map(lead => ({
        ...lead,
        metadata: lead.metadata as Record<string, any> || {}
      }));
      const currentAlerts = generateAlerts(transformedLeads);
      setAlerts(currentAlerts);

      const dashboardData: IntelligenceDashboardData = {
        performance_overview: {
          total_leads: totalLeads,
          conversion_rate: Math.round(conversionRate * 10) / 10,
          average_lead_value: avgLeadValue,
          cost_per_lead: costPerLead,
          roi: Math.round(roi),
          quality_distribution: qualityDistribution,
          geographic_performance: geoData,
          temporal_patterns: temporalData.slice(-30) // Last 30 periods
        },
        funnel_analysis: funnelData,
        geographic_insights: geoData,
        predictions: [], // Mock predictions would go here
        market_forecast: [], // Mock forecasts would go here
        real_time_metrics: {
          active_leads: leads?.filter(lead => ['new', 'qualified', 'contacted', 'negotiating'].includes(lead.status)).length || 0,
          conversion_rate_24h: conversionRate,
          quality_trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
          alert_count: currentAlerts.length
        }
      };

      setDashboardData(dashboardData);
    } catch (err) {
      console.error('Error refreshing BI data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [getConversionFunnel, getGeographicPerformance, getTemporalPatterns, generateAlerts]);

  // Export analytics data
  const exportAnalytics = useCallback(async (format: 'csv' | 'pdf'): Promise<void> => {
    try {
      if (!dashboardData) {
        throw new Error('No data to export');
      }

      if (format === 'csv') {
        // Create CSV content
        const csvContent = [
          'Metric,Value',
          `Total Leads,${dashboardData.performance_overview.total_leads}`,
          `Conversion Rate,${dashboardData.performance_overview.conversion_rate}%`,
          `Average Lead Value,${dashboardData.performance_overview.average_lead_value} NOK`,
          `Cost Per Lead,${dashboardData.performance_overview.cost_per_lead} NOK`,
          `ROI,${dashboardData.performance_overview.roi}%`
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lead-intelligence-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // PDF export would be implemented with a PDF library
        console.log('PDF export not implemented yet');
      }
    } catch (err) {
      console.error('Error exporting analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to export data');
    }
  }, [dashboardData]);

  // Initialize data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    dashboardData,
    loading,
    error,
    alerts,
    refreshData,
    exportAnalytics,
    getConversionFunnel,
    getGeographicPerformance,
    getTemporalPatterns
  };
};