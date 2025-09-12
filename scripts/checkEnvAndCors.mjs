#!/usr/bin/env node

/**
 * Environment and CORS validation script
 * Runs before build to ensure proper configuration
 */

import assert from 'node:assert';

async function checkEnvironmentVariables() {
  console.log('🔍 Checking environment variables...');
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  for (const varName of requiredVars) {
    assert(process.env[varName], `❌ Missing required environment variable: ${varName}`);
    console.log(`✅ ${varName} is set`);
  }
}

async function checkCORS() {
  console.log('🌐 Testing CORS preflight to Supabase...');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Cannot test CORS - missing Supabase credentials');
    process.exit(1);
  }
  
  try {
    const url = `${supabaseUrl}/rest/v1/`;
    const response = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.warn(`⚠️ CORS preflight returned: ${response.status} ${response.statusText}`);
    } else {
      console.log('✅ CORS preflight successful');
    }
  } catch (error) {
    console.error('❌ CORS preflight failed:', error.message);
    process.exit(1);
  }
}

async function checkRouterMode() {
  console.log('🛣️ Checking router configuration...');
  
  const routerMode = process.env.VITE_ROUTER_MODE;
  console.log(`Router mode: ${routerMode || 'browser (default)'}`);
  
  if (routerMode === 'hash') {
    console.log('✅ Hash router mode configured for preview deployment');
  } else {
    console.log('✅ Browser router mode - ensure rewrites are configured for production');
  }
}

async function main() {
  try {
    console.log('🚀 Starting environment and CORS validation...\n');
    
    await checkEnvironmentVariables();
    console.log();
    
    await checkCORS();
    console.log();
    
    await checkRouterMode();
    console.log();
    
    console.log('🎉 All environment and CORS checks passed!');
  } catch (error) {
    console.error('\n💥 Validation failed:', error.message);
    process.exit(1);
  }
}

main();