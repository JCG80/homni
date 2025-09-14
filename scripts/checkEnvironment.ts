#!/usr/bin/env tsx

/**
 * Environment Configuration Validator
 * Validates API configuration and environment setup
 */

import { getApiStatus, getEnvironmentConfig } from '../src/services/apiStatus';

const validateEnvironment = () => {
  console.log('🔍 Validerer API-konfigurasjon...\n');
  
  const status = getApiStatus();
  const config = getEnvironmentConfig();
  
  // Display configuration status
  console.log('📋 Miljøvariabler:');
  console.log(`  VITE_SUPABASE_URL: ${config.supabaseUrl ? '✅ Satt' : '❌ Mangler'}`);
  console.log(`  VITE_SUPABASE_ANON_KEY: ${config.supabaseAnonKey ? '✅ Satt' : '❌ Mangler'}`);
  console.log('');
  
  // Display API status
  if (status.isOperational) {
    console.log('✅ API er operativt og klargjort for bruk');
    
    if (status.warnings.length > 0) {
      console.log('\n⚠️  Advarsler:');
      status.warnings.forEach(warning => {
        console.log(`  • ${warning}`);
      });
    }
    
    console.log('\n🚀 Systemet er klargjort for produksjon');
    process.exit(0);
  } else {
    console.log('⚠️  API er ikke operativt');
    console.log(`   ${status.message}`);
    
    if (status.missingConfigs.length > 0) {
      console.log('\n📝 Manglende konfigurasjoner:');
      status.missingConfigs.forEach(config => {
        console.log(`  • ${config}`);
      });
      
      console.log('\n🔧 Slik løser du dette:');
      console.log('  1. Gå til Lovable Environment-seksjonen');
      console.log('  2. Legg til de manglende miljøvariablene');
      console.log('  3. Redeploy prosjektet for å aktivere endringene');
      console.log('\n📚 Les mer i API_SETUP.md');
    }
    
    // Exit with 0 to not fail builds, but show warning
    process.exit(0);
  }
};

// Run validation
validateEnvironment();