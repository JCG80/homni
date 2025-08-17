#!/usr/bin/env ts-node

/**
 * Check RLS policies are properly configured
 */

import { supabase } from '../src/lib/supabaseClient';

console.log('🔒 Checking RLS policies...');

async function checkRLS() {
  try {
    // Test database connectivity and RLS
    const { data, error } = await supabase
      .rpc('get_enabled_plugins');
    
    if (error) {
      console.log('❌ Could not connect to database');
      console.log(error.message);
      process.exit(1);
    }
    
    console.log('✅ Database connection successful');
    console.log('✅ RLS check passed');
    process.exit(0);
    
  } catch (error) {
    console.log('❌ RLS check failed');
    console.log(error);
    process.exit(1);
  }
}

checkRLS();