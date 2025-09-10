/**
 * Lead Intelligence System Types
 * Advanced scoring, geographic optimization, and business intelligence
 */

import { Lead, LeadStatus } from './leads-canonical';

// === LEAD SCORING TYPES ===
export interface LeadScore {
  id: string;
  lead_id: string;
  total_score: number;
  behavioral_score: number;
  demographic_score: number;
  engagement_score: number;
  quality_score: number;
  conversion_probability: number;
  value_estimate: number;
  factors: LeadScoringFactors;
  calculated_at: string;
}

export interface LeadScoringFactors {
  // Behavioral factors
  page_views: number;
  time_on_site: number;
  form_completion_rate: number;
  email_engagement: number;
  
  // Demographic factors
  company_size?: number;
  industry_match: number;
  location_relevance: number;
  budget_indicator: number;
  
  // Engagement factors
  response_time: number;
  communication_quality: number;
  requirements_clarity: number;
  urgency_level: number;
}

// === GEOGRAPHIC INTELLIGENCE TYPES ===
export interface GeographicAnalysis {
  lead_id: string;
  customer_location: {
    lat: number;
    lng: number;
    postcode: string;
    municipality: string;
    region: string;
  };
  service_area_coverage: ServiceAreaCoverage[];
  travel_time_analysis: TravelTimeAnalysis;
  market_demand: MarketDemandData;
  competition_density: number;
  regional_pricing: RegionalPricingData;
}

export interface ServiceAreaCoverage {
  company_id: string;
  company_name: string;
  coverage_score: number;
  travel_time_minutes: number;
  service_quality_rating: number;
  availability: 'available' | 'limited' | 'unavailable';
  last_service_date?: string;
}

export interface TravelTimeAnalysis {
  nearest_provider_minutes: number;
  average_travel_time: number;
  traffic_impact_score: number;
  accessibility_rating: 'excellent' | 'good' | 'fair' | 'poor';
  optimal_service_windows: string[];
}

export interface MarketDemandData {
  area_demand_score: number;
  seasonal_trend: 'high' | 'medium' | 'low';
  competition_level: number;
  price_sensitivity: number;
  service_frequency: number;
  growth_potential: number;
}

export interface RegionalPricingData {
  base_price_multiplier: number;
  market_rate_comparison: number;
  premium_justification_score: number;
  price_elasticity: number;
}

// === BUSINESS INTELLIGENCE TYPES ===
export interface LeadConversionFunnel {
  stage: 'generated' | 'qualified' | 'contacted' | 'negotiating' | 'won' | 'lost';
  count: number;
  conversion_rate: number;
  average_time_in_stage: number;
  drop_off_rate: number;
  value_at_stage: number;
}

export interface LeadPerformanceMetrics {
  total_leads: number;
  conversion_rate: number;
  average_lead_value: number;
  cost_per_lead: number;
  roi: number;
  quality_distribution: QualityDistribution;
  geographic_performance: GeographicPerformance[];
  temporal_patterns: TemporalPattern[];
}

export interface QualityDistribution {
  excellent: number;  // 90-100 score
  good: number;      // 70-89 score
  fair: number;      // 50-69 score
  poor: number;      // 0-49 score
}

export interface GeographicPerformance {
  region: string;
  lead_count: number;
  conversion_rate: number;
  average_value: number;
  market_saturation: number;
  growth_opportunity: number;
}

export interface TemporalPattern {
  period: 'hour' | 'day' | 'week' | 'month';
  timestamp: string;
  lead_volume: number;
  quality_score: number;
  conversion_rate: number;
  seasonal_factor: number;
}

// === PREDICTIVE ANALYTICS TYPES ===
export interface LeadPrediction {
  lead_id: string;
  predicted_outcome: 'win' | 'lose';
  confidence_score: number;
  estimated_value: number;
  optimal_contact_time: string;
  recommended_approach: string;
  risk_factors: string[];
  opportunity_factors: string[];
}

export interface MarketForecast {
  region: string;
  category: string;
  forecast_period: string;
  predicted_demand: number;
  confidence_interval: [number, number];
  driving_factors: string[];
  recommended_actions: string[];
}

// === ENHANCED LEAD INTERFACE ===
export interface EnhancedLead extends Lead {
  score?: LeadScore;
  geographic_analysis?: GeographicAnalysis;
  prediction?: LeadPrediction;
  intelligence_last_updated?: string;
}

// === INTELLIGENCE CONFIGURATION ===
export interface IntelligenceConfig {
  scoring_weights: {
    behavioral: number;
    demographic: number;
    engagement: number;
    geographic: number;
  };
  geographic_radius_km: number;
  price_optimization_enabled: boolean;
  real_time_scoring: boolean;
  prediction_model_version: string;
}

// === API RESPONSE TYPES ===
export interface IntelligenceDashboardData {
  performance_overview: LeadPerformanceMetrics;
  funnel_analysis: LeadConversionFunnel[];
  geographic_insights: GeographicPerformance[];
  predictions: LeadPrediction[];
  market_forecast: MarketForecast[];
  real_time_metrics: {
    active_leads: number;
    conversion_rate_24h: number;
    quality_trend: 'up' | 'down' | 'stable';
    alert_count: number;
  };
}

// === UTILITY TYPES ===
export type ScoreRange = 'excellent' | 'good' | 'fair' | 'poor';
export type IntelligenceAlert = {
  id: string;
  type: 'quality_drop' | 'geographic_gap' | 'conversion_issue' | 'market_opportunity';
  severity: 'high' | 'medium' | 'low';
  message: string;
  created_at: string;
  resolved: boolean;
};

export const SCORE_RANGES: Record<ScoreRange, { min: number; max: number; color: string }> = {
  excellent: { min: 90, max: 100, color: 'hsl(var(--success))' },
  good: { min: 70, max: 89, color: 'hsl(var(--primary))' },
  fair: { min: 50, max: 69, color: 'hsl(var(--warning))' },
  poor: { min: 0, max: 49, color: 'hsl(var(--destructive))' }
};