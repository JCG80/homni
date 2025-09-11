import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks';

interface LeadAnalyticsMetrics {
  totalLeads: number;
  leadGrowth: number;
  conversionRate: number;
  conversionTrend: number;
  activeAssignments: number;
  autoAssignments: number;
  manualAssignments: number;
  revenueImpact: number;
  averageResponseTime: number;
  topCategories: Array<{ name: string; count: number; percentage: number }>;
  topSources: Array<{ name: string; count: number; percentage: number }>;
}

interface ConversionData {
  stage: string;
  count: number;
  percentage: number;
}

interface SourceData {
  source: string;
  count: number;
  value: number;
}

export function useLeadAnalytics(timeframe: '7d' | '30d' | '90d' | '1y' = '30d') {
  const [metrics, setMetrics] = useState<LeadAnalyticsMetrics | null>(null);
  const [conversionData, setConversionData] = useState<ConversionData[]>([]);
  const [sourceData, setSourceData] = useState<SourceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, canAccessModule } = useAuth();

  const getDateRange = useCallback(() => {
    const end = new Date();
    const start = new Date();
    
    switch (timeframe) {
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(end.getFullYear() - 1);
        break;
    }
    
    return { start: start.toISOString(), end: end.toISOString() };
  }, [timeframe]);

  const fetchAnalytics = useCallback(async () => {
    if (!user || !canAccessModule('leads')) {
      setError('Ingen tilgang til analytics');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { start, end } = getDateRange();

      // Fetch basic lead metrics
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .gte('created_at', start)
        .lte('created_at', end);

      if (leadsError) throw leadsError;

      // Fetch assignment data
      const { data: assignments, error: assignmentsError } = await supabase
        .from('lead_assignments')
        .select('*')
        .gte('created_at', start)
        .lte('created_at', end);

      if (assignmentsError) throw assignmentsError;

      // Calculate metrics
      const totalLeads = leads?.length || 0;
      const convertedLeads = leads?.filter(lead => lead.status === 'converted').length || 0;
      const conversionRate = totalLeads > 0 ? convertedLeads / totalLeads : 0;

      // Calculate growth (mock data - would need historical comparison)
      const leadGrowth = Math.random() * 20 - 10; // -10% to +10%
      const conversionTrend = Math.random() * 0.2 - 0.1; // -10% to +10%

      // Assignment metrics
      const activeAssignments = assignments?.length || 0;
      const autoAssignments = assignments?.filter(a => a.auto_purchased_at !== null).length || 0;
      const manualAssignments = activeAssignments - autoAssignments;

      // Revenue estimation (mock calculation)
      const revenueImpact = convertedLeads * 15000; // Average lead value

      // Response time calculation (mock)
      const averageResponseTime = 2.5; // hours

      // Category analysis
      const categoryCounts = leads?.reduce((acc, lead) => {
        acc[lead.category] = (acc[lead.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topCategories = Object.entries(categoryCounts)
        .map(([name, count]) => ({
          name,
          count,
          percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Source analysis (mock data)
      const topSources = [
        { name: 'Organisk søk', count: Math.floor(totalLeads * 0.4), percentage: 40 },
        { name: 'Direkte', count: Math.floor(totalLeads * 0.25), percentage: 25 },
        { name: 'Sosiale medier', count: Math.floor(totalLeads * 0.2), percentage: 20 },
        { name: 'Annonser', count: Math.floor(totalLeads * 0.15), percentage: 15 }
      ];

      setMetrics({
        totalLeads,
        leadGrowth,
        conversionRate,
        conversionTrend,
        activeAssignments,
        autoAssignments,
        manualAssignments,
        revenueImpact,
        averageResponseTime,
        topCategories,
        topSources
      });

      // Conversion funnel data
      setConversionData([
        { stage: 'Nye leads', count: totalLeads, percentage: 100 },
        { stage: 'Kvalifiserte', count: Math.floor(totalLeads * 0.7), percentage: 70 },
        { stage: 'I kontakt', count: Math.floor(totalLeads * 0.5), percentage: 50 },
        { stage: 'Forhandling', count: Math.floor(totalLeads * 0.3), percentage: 30 },
        { stage: 'Konvertert', count: convertedLeads, percentage: (conversionRate * 100) }
      ]);

      // Source performance data
      setSourceData(topSources.map(source => ({
        source: source.name,
        count: source.count,
        value: source.count * 150 // Average value per lead from source
      })));

    } catch (error) {
      console.error('Analytics fetch error:', error);
      setError(error instanceof Error ? error.message : 'Feil ved lasting av analytics');
    } finally {
      setIsLoading(false);
    }
  }, [user, canAccessModule, getDateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    metrics,
    conversionData,
    sourceData,
    isLoading,
    error,
    refetch: fetchAnalytics
  };
}