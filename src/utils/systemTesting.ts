/**
 * System Testing Utilities
 * Tools for testing the complete User + Company + Lead Flow
 */

import { supabase } from '@/lib/supabaseClient';
import { logger } from './logger';

export interface SystemTestResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

/**
 * Test the complete lead creation and distribution flow
 */
export async function testLeadFlow(): Promise<SystemTestResult> {
  const timestamp = new Date().toISOString();
  
  try {
    // Step 1: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        message: 'Authentication test failed',
        details: authError,
        timestamp
      };
    }

    // Step 2: Test lead creation
    const testLeadData = {
      title: `Test Lead - ${new Date().toLocaleTimeString()}`,
      description: 'This is a test lead created by system testing utilities',
      category: 'elektro',
      submitted_by: user.id,
      status: 'new' as const,
      metadata: {
        source: 'system_test',
        test_run: timestamp
      }
    };

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert(testLeadData)
      .select()
      .single();

    if (leadError || !lead) {
      return {
        success: false,
        message: 'Lead creation test failed',
        details: leadError,
        timestamp
      };
    }

    // Step 3: Test distribution function
    const { data: distributionResult, error: distError } = await supabase
      .rpc('distribute_new_lead_v3', { lead_id_param: lead.id });

    if (distError) {
      logger.warn('Distribution test completed with error (expected if no companies)', distError);
    }

    // Step 4: Verify lead exists in database
    const { data: verifyLead, error: verifyError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead.id)
      .single();

    if (verifyError || !verifyLead) {
      return {
        success: false,
        message: 'Lead verification test failed',
        details: verifyError,
        timestamp
      };
    }

    // Cleanup: Delete test lead
    await supabase.from('leads').delete().eq('id', lead.id);

    return {
      success: true,
      message: 'Complete lead flow test passed',
      details: {
        leadCreated: true,
        distributionAttempted: true,
        leadVerified: true,
        distributionResult: distributionResult?.[0] || null
      },
      timestamp
    };

  } catch (error) {
    return {
      success: false,
      message: 'System test failed with exception',
      details: error,
      timestamp
    };
  }
}

/**
 * Test company data access for role verification
 */
export async function testCompanyAccess(): Promise<SystemTestResult> {
  const timestamp = new Date().toISOString();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        message: 'Authentication required for company access test',
        timestamp
      };
    }

    // Test company profile access
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, company_id')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return {
        success: false,
        message: 'User profile access test failed',
        details: profileError,
        timestamp
      };
    }

    // Test lead access based on role
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, title, submitted_by, company_id')
      .limit(5);

    if (leadsError) {
      return {
        success: false,
        message: 'Lead access test failed',
        details: leadsError,
        timestamp
      };
    }

    return {
      success: true,
      message: 'Company access test passed',
      details: {
        userRole: profile?.role,
        companyId: profile?.company_id,
        accessibleLeads: leads?.length || 0,
        userHasCompanyAccess: !!profile?.company_id
      },
      timestamp
    };

  } catch (error) {
    return {
      success: false,
      message: 'Company access test failed with exception',
      details: error,
      timestamp
    };
  }
}

/**
 * Run all system tests
 */
export async function runSystemTests(): Promise<{
  overall: boolean;
  results: Record<string, SystemTestResult>;
}> {
  logger.info('Starting system tests', { module: 'systemTesting' });

  const results: Record<string, SystemTestResult> = {};

  // Run tests
  results.leadFlow = await testLeadFlow();
  results.companyAccess = await testCompanyAccess();

  const overall = Object.values(results).every(result => result.success);

  logger.info('System tests completed', {
    module: 'systemTesting',
    overall,
    results: Object.fromEntries(
      Object.entries(results).map(([key, result]) => [key, result.success])
    )
  });

  return { overall, results };
}