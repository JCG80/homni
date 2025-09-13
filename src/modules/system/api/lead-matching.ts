import { supabase } from '@/lib/supabaseClient';
import { ApiError } from '@/utils/apiHelpers';
import { logger } from '@/utils/logger';

/**
 * System Lead Matching API - Core matching algorithms
 */

export interface MatchingCriteria {
  leadId: string;
  category: string;
  location?: string;
  urgency?: 'low' | 'medium' | 'high';
  budget_range?: string;
  service_requirements?: string[];
}

export interface CompanyMatchResult {
  company_id: string;
  company_name: string;
  match_score: number;
  match_reasons: string[];
  available_budget: number;
  response_time_avg_hours: number;
  success_rate_percent: number;
  tags: string[];
  auto_accept_enabled: boolean;
  estimated_cost: number;
}

export interface MatchingEngineStats {
  total_leads_processed: number;
  successful_matches: number;
  failed_matches: number;
  average_match_time_ms: number;
  match_success_rate: number;
  top_matching_categories: Record<string, number>;
}

/**
 * Core matching algorithm - find best companies for a lead
 */
export async function findBestMatches(
  criteria: MatchingCriteria,
  maxResults = 5
): Promise<CompanyMatchResult[]> {
  try {
    logger.info('Finding best company matches', { 
      module: 'leadMatchingApi', 
      criteria, 
      maxResults 
    });

    const { data, error } = await supabase
      .rpc('find_best_company_matches', {
        lead_category: criteria.category,
        lead_location: criteria.location || null,
        urgency_level: criteria.urgency || 'medium',
        budget_range: criteria.budget_range || null,
        max_results: maxResults
      });

    if (error) {
      throw new ApiError('findBestMatches', error);
    }

    return data || [];
  } catch (error) {
    logger.error('Failed to find best matches', { module: 'leadMatchingApi' }, error);
    throw new ApiError('findBestMatches', error);
  }
}

/**
 * Calculate match score between lead and company
 */
export async function calculateMatchScore(
  leadId: string,
  companyId: string
): Promise<{ score: number; factors: Record<string, number> }> {
  try {
    logger.info('Calculating match score', { 
      module: 'leadMatchingApi', 
      leadId, 
      companyId 
    });

    const { data, error } = await supabase
      .rpc('calculate_lead_company_match_score', {
        lead_id_param: leadId,
        company_id_param: companyId
      });

    if (error) {
      throw new ApiError('calculateMatchScore', error);
    }

    return data || { score: 0, factors: {} };
  } catch (error) {
    logger.error('Failed to calculate match score', { module: 'leadMatchingApi' }, error);
    throw new ApiError('calculateMatchScore', error);
  }
}

/**
 * Update matching algorithm weights and parameters
 */
export async function updateMatchingParameters(parameters: {
  category_weight?: number;
  location_weight?: number;
  budget_weight?: number;
  response_time_weight?: number;
  success_rate_weight?: number;
  availability_weight?: number;
}): Promise<boolean> {
  try {
    logger.info('Updating matching parameters', { 
      module: 'leadMatchingApi', 
      parameters 
    });

    const { error } = await supabase
      .from('system_config')
      .upsert({
        key: 'lead_matching_parameters',
        value: parameters,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new ApiError('updateMatchingParameters', error);
    }

    return true;
  } catch (error) {
    logger.error('Failed to update matching parameters', { module: 'leadMatchingApi' }, error);
    throw new ApiError('updateMatchingParameters', error);
  }
}

/**
 * Get matching engine performance statistics
 */
export async function fetchMatchingStats(dateRange?: {
  from: Date;
  to: Date;
}): Promise<MatchingEngineStats> {
  try {
    logger.info('Fetching matching engine stats', { 
      module: 'leadMatchingApi', 
      dateRange 
    });

    const { data, error } = await supabase
      .rpc('get_matching_engine_stats', {
        start_date: dateRange?.from?.toISOString() || null,
        end_date: dateRange?.to?.toISOString() || null,
      });

    if (error) {
      throw new ApiError('fetchMatchingStats', error);
    }

    return data || {
      total_leads_processed: 0,
      successful_matches: 0,
      failed_matches: 0,
      average_match_time_ms: 0,
      match_success_rate: 0,
      top_matching_categories: {},
    };
  } catch (error) {
    logger.error('Failed to fetch matching stats', { module: 'leadMatchingApi' }, error);
    throw new ApiError('fetchMatchingStats', error);
  }
}

/**
 * Test matching algorithm with sample data
 */
export async function testMatchingAlgorithm(testScenarios: {
  lead_category: string;
  expected_company_types: string[];
  test_description: string;
}[]): Promise<{
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  test_results: Array<{
    scenario: string;
    passed: boolean;
    actual_matches: string[];
    expected_matches: string[];
  }>;
}> {
  try {
    logger.info('Testing matching algorithm', { 
      module: 'leadMatchingApi', 
      scenarioCount: testScenarios.length 
    });

    const results = {
      total_tests: testScenarios.length,
      passed_tests: 0,
      failed_tests: 0,
      test_results: [] as any[],
    };

    for (const scenario of testScenarios) {
      try {
        const matches = await findBestMatches({
          leadId: 'test',
          category: scenario.lead_category,
        });

        const actualTypes = matches.map(m => m.company_name.toLowerCase());
        const expectedTypes = scenario.expected_company_types.map(t => t.toLowerCase());
        
        const passed = expectedTypes.some(expected => 
          actualTypes.some(actual => actual.includes(expected))
        );

        results.test_results.push({
          scenario: scenario.test_description,
          passed,
          actual_matches: actualTypes,
          expected_matches: expectedTypes,
        });

        if (passed) {
          results.passed_tests++;
        } else {
          results.failed_tests++;
        }
      } catch (testError) {
        results.failed_tests++;
        results.test_results.push({
          scenario: scenario.test_description,
          passed: false,
          actual_matches: [],
          expected_matches: scenario.expected_company_types,
        });
      }
    }

    return results;
  } catch (error) {
    logger.error('Failed to test matching algorithm', { module: 'leadMatchingApi' }, error);
    throw new ApiError('testMatchingAlgorithm', error);
  }
}

/**
 * Manual override for specific lead-company matching
 */
export async function createMatchingOverride(
  leadCategory: string,
  companyId: string,
  priority: number,
  reason: string
): Promise<boolean> {
  try {
    logger.info('Creating matching override', { 
      module: 'leadMatchingApi', 
      leadCategory, 
      companyId, 
      priority 
    });

    const { error } = await supabase
      .from('matching_overrides')
      .insert({
        lead_category: leadCategory,
        company_id: companyId,
        priority_boost: priority,
        reason,
        is_active: true,
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw new ApiError('createMatchingOverride', error);
    }

    return true;
  } catch (error) {
    logger.error('Failed to create matching override', { module: 'leadMatchingApi' }, error);
    throw new ApiError('createMatchingOverride', error);
  }
}

/**
 * Analyze matching failures for improvement
 */
export async function analyzeMatchingFailures(limit = 50): Promise<{
  common_failure_reasons: Record<string, number>;
  unmatched_categories: string[];
  improvement_suggestions: string[];
}> {
  try {
    logger.info('Analyzing matching failures', { module: 'leadMatchingApi', limit });

    const { data, error } = await supabase
      .rpc('analyze_matching_failures', { limit_param: limit });

    if (error) {
      throw new ApiError('analyzeMatchingFailures', error);
    }

    return data || {
      common_failure_reasons: {},
      unmatched_categories: [],
      improvement_suggestions: [],
    };
  } catch (error) {
    logger.error('Failed to analyze matching failures', { module: 'leadMatchingApi' }, error);
    throw new ApiError('analyzeMatchingFailures', error);
  }
}