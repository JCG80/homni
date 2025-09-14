import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks';

export interface LeadQualityScore {
  id: string;
  lead_id: string;
  overall_score: number;
  completeness_score: number;
  urgency_score: number;
  budget_indicator_score: number;
  location_score: number;
  category_demand_score: number;
  contact_quality_score: number;
  scoring_factors: Record<string, any>;
  calculated_at: string;
  expires_at?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  min_score: number;
  max_score: number;
  base_price_cents: number;
  preview_access_level: 'none' | 'basic' | 'contact' | 'full';
  full_access_price_multiplier: number;
  time_limit_hours: number;
  features: Record<string, any>;
  is_active: boolean;
}

export interface LeadPricing {
  tier_name: string;
  base_price_cents: number;
  preview_access_level: string;
  full_price_cents: number;
  score: number;
}

export const useLeadScoring = (leadId?: string) => {
  const [score, setScore] = useState<LeadQualityScore | null>(null);
  const [pricing, setPricing] = useState<LeadPricing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchLeadScore = async () => {
    if (!leadId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Try to get existing score first
      const { data: scoreData, error: scoreError } = await supabase
        .from('lead_quality_scores')
        .select('*')
        .eq('lead_id', leadId)
        .single();

      if (scoreError && scoreError.code !== 'PGRST116') {
        throw scoreError;
      }

      if (scoreData) {
        const transformedScore: LeadQualityScore = {
          ...scoreData,
          scoring_factors: (typeof scoreData.scoring_factors === 'object' && scoreData.scoring_factors !== null) 
            ? scoreData.scoring_factors as Record<string, any> 
            : {}
        };
        setScore(transformedScore);
      } else {
        // Calculate new score
        const calculatedScore = await calculateScore(leadId);
        setScore(calculatedScore);
      }

      // Get pricing information
      const pricingInfo = await getLeadPricing(leadId);
      setPricing(pricingInfo);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lead score';
      setError(errorMessage);
      console.error('Error fetching lead score:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateScore = async (leadId: string): Promise<LeadQualityScore | null> => {
    try {
      const { data, error } = await supabase
        .rpc('calculate_lead_score', { p_lead_id: leadId });

      if (error) throw error;

      // Fetch the calculated score
      const { data: scoreData, error: fetchError } = await supabase
        .from('lead_quality_scores')
        .select('*')
        .eq('lead_id', leadId)
        .single();

      if (fetchError) throw fetchError;

      const transformedScore: LeadQualityScore = {
        ...scoreData,
        scoring_factors: (typeof scoreData.scoring_factors === 'object' && scoreData.scoring_factors !== null) 
          ? scoreData.scoring_factors as Record<string, any> 
          : {}
      };

      return transformedScore;
    } catch (err) {
      console.error('Error calculating score:', err);
      return null;
    }
  };

  const getLeadPricing = async (leadId: string): Promise<LeadPricing | null> => {
    try {
      const { data, error } = await supabase
        .rpc('get_lead_pricing', { p_lead_id: leadId })
        .single();

      if (error) throw error;

      if (!data || typeof data !== 'object') {
        return null;
      }

      // Ensure data conforms to LeadPricing interface
      const pricingData = data as any;
      if (!pricingData.tier_name || typeof pricingData.base_price_cents !== 'number') {
        return null;
      }

      return pricingData as LeadPricing;
    } catch (err) {
      console.error('Error fetching pricing:', err);
      return null;
    }
  };

  const recalculateScore = async () => {
    if (!leadId) return;
    
    setIsLoading(true);
    const newScore = await calculateScore(leadId);
    if (newScore) {
      setScore(newScore);
      const pricingInfo = await getLeadPricing(leadId);
      setPricing(pricingInfo);
    }
    setIsLoading(false);
  };

  // Quality assessment helpers
  const getScoreGrade = (score: number): string => {
    if (score >= 86) return 'A+';
    if (score >= 76) return 'A';
    if (score >= 61) return 'B';
    if (score >= 46) return 'C';
    if (score >= 31) return 'D';
    return 'F';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 76) return 'hsl(var(--success))';
    if (score >= 61) return 'hsl(var(--primary))';
    if (score >= 46) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const getTierBadgeColor = (tierName: string): string => {
    switch (tierName?.toLowerCase()) {
      case 'platinum': return 'hsl(var(--violet-500))';
      case 'gold': return 'hsl(var(--amber-500))';
      case 'silver': return 'hsl(var(--slate-400))';
      case 'bronze': return 'hsl(var(--amber-700))';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  const formatPrice = (priceCents: number): string => {
    return `${(priceCents / 100).toLocaleString('nb-NO')} kr`;
  };

  useEffect(() => {
    if (leadId && user) {
      fetchLeadScore();
    }
  }, [leadId, user]);

  return {
    score,
    pricing,
    isLoading,
    error,
    recalculateScore,
    refreshScore: fetchLeadScore,
    // Helper functions
    getScoreGrade,
    getScoreColor,
    getTierBadgeColor,
    formatPrice
  };
};