#!/usr/bin/env tsx

/**
 * Environment validation script
 * Ensures all required environment variables are properly configured
 */

interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
  errors: string[];
}

const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const OPTIONAL_ENV_VARS = [
  'DATABASE_URL',
  'SUPABASE_JWKS_URL',
  'CORS_ALLOW_ORIGINS',
  'API_RATE_LIMIT_PER_MIN',
  'HMAC_OUTBOUND_SECRET'
];

function validateEnvironment(): EnvValidationResult {
  const result: EnvValidationResult = {
    valid: true,
    missing: [],
    warnings: [],
    errors: []
  };

  console.log('🔍 Validating environment configuration...');

  // Check required variables
  REQUIRED_ENV_VARS.forEach(varName => {
    const value = process.env[varName];
    if (!value || value === 'undefined' || value === 'null') {
      result.missing.push(varName);
      result.errors.push(`Missing required environment variable: ${varName}`);
      result.valid = false;
    } else {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    }
  });

  // Check optional variables
  OPTIONAL_ENV_VARS.forEach(varName => {
    const value = process.env[varName];
    if (!value || value === 'undefined' || value === 'null') {
      result.warnings.push(`Optional environment variable not set: ${varName}`);
    } else {
      console.log(`ℹ️  ${varName}: ${value.substring(0, 20)}...`);
    }
  });

  // Validate Supabase URL format
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.match(/^https:\/\/[a-z0-9]+\.supabase\.co$/)) {
    result.errors.push('VITE_SUPABASE_URL format appears invalid');
    result.valid = false;
  }

  // Validate anon key format (JWT)
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (anonKey && !anonKey.match(/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/)) {
    result.warnings.push('VITE_SUPABASE_ANON_KEY format appears invalid (should be JWT)');
  }

  return result;
}

function printResults(result: EnvValidationResult) {
  console.log('\n📋 Environment Validation Results:');
  
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  if (result.valid) {
    console.log('\n✅ Environment validation passed!');
  } else {
    console.log('\n❌ Environment validation failed!');
    console.log('\nPlease ensure all required environment variables are set in your .env file or environment.');
  }
}

// Run if called directly
if (require.main === module) {
  const result = validateEnvironment();
  printResults(result);
  process.exit(result.valid ? 0 : 1);
}

export { validateEnvironment };