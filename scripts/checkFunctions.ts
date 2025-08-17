#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || "https://kkazhcihooovsuwravhs.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkFunctions(): Promise<void> {
  try {
    // Query all functions in public schema
    const { data: functions, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          routine_name,
          security_type,
          routine_definition
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_type = 'FUNCTION'
        ORDER BY routine_name;
      `
    });

    if (error) {
      console.error('❌ Error querying functions:', error);
      process.exit(1);
    }

    if (!functions || functions.length === 0) {
      console.log('✅ No custom functions found in public schema');
      return;
    }

    let hasIssues = false;

    for (const func of functions) {
      const { routine_name, security_type, routine_definition } = func;
      
      // Check if function is SECURITY DEFINER
      if (security_type !== 'DEFINER') {
        console.error(`❌ Function ${routine_name} is not SECURITY DEFINER`);
        hasIssues = true;
      }
      
      // Check if function sets search_path
      const hasSearchPath = routine_definition.includes('SET search_path') || 
                           routine_definition.includes('set search_path');
      
      if (!hasSearchPath) {
        console.error(`❌ Function ${routine_name} does not set search_path`);
        hasIssues = true;
      }
    }

    if (hasIssues) {
      console.error('\n❌ Function security issues found. All functions should be:');
      console.error('  - SECURITY DEFINER');
      console.error('  - SET search_path = public');
      process.exit(1);
    } else {
      console.log(`✅ All ${functions.length} functions have proper security settings`);
    }

  } catch (error) {
    console.error('❌ Error checking functions:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  checkFunctions().catch(console.error);
}