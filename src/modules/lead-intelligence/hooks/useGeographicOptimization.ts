/**
 * Geographic Optimization Hook
 * Provides location intelligence, travel time analysis, and market insights
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  GeographicAnalysis, 
  ServiceAreaCoverage,
  TravelTimeAnalysis,
  MarketDemandData,
  RegionalPricingData
} from '@/types/lead-intelligence';
import { Lead } from '@/types/leads-canonical';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface UseGeographicOptimizationReturn {
  analysis: Record<string, GeographicAnalysis>;
  loading: boolean;
  error: string | null;
  analyzeLeadLocation: (lead: Lead) => Promise<GeographicAnalysis | null>;
  getServiceProviders: (postcode: string, category: string) => Promise<ServiceAreaCoverage[]>;
  calculateTravelTimes: (leadLocation: { lat: number; lng: number }, providers: ServiceAreaCoverage[]) => Promise<TravelTimeAnalysis>;
  getMarketDemand: (region: string, category: string) => Promise<MarketDemandData>;
  optimizeDistribution: (leads: Lead[]) => Promise<Record<string, string[]>>;
}

// Mock data for Norwegian postal codes (in production, use real geocoding service)
const NORWEGIAN_POSTCODES: Record<string, { lat: number; lng: number; municipality: string; region: string }> = {
  '0150': { lat: 59.9139, lng: 10.7522, municipality: 'Oslo', region: 'Oslo' },
  '7030': { lat: 63.4305, lng: 10.3951, municipality: 'Trondheim', region: 'Trøndelag' },
  '5020': { lat: 60.3913, lng: 5.3221, municipality: 'Bergen', region: 'Vestland' },
  '4020': { lat: 58.9700, lng: 5.7331, municipality: 'Stavanger', region: 'Rogaland' },
  '9010': { lat: 69.6496, lng: 18.9560, municipality: 'Tromsø', region: 'Troms og Finnmark' }
};

export const useGeographicOptimization = (): UseGeographicOptimizationReturn => {
  const [analysis, setAnalysis] = useState<Record<string, GeographicAnalysis>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Geocode Norwegian postal code to coordinates
  const geocodePostcode = (postcode: string) => {
    const normalized = postcode.replace(/\s/g, '');
    return NORWEGIAN_POSTCODES[normalized] || null;
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Estimate travel time based on distance and traffic conditions
  const estimateTravelTime = (distanceKm: number, trafficFactor: number = 1.2): number => {
    // Base speed: 50 km/h for local travel
    const baseSpeed = 50;
    const adjustedSpeed = baseSpeed / trafficFactor;
    return Math.round((distanceKm / adjustedSpeed) * 60); // Convert to minutes
  };

  // Get service area coverage for companies
  const getServiceProviders = useCallback(async (
    postcode: string, 
    category: string
  ): Promise<ServiceAreaCoverage[]> => {
    try {
      // Get companies that service this category and area
      const { data: companies, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('status', 'active')
        .contains('tags', [category]);

      if (error) throw error;

      const leadLocation = geocodePostcode(postcode);
      if (!leadLocation) {
        throw new Error('Invalid postal code');
      }

      const coverage: ServiceAreaCoverage[] = (companies || []).map(company => {
        // Mock company location (in production, get from company profile)
        const companyLat = leadLocation.lat + (Math.random() - 0.5) * 0.5;
        const companyLng = leadLocation.lng + (Math.random() - 0.5) * 0.5;
        
        const distance = calculateDistance(
          leadLocation.lat, 
          leadLocation.lng, 
          companyLat, 
          companyLng
        );
        
        const travelTime = estimateTravelTime(distance);
        
        const availability: 'available' | 'limited' | 'unavailable' = 
          distance < 30 ? 'available' : distance < 60 ? 'limited' : 'unavailable';

        return {
          company_id: company.id,
          company_name: company.name,
          coverage_score: Math.max(0, 100 - distance * 2), // Decreases with distance
          travel_time_minutes: travelTime,
          service_quality_rating: 4.2 + Math.random() * 0.6, // Mock rating 4.2-4.8
          availability
        };
      }).filter(c => c.availability !== 'unavailable');

      return coverage.sort((a, b) => b.coverage_score - a.coverage_score);
    } catch (err) {
      console.error('Error getting service providers:', err);
      return [];
    }
  }, []);

  // Calculate travel time analysis
  const calculateTravelTimes = useCallback(async (
    leadLocation: { lat: number; lng: number },
    providers: ServiceAreaCoverage[]
  ): Promise<TravelTimeAnalysis> => {
    const travelTimes = providers.map(p => p.travel_time_minutes);
    const nearestProviderTime = Math.min(...travelTimes);
    const averageTime = travelTimes.reduce((sum, time) => sum + time, 0) / travelTimes.length;
    
    // Mock traffic impact (in production, use real traffic API)
    const trafficImpact = 0.7 + Math.random() * 0.6; // 0.7-1.3 multiplier
    
    const accessibility = nearestProviderTime <= 30 ? 'excellent' :
                         nearestProviderTime <= 45 ? 'good' :
                         nearestProviderTime <= 60 ? 'fair' : 'poor';

    return {
      nearest_provider_minutes: nearestProviderTime,
      average_travel_time: Math.round(averageTime),
      traffic_impact_score: trafficImpact,
      accessibility_rating: accessibility,
      optimal_service_windows: ['08:00-10:00', '14:00-16:00'] // Mock optimal times
    };
  }, []);

  // Get market demand data for region and category
  const getMarketDemand = useCallback(async (
    region: string, 
    category: string
  ): Promise<MarketDemandData> => {
    // Mock market data (in production, use real market intelligence)
    const baseScore = 50 + Math.random() * 40; // 50-90 base demand
    
    // Seasonal adjustments
    const month = new Date().getMonth();
    let seasonalMultiplier = 1.0;
    
    if (category.includes('tak') || category.includes('bygg')) {
      // Construction work - higher in spring/summer
      seasonalMultiplier = month >= 3 && month <= 8 ? 1.3 : 0.8;
    } else if (category.includes('rør') || category.includes('varme')) {
      // Plumbing/heating - higher in autumn/winter
      seasonalMultiplier = month >= 9 || month <= 2 ? 1.2 : 0.9;
    }

    return {
      area_demand_score: Math.round(baseScore * seasonalMultiplier),
      seasonal_trend: seasonalMultiplier > 1.1 ? 'high' : seasonalMultiplier < 0.9 ? 'low' : 'medium',
      competition_level: 40 + Math.random() * 40, // 40-80
      price_sensitivity: Math.random(),
      service_frequency: 0.3 + Math.random() * 0.4, // 0.3-0.7
      growth_potential: Math.random()
    };
  }, []);

  // Main location analysis function
  const analyzeLeadLocation = useCallback(async (lead: Lead): Promise<GeographicAnalysis | null> => {
    try {
      setLoading(true);
      setError(null);

      // Extract postcode from lead metadata or description
      const postcode = lead.metadata?.postcode || 
                      lead.metadata?.postalCode ||
                      lead.description.match(/\d{4}/)?.[0];

      if (!postcode) {
        throw new Error('No postal code found in lead data');
      }

      const location = geocodePostcode(postcode);
      if (!location) {
        throw new Error(`Invalid postal code: ${postcode}`);
      }

      // Get service providers
      const serviceProviders = await getServiceProviders(postcode, lead.category);
      
      // Calculate travel times
      const travelAnalysis = await calculateTravelTimes(location, serviceProviders);
      
      // Get market demand
      const marketDemand = await getMarketDemand(location.region, lead.category);
      
      // Calculate regional pricing (mock data)
      const regionalPricing: RegionalPricingData = {
        base_price_multiplier: 0.9 + Math.random() * 0.4, // 0.9-1.3
        market_rate_comparison: Math.random() * 0.4 - 0.2, // -0.2 to 0.2
        premium_justification_score: Math.random(),
        price_elasticity: 0.3 + Math.random() * 0.4 // 0.3-0.7
      };

      const geoAnalysis: GeographicAnalysis = {
        lead_id: lead.id,
        customer_location: {
          lat: location.lat,
          lng: location.lng,
          postcode: postcode,
          municipality: location.municipality,
          region: location.region
        },
        service_area_coverage: serviceProviders,
        travel_time_analysis: travelAnalysis,
        market_demand: marketDemand,
        competition_density: serviceProviders.length / 10, // Normalize by expected max
        regional_pricing: regionalPricing
      };

      setAnalysis(prev => ({ ...prev, [lead.id]: geoAnalysis }));
      return geoAnalysis;

    } catch (err) {
      console.error('Error analyzing lead location:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze location');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getServiceProviders, calculateTravelTimes, getMarketDemand]);

  // Optimize lead distribution across providers
  const optimizeDistribution = useCallback(async (leads: Lead[]): Promise<Record<string, string[]>> => {
    const distribution: Record<string, string[]> = {};
    
    for (const lead of leads) {
      const geoAnalysis = analysis[lead.id] || await analyzeLeadLocation(lead);
      if (!geoAnalysis) continue;

      // Find best provider based on coverage score and availability
      const bestProvider = geoAnalysis.service_area_coverage
        .filter(p => p.availability === 'available')
        .sort((a, b) => b.coverage_score - a.coverage_score)[0];

      if (bestProvider) {
        if (!distribution[bestProvider.company_id]) {
          distribution[bestProvider.company_id] = [];
        }
        distribution[bestProvider.company_id].push(lead.id);
      }
    }

    return distribution;
  }, [analysis, analyzeLeadLocation]);

  return {
    analysis,
    loading,
    error,
    analyzeLeadLocation,
    getServiceProviders,
    calculateTravelTimes,
    getMarketDemand,
    optimizeDistribution
  };
};