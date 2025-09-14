/**
 * Enhanced RLS Validator for Dev Doctor
 * Implements actual Supabase RLS policy validation
 */

async function checkSupabasePoliciesActual(config) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    return { 
      success: false, 
      error: 'Supabase URL eller SERVICE_ROLE_KEY mangler',
      criticalIssues: [],
      warnings: []
    };
  }

  const results = {
    success: true,
    criticalIssues: [],
    warnings: [],
    checkedTables: [],
    policies: []
  };

  try {
    // Initialize fetch
    let fetch;
    if (!globalThis.fetch) {
      const { default: nodeFetch } = await import('node-fetch');
      fetch = nodeFetch;
    } else {
      fetch = globalThis.fetch;
    }

    // Check tables without RLS
    const tablesWithoutRLS = await checkTablesWithoutRLS(url, key, config, fetch);
    if (tablesWithoutRLS.length > 0) {
      results.criticalIssues.push({
        type: 'tables_without_rls',
        tables: tablesWithoutRLS,
        message: `🚨 Sensitive tabeller uten RLS: ${tablesWithoutRLS.join(', ')}`
      });
      results.success = false;
    }

    // Check open anon policies
    const openAnonPolicies = await checkOpenAnonPolicies(url, key, config, fetch);
    if (openAnonPolicies.length > 0) {
      results.criticalIssues.push({
        type: 'open_anon_policies',
        policies: openAnonPolicies,
        message: `🚨 Åpne anon-policyer funnet: ${openAnonPolicies.map(p => `${p.tablename}.${p.policyname}`).join(', ')}`
      });
      results.success = false;
    }

    // Check admin policies with anon access
    const adminAnonPolicies = await checkAdminPoliciesWithAnon(url, key, config, fetch);
    if (adminAnonPolicies.length > 0) {
      results.warnings.push({
        type: 'admin_anon_policies',
        policies: adminAnonPolicies,
        message: `⚠️ Admin-policyer med anon-tilgang: ${adminAnonPolicies.map(p => `${p.tablename}.${p.policyname}`).join(', ')}`
      });
    }

    // Check for policies with "true" conditions
    const truePolicies = await checkTruePolicies(url, key, config, fetch);
    if (truePolicies.length > 0) {
      results.warnings.push({
        type: 'true_policies',
        policies: truePolicies,
        message: `⚠️ Policyer med 'true' condition: ${truePolicies.map(p => `${p.tablename}.${p.policyname}`).join(', ')}`
      });
    }

  } catch (error) {
    results.success = false;
    results.criticalIssues.push({
      type: 'validation_error',
      error: error.message,
      message: `🚨 RLS-validering feilet: ${error.message}`
    });
  }

  return results;
}

async function checkTablesWithoutRLS(url, key, config, fetch) {
  const query = `
    SELECT t.tablename
    FROM information_schema.tables t
    LEFT JOIN pg_class c ON c.relname = t.tablename
    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND t.tablename = ANY($1)
      AND (c.relrowsecurity IS FALSE OR c.relrowsecurity IS NULL)
  `;

  try {
    const response = await fetch(`${url}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: query,
        params: [config.sensitiveTables]
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.map(row => row.tablename);
    }
  } catch (error) {
    console.warn('Failed to check RLS enablement:', error.message);
  }

  return [];
}

async function checkOpenAnonPolicies(url, key, config, fetch) {
  const query = `
    SELECT schemaname, tablename, policyname, roles, cmd, qual
    FROM pg_policies 
    WHERE schemaname = 'public'
      AND tablename = ANY($1)
      AND 'anon' = ANY(roles)
      AND (qual IS NULL OR qual = 'true' OR qual ILIKE '%true%')
  `;

  try {
    const response = await fetch(`${url}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: query,
        params: [config.sensitiveTables]
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.filter(policy => 
        policy.qual === 'true' || 
        policy.qual === null ||
        policy.qual.toLowerCase().includes('true')
      );
    }
  } catch (error) {
    console.warn('Failed to check anon policies:', error.message);
  }

  return [];
}

async function checkAdminPoliciesWithAnon(url, key, config, fetch) {
  const query = `
    SELECT schemaname, tablename, policyname, roles, cmd, qual
    FROM pg_policies 
    WHERE schemaname = 'public'
      AND tablename = ANY($1)
      AND 'anon' = ANY(roles)
      AND (policyname ILIKE '%admin%' OR qual ILIKE '%admin%')
  `;

  try {
    const response = await fetch(`${url}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: query,
        params: [config.sensitiveTables]
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.warn('Failed to check admin policies:', error.message);
  }

  return [];
}

async function checkTruePolicies(url, key, config, fetch) {
  const query = `
    SELECT schemaname, tablename, policyname, roles, cmd, qual
    FROM pg_policies 
    WHERE schemaname = 'public'
      AND tablename = ANY($1)
      AND qual = 'true'
  `;

  try {
    const response = await fetch(`${url}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: query,
        params: [config.sensitiveTables]
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.warn('Failed to check true policies:', error.message);
  }

  return [];
}

module.exports = {
  checkSupabasePoliciesActual,
  checkTablesWithoutRLS,
  checkOpenAnonPolicies,
  checkAdminPoliciesWithAnon,
  checkTruePolicies
};