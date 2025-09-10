/**
 * Advanced Lead Scoring Hook
 * Implements AI-powered lead quality assessment and behavioral scoring
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  LeadScore, 
  LeadScoringFactors, 
  EnhancedLead,
  IntelligenceConfig 
} from '@/types/lead-intelligence';
import { Lead } from '@/types/leads-canonical';
import { toast } from 'sonner';

interface UseLeadScoringReturn {
  scores: Record<string, LeadScore>;
  loading: boolean;
  error: string | null;
  calculateScore: (lead: Lead, factors?: Partial<LeadScoringFactors>) => Promise<LeadScore | null>;
  bulkCalculateScores: (leads: Lead[]) => Promise<void>;
  getScoreRange: (score: number) => 'excellent' | 'good' | 'fair' | 'poor';
  config: IntelligenceConfig;
  updateConfig: (newConfig: Partial<IntelligenceConfig>) => void;
}

const DEFAULT_CONFIG: IntelligenceConfig = {
  scoring_weights: {
    behavioral: 0.3,
    demographic: 0.25,
    engagement: 0.35,
    geographic: 0.1
  },
  geographic_radius_km: 50,
  price_optimization_enabled: true,
  real_time_scoring: true,
  prediction_model_version: 'v1.2'
};

export const useLeadScoring = (): UseLeadScoringReturn => {
  const [scores, setScores] = useState<Record<string, LeadScore>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<IntelligenceConfig>(DEFAULT_CONFIG);

  // Calculate behavioral score based on user interaction patterns
  const calculateBehavioralScore = (factors: LeadScoringFactors): number => {
    const {
      page_views,
      time_on_site,
      form_completion_rate,
      email_engagement
    } = factors;

    // Normalize values to 0-100 scale
    const pageViewScore = Math.min(page_views * 5, 100); // Max at 20 pages
    const timeScore = Math.min(time_on_site / 60 * 10, 100); // Max at 10 minutes
    const completionScore = form_completion_rate * 100;
    const emailScore = email_engagement * 100;

    return (pageViewScore + timeScore + completionScore + emailScore) / 4;
  };

  // Calculate demographic score based on customer profile
  const calculateDemographicScore = (factors: LeadScoringFactors): number => {
    const {
      company_size = 1,
      industry_match,
      location_relevance,
      budget_indicator
    } = factors;

    // Company size scoring (logarithmic)
    const sizeScore = Math.min(Math.log10(company_size + 1) * 20, 100);
    const industryScore = industry_match * 100;
    const locationScore = location_relevance * 100;
    const budgetScore = budget_indicator * 100;

    return (sizeScore + industryScore + locationScore + budgetScore) / 4;
  };

  // Calculate engagement score based on interaction quality
  const calculateEngagementScore = (factors: LeadScoringFactors): number => {
    const {
      response_time,
      communication_quality,
      requirements_clarity,
      urgency_level
    } = factors;

    // Response time scoring (inverse - faster is better)
    const responseScore = Math.max(100 - response_time * 10, 0);
    const qualityScore = communication_quality * 100;
    const clarityScore = requirements_clarity * 100;
    const urgencyScore = urgency_level * 100;

    return (responseScore + qualityScore + clarityScore + urgencyScore) / 4;
  };

  // Calculate conversion probability using machine learning approach
  const calculateConversionProbability = (
    behavioralScore: number,
    demographicScore: number,
    engagementScore: number
  ): number => {
    // Simplified ML model - in production, this would use actual trained model
    const weights = {
      behavioral: 0.35,
      demographic: 0.25,
      engagement: 0.4
    };

    const weightedScore = (
      behavioralScore * weights.behavioral +
      demographicScore * weights.demographic +
      engagementScore * weights.engagement
    );

    // Apply sigmoid function for probability
    return 1 / (1 + Math.exp(-((weightedScore - 50) / 20)));
  };

  // Estimate lead value based on historical data and current factors
  const estimateLeadValue = (
    totalScore: number,
    category: string,
    factors: LeadScoringFactors
  ): number => {
    // Base values by category (in NOK)
    const baseValues: Record<string, number> = {
      'rørlegging': 8000,
      'elektro': 6000,
      'bygg': 15000,
      'maling': 4000,
      'tak': 12000,
      'general': 5000
    };

    const baseValue = baseValues[category.toLowerCase()] || baseValues.general;
    
    // Apply score multiplier
    const scoreMultiplier = 0.5 + (totalScore / 100) * 1.5; // 0.5x to 2x based on score
    
    // Apply urgency multiplier
    const urgencyMultiplier = 1 + (factors.urgency_level * 0.5); // Up to 1.5x for urgent
    
    // Apply budget indicator
    const budgetMultiplier = 0.7 + (factors.budget_indicator * 0.6); // 0.7x to 1.3x

    return Math.round(baseValue * scoreMultiplier * urgencyMultiplier * budgetMultiplier);
  };

  // Main scoring calculation function
  const calculateScore = useCallback(async (
    lead: Lead, 
    factorsOverride?: Partial<LeadScoringFactors>
  ): Promise<LeadScore | null> => {
    try {
      setLoading(true);

      // Get existing analytics data or use defaults
      const defaultFactors: LeadScoringFactors = {
        page_views: 3,
        time_on_site: 120, // 2 minutes
        form_completion_rate: 1.0, // They did complete the form
        email_engagement: 0.5,
        industry_match: 0.8,
        location_relevance: 0.9,
        budget_indicator: 0.6,
        response_time: 2, // hours
        communication_quality: 0.7,
        requirements_clarity: 0.8,
        urgency_level: 0.5
      };

      // Merge with any analytics data from metadata
      const analyticsData = lead.metadata?.analytics || {};
      const factors: LeadScoringFactors = {
        ...defaultFactors,
        ...analyticsData,
        ...factorsOverride
      };

      // Calculate component scores
      const behavioralScore = calculateBehavioralScore(factors);
      const demographicScore = calculateDemographicScore(factors);
      const engagementScore = calculateEngagementScore(factors);

      // Calculate weighted total score
      const totalScore = (
        behavioralScore * config.scoring_weights.behavioral +
        demographicScore * config.scoring_weights.demographic +
        engagementScore * config.scoring_weights.engagement
      );

      // Calculate quality score (simplified)
      const qualityScore = (behavioralScore + engagementScore) / 2;

      // Calculate conversion probability
      const conversionProbability = calculateConversionProbability(
        behavioralScore,
        demographicScore,
        engagementScore
      );

      // Estimate value
      const valueEstimate = estimateLeadValue(totalScore, lead.category, factors);

      const score: LeadScore = {
        id: `score_${lead.id}`,
        lead_id: lead.id,
        total_score: Math.round(totalScore),
        behavioral_score: Math.round(behavioralScore),
        demographic_score: Math.round(demographicScore),
        engagement_score: Math.round(engagementScore),
        quality_score: Math.round(qualityScore),
        conversion_probability: Math.round(conversionProbability * 100) / 100,
        value_estimate: valueEstimate,
        factors,
        calculated_at: new Date().toISOString()
      };

      // Store score (in production, this would go to database)
      setScores(prev => ({ ...prev, [lead.id]: score }));

      return score;
    } catch (err) {
      console.error('Error calculating lead score:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate score');
      return null;
    } finally {
      setLoading(false);
    }
  }, [config]);

  // Bulk scoring for multiple leads
  const bulkCalculateScores = useCallback(async (leads: Lead[]): Promise<void> => {
    setLoading(true);
    const newScores: Record<string, LeadScore> = {};

    for (const lead of leads) {
      const score = await calculateScore(lead);
      if (score) {
        newScores[lead.id] = score;
      }
    }

    setScores(prev => ({ ...prev, ...newScores }));
    setLoading(false);
  }, [calculateScore]);

  // Utility function to get score range
  const getScoreRange = (score: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  };

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<IntelligenceConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  return {
    scores,
    loading,
    error,
    calculateScore,
    bulkCalculateScores,
    getScoreRange,
    config,
    updateConfig
  };
};