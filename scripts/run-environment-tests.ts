#!/usr/bin/env tsx

/**
 * Environment Testing Script
 * Validates all environment configurations and connections
 */

import { validateEnvironment } from './environment-validator';
import { runConnectionHealthCheck } from './connection-health-check';
import { checkAuthSync } from './check-auth-sync';

async function runAllEnvironmentTests(): Promise<void> {
  console.log('🔧 Running comprehensive environment tests...\n');

  let overallSuccess = true;

  try {
    // 1. Environment Variable Validation
    console.log('📋 Step 1: Environment Variable Validation');
    console.log('=' .repeat(50));
    const envResults = validateEnvironment();
    
    if (!envResults.valid) {
      console.error('❌ Environment validation failed');
      envResults.errors.forEach(error => console.error(`  • ${error}`));
      overallSuccess = false;
    } else {
      console.log('✅ Environment variables validated successfully');
    }

    if (envResults.warnings.length > 0) {
      console.warn('\n⚠️  Environment warnings:');
      envResults.warnings.forEach(warning => console.warn(`  • ${warning}`));
    }

    console.log('\n');

    // 2. Connection Health Check
    console.log('🔗 Step 2: Connection Health Check');
    console.log('=' .repeat(50));
    
    try {
      await runConnectionHealthCheck();
      console.log('✅ Connection health check completed');
    } catch (error) {
      console.error('❌ Connection health check failed:', error);
      overallSuccess = false;
    }

    console.log('\n');

    // 3. Auth Sync Check
    console.log('🔐 Step 3: Authentication Sync Check');
    console.log('=' .repeat(50));
    
    try {
      await checkAuthSync();
      console.log('✅ Auth sync check completed');
    } catch (error) {
      console.error('❌ Auth sync check failed:', error);
      overallSuccess = false;
    }

    console.log('\n');

    // Final Results
    console.log('📊 Environment Test Results');
    console.log('=' .repeat(50));
    
    if (overallSuccess) {
      console.log('🎉 ALL ENVIRONMENT TESTS PASSED!');
      console.log('✅ Environment is properly configured and all connections are healthy');
    } else {
      console.error('💥 SOME TESTS FAILED!');
      console.error('❌ Please review the errors above and fix the issues');
    }

  } catch (error) {
    console.error('💥 Environment testing failed:', error);
    overallSuccess = false;
  }

  // Exit with appropriate code
  process.exit(overallSuccess ? 0 : 1);
}

// Run tests when script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllEnvironmentTests().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export { runAllEnvironmentTests };