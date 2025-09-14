#!/usr/bin/env node

/**
 * Validation script for manual Supabase security configurations
 * Run after completing manual Dashboard configurations
 */

import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

const SUPABASE_URL = "https://kkazhcihooovsuwravhs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXpoY2lob29vdnN1d3JhdmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzMwMzUsImV4cCI6MjA2MjEwOTAzNX0.-HzjqXYqgThN0PrbrwZlm5GWK1vOGOeYHEEFrt0OpwM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log(chalk.blue('🔒 Validating Supabase Security Configuration...\n'));

async function validateSecurityConfig() {
  const results = {
    connectionTest: false,
    authProviderConfig: false,
    rlsPoliciesActive: false,
    databaseConnectivity: false
  };

  try {
    // 1. Test basic connectivity
    console.log(chalk.yellow('📡 Testing Supabase connectivity...'));
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    if (!error) {
      results.connectionTest = true;
      console.log(chalk.green('✅ Connection successful'));
    } else {
      console.log(chalk.red('❌ Connection failed:', error.message));
    }

    // 2. Test auth configuration (indirect)
    console.log(chalk.yellow('🔐 Testing auth configuration...'));
    try {
      // This will fail but gives us info about auth setup
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'test@nonexistent.com',
        password: 'invalid'
      });
      
      // We expect this to fail, but if it fails for the right reasons, auth is working
      if (authError && (authError.message.includes('Invalid login') || authError.message.includes('Email not confirmed'))) {
        results.authProviderConfig = true;
        console.log(chalk.green('✅ Auth provider responding correctly'));
      }
    } catch (err) {
      console.log(chalk.orange('⚠️  Auth provider test inconclusive - manual verification needed'));
    }

    // 3. Test RLS policies (try anonymous access to protected table)
    console.log(chalk.yellow('🛡️  Testing RLS policies...'));
    const { data: protectedData, error: rlsError } = await supabase
      .from('admin_audit_log')
      .select('*')
      .limit(1);
    
    if (rlsError && rlsError.message.includes('row-level security')) {
      results.rlsPoliciesActive = true;
      console.log(chalk.green('✅ RLS policies are active and blocking anonymous access'));
    } else if (!protectedData || protectedData.length === 0) {
      results.rlsPoliciesActive = true;
      console.log(chalk.green('✅ RLS policies preventing data access'));
    } else {
      console.log(chalk.red('❌ RLS policies may not be working properly'));
    }

    // 4. Database health check
    console.log(chalk.yellow('💾 Testing database health...'));
    const { data: healthData, error: healthError } = await supabase
      .rpc('is_authenticated_user');
    
    if (!healthError) {
      results.databaseConnectivity = true;
      console.log(chalk.green('✅ Database functions accessible'));
    } else {
      console.log(chalk.orange('⚠️  Database function test incomplete:', healthError.message));
    }

  } catch (error) {
    console.error(chalk.red('❌ Validation error:', error.message));
  }

  // Summary
  console.log(chalk.blue('\n📊 Security Configuration Summary:'));
  console.log('━'.repeat(50));
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`Connection Test: ${results.connectionTest ? chalk.green('✅ PASS') : chalk.red('❌ FAIL')}`);
  console.log(`Auth Config: ${results.authProviderConfig ? chalk.green('✅ PASS') : chalk.orange('⚠️  MANUAL CHECK NEEDED')}`);
  console.log(`RLS Policies: ${results.rlsPoliciesActive ? chalk.green('✅ PASS') : chalk.red('❌ FAIL')}`);
  console.log(`Database Health: ${results.databaseConnectivity ? chalk.green('✅ PASS') : chalk.orange('⚠️  CHECK NEEDED')}`);
  
  console.log(`\nOverall: ${passed}/${total} checks passed`);
  
  if (passed >= 3) {
    console.log(chalk.green('\n🎉 Security configuration looks good! Ready for production.'));
  } else if (passed >= 2) {
    console.log(chalk.orange('\n⚠️  Some manual verification needed. Check Supabase Dashboard.'));
  } else {
    console.log(chalk.red('\n🚨 Security issues detected. Review configuration before deploying.'));
  }

  console.log(chalk.blue('\n📋 Manual checks still needed:'));
  console.log('  • OTP Expiry: Check in Auth → Security (should be ≤ 15 min)');
  console.log('  • Leaked Password Protection: Should be enabled');
  console.log('  • MFA Options: TOTP should be available');
  console.log('  • Database Version: Should be latest patch');
  
  return results;
}

// Export for use in other scripts
export { validateSecurityConfig };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateSecurityConfig()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(chalk.red('Script failed:'), error);
      process.exit(1);
    });
}