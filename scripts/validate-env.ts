import { getEnv } from '@/utils/env';
import { logger } from '@/utils/logger';

/**
 * Environment validation script for CI/CD pipeline
 * Uses our unified environment system and logger
 */
function validateEnvironment() {
  try {
    const env = getEnv();
    const missing: string[] = [];
    const warnings: string[] = [];

    // Critical environment variables
    if (!env.SUPABASE_URL) {
      missing.push('VITE_SUPABASE_URL');
    }
    if (!env.SUPABASE_ANON_KEY) {
      missing.push('VITE_SUPABASE_ANON_KEY');
    }

    // Non-critical warnings
    if (env.LOG_LEVEL === 'debug' && env.PROD) {
      warnings.push('DEBUG logging enabled in production mode');
    }

    // Report results
    if (missing.length > 0) {
      logger.error('❌ Missing required environment variables', {
        missing,
        mode: env.MODE,
        context: 'CI validation'
      });
      console.error('Missing variables:', missing.join(', '));
      process.exit(1);
    }

    if (warnings.length > 0) {
      logger.warn('⚠️ Environment warnings detected', {
        warnings,
        mode: env.MODE
      });
    }

    logger.info('✅ Environment validated successfully', {
      mode: env.MODE,
      logLevel: env.LOG_LEVEL,
      hasSupabase: !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
      flagCount: Object.keys(env.FLAGS).length
    });

    console.log(`✅ Environment validation passed (${env.MODE} mode)`);
    
  } catch (error) {
    logger.error('❌ Environment validation failed', { error: String(error) });
    console.error('Validation error:', error);
    process.exit(1);
  }
}

// Run validation
validateEnvironment();