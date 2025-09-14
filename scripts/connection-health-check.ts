#!/usr/bin/env tsx

/**
 * Connection Health Check - validates all system connections
 * Tests database, API gateway, and frontend configurations
 */

import { createClient } from '@supabase/supabase-js';
import { validateEnvironment } from './environment-validator';

interface ConnectionHealth {
  component: string;
  status: 'healthy' | 'degraded' | 'failed';
  responseTime?: number;
  error?: string;
  details?: Record<string, any>;
}

async function checkSupabaseConnection(): Promise<ConnectionHealth> {
  const start = Date.now();
  
  try {
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kkazhcihooovsuwravhs.supabase.co";
    const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXpoY2lob29vdnN1d3JhdmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzMwMzUsImV4cCI6MjA2MjEwOTAzNX0.-HzjqXYqgThN0PrbrwZlm5GWK1vOGOeYHEEFrt0OpwM";
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test basic connectivity with a simple query
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count', { count: 'exact' })
      .limit(0);
      
    const responseTime = Date.now() - start;
    
    if (error) {
      return {
        component: 'Supabase Database',
        status: 'failed',
        responseTime,
        error: error.message,
        details: { code: error.code, hint: error.hint }
      };
    }
    
    return {
      component: 'Supabase Database',
      status: responseTime < 500 ? 'healthy' : 'degraded',
      responseTime,
      details: { url: SUPABASE_URL }
    };
    
  } catch (error) {
    return {
      component: 'Supabase Database',
      status: 'failed',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function checkAPIGatewayConfig(): Promise<ConnectionHealth> {
  try {
    // Basic configuration validation for API Gateway
    const requiredVars = [
      'DATABASE_URL',
      'SUPABASE_JWKS_URL'
    ];
    
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      return {
        component: 'API Gateway Config',
        status: 'failed',
        error: `Missing required environment variables: ${missing.join(', ')}`
      };
    }
    
    return {
      component: 'API Gateway Config',
      status: 'healthy',
      details: {
        database_url_set: !!process.env.DATABASE_URL,
        jwks_url_set: !!process.env.SUPABASE_JWKS_URL,
        cors_origins_set: !!process.env.CORS_ALLOW_ORIGINS
      }
    };
    
  } catch (error) {
    return {
      component: 'API Gateway Config',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Configuration check failed'
    };
  }
}

async function runConnectionHealthCheck(): Promise<void> {
  console.log('🏥 Running Connection Health Check...\n');
  
  // First validate environment
  console.log('1. Validating Environment Variables...');
  const envResult = validateEnvironment();
  if (!envResult.valid) {
    console.log('❌ Environment validation failed - skipping connection tests');
    process.exit(1);
  }
  console.log('✅ Environment variables valid\n');
  
  // Test connections
  const checks = await Promise.all([
    checkSupabaseConnection(),
    checkAPIGatewayConfig()
  ]);
  
  console.log('📊 Connection Health Results:');
  console.log('=' .repeat(50));
  
  let overallHealth = 'healthy';
  
  checks.forEach((check, index) => {
    const statusIcon = {
      'healthy': '✅',
      'degraded': '⚠️',
      'failed': '❌'
    }[check.status];
    
    console.log(`${statusIcon} ${check.component}: ${check.status.toUpperCase()}`);
    
    if (check.responseTime) {
      console.log(`   Response Time: ${check.responseTime}ms`);
    }
    
    if (check.error) {
      console.log(`   Error: ${check.error}`);
    }
    
    if (check.details) {
      console.log(`   Details: ${JSON.stringify(check.details, null, 2)}`);
    }
    
    console.log('');
    
    if (check.status === 'failed') {
      overallHealth = 'failed';
    } else if (check.status === 'degraded' && overallHealth !== 'failed') {
      overallHealth = 'degraded';
    }
  });
  
  console.log('=' .repeat(50));
  console.log(`🎯 Overall System Health: ${overallHealth.toUpperCase()}`);
  
  if (overallHealth === 'failed') {
    console.log('🚨 Critical issues detected - system may not function properly');
    process.exit(1);
  } else if (overallHealth === 'degraded') {
    console.log('⚠️  Some components are degraded - monitor closely');
  } else {
    console.log('✅ All systems operational');
  }
}

// Run if called directly
if (require.main === module) {
  runConnectionHealthCheck()
    .then(() => {
      console.log('\n🏁 Connection health check completed');
    })
    .catch((error) => {
      console.error('\n❌ Connection health check failed:', error);
      process.exit(1);
    });
}

export { runConnectionHealthCheck };