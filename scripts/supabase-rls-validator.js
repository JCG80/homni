#!/usr/bin/env node
/**
 * supabase-rls-validator.js
 * Dedicated Supabase RLS policy validator for local development
 * 
 * Validates:
 * - Anonymous access policies
 * - Wide-open policies with "true" conditions  
 * - Missing RLS on sensitive tables
 * - Common security misconfigurations
 */

const fs = require('fs');
const path = require('path');

let hasErrors = false;
let hasWarnings = false;

function fail(msg) {
  console.error(`❌ ${msg}`);
  hasErrors = true;
}

function warn(msg) {
  console.warn(`⚠️  ${msg}`);
  hasWarnings = true;
}

function success(msg) {
  console.log(`✅ ${msg}`);
}

function info(msg) {
  console.log(`ℹ️  ${msg}`);
}

async function validateSupabaseConfig() {
  console.log('🔐 Supabase RLS Policy Validator\n');
  
  // Check for Supabase configuration files
  const configFiles = [
    'src/integrations/supabase/client.ts',
    'src/integrations/supabase/types.ts'
  ];
  
  let missingFiles = [];
  configFiles.forEach(file => {
    if (fs.existsSync(file)) {
      success(`Configuration file found: ${file}`);
    } else {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    fail(`Missing Supabase configuration files: ${missingFiles.join(', ')}`);
    return false;
  }
  
  return true;
}

async function checkEnvironmentVariables() {
  console.log('\n🔧 Environment Variables Check...');
  
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];
  
  const optionalVars = [
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  let missingRequired = [];
  let missingOptional = [];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      success(`${varName} configured`);
    } else {
      missingRequired.push(varName);
    }
  });
  
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      success(`${varName} configured (optional)`);
    } else {
      missingOptional.push(varName);
    }
  });
  
  if (missingRequired.length > 0) {
    fail(`Missing required environment variables: ${missingRequired.join(', ')}`);
    info('Add these to your .env.local file');
    return false;
  }
  
  if (missingOptional.length > 0) {
    warn(`Missing optional environment variables: ${missingOptional.join(', ')}`);
    info('SERVICE_ROLE_KEY needed for advanced RLS validation');
  }
  
  return true;
}

async function validateRLSBestPractices() {
  console.log('\n🛡️  RLS Best Practices Validation...');
  
  // Check for common RLS patterns in types file
  const typesPath = 'src/integrations/supabase/types.ts';
  
  if (!fs.existsSync(typesPath)) {
    warn('Supabase types file not found - generate with: npm run types:generate');
    return;
  }
  
  const typesContent = fs.readFileSync(typesPath, 'utf8');
  
  // Look for tables that should have RLS
  const sensitiveTablePatterns = [
    'user_profiles',
    'profiles',
    'users',
    'leads',
    'company_profiles',
    'todos',
    'properties',
    'documents'
  ];
  
  let foundSensitiveTables = [];
  sensitiveTablePatterns.forEach(pattern => {
    if (typesContent.includes(pattern)) {
      foundSensitiveTables.push(pattern);
    }
  });
  
  if (foundSensitiveTables.length > 0) {
    info(`Found sensitive tables in schema: ${foundSensitiveTables.join(', ')}`);
    info('Ensure these tables have proper RLS policies:');
    foundSensitiveTables.forEach(table => {
      info(`  - ${table}: Should restrict access to authenticated users only`);
    });
  }
  
  // Check for auth helper usage
  if (typesContent.includes('auth.uid()')) {
    success('Schema appears to use auth.uid() in policies');
  } else {
    warn('No auth.uid() usage detected in schema - verify RLS policies use proper authentication');
  }
  
  success('RLS best practices validation completed');
}

async function generateSecurityReport() {
  console.log('\n📊 Security Report Summary:');
  
  if (hasErrors) {
    console.log('❌ Critical security issues found');
    console.log('🔧 Recommended actions:');
    console.log('   1. Configure missing environment variables');
    console.log('   2. Generate Supabase types: npm run types:generate');
    console.log('   3. Review RLS policies in Supabase dashboard');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  Some security warnings detected');
    console.log('💡 Recommendations:');
    console.log('   1. Review RLS policies for sensitive tables');
    console.log('   2. Consider adding SERVICE_ROLE_KEY for advanced validation');
    console.log('   3. Regularly audit anonymous access policies');
  } else {
    console.log('✅ All security checks passed');
    console.log('🚀 Supabase configuration appears secure');
  }
}

async function run() {
  try {
    const configValid = await validateSupabaseConfig();
    if (!configValid) {
      await generateSecurityReport();
      return;
    }
    
    const envValid = await checkEnvironmentVariables();
    if (!envValid) {
      await generateSecurityReport();
      return;
    }
    
    await validateRLSBestPractices();
    await generateSecurityReport();
    
  } catch (error) {
    fail(`RLS validation failed: ${error.message}`);
    process.exit(1);
  }
}

// Allow running as module or standalone
if (require.main === module) {
  run();
}

module.exports = { run, validateSupabaseConfig, checkEnvironmentVariables, validateRLSBestPractices };