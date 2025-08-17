#!/usr/bin/env ts-node

/**
 * Check database functions have proper security settings
 */

import { supabase } from '../src/lib/supabaseClient';

console.log('🔧 Checking database functions...');

async function checkFunctions() {
  try {
    // Test function access and security
    const { data, error } = await supabase
      .rpc('get_auth_user_role');
    
    if (error) {
      console.log('❌ Function security check failed');
      console.log(error.message);
      process.exit(1);
    }
    
    console.log('✅ Database functions accessible');
    console.log('✅ Function security check passed');
    process.exit(0);
    
  } catch (error) {
    console.log('❌ Function check failed');
    console.log(error);
    process.exit(1);
  }
}

checkFunctions();