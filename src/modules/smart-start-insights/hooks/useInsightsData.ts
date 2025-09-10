import { useState, useEffect, useCallback } from 'react';
import { getInsightsData, getPostcodeStats, getServiceTypeStats } from '../api/insightsApi';
import type { InsightsData, InsightsFilters, PostcodeStats, ServiceTypeStats } from '../types';

export const useInsightsData = (initialFilters?: InsightsFilters) => {
  const [data, setData] = useState<InsightsData | null>(null);
  const [postcodeStats, setPostcodeStats] = useState<PostcodeStats[]>([]);
  const [serviceStats, setServiceStats] = useState<ServiceTypeStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InsightsFilters>(initialFilters || {});

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [insightsResult, postcodeResult, serviceResult] = await Promise.all([
        getInsightsData(filters),
        getPostcodeStats(),
        getServiceTypeStats()
      ]);

      if (insightsResult.error) throw new Error(insightsResult.error.message);
      if (postcodeResult.error) throw new Error(postcodeResult.error.message);
      if (serviceResult.error) throw new Error(serviceResult.error.message);

      setData(insightsResult.data);
      setPostcodeStats(postcodeResult.data || []);
      setServiceStats(serviceResult.data || []);
    } catch (err) {
      console.error('Error fetching insights data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch insights data');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateFilters = useCallback((newFilters: Partial<InsightsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    postcodeStats,
    serviceStats,
    isLoading,
    error,
    filters,
    updateFilters,
    refresh
  };
};