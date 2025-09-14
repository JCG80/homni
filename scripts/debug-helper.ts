#!/usr/bin/env tsx

/**
 * HOMNI Debug Helper - Comprehensive debugging utility
 * Usage: npm run debug:helper [command]
 */

import { getEnv } from '../src/utils/env';
import { logger } from '../src/utils/logger';
import { validateEnvironment } from '../src/utils/envCheck';

type DebugCommand = 'all' | 'auth' | 'db' | 'env' | 'status' | 'help';

class DebugHelper {
  private env = getEnv();

  async run(command: DebugCommand = 'all') {
    logger.info(`🩺 HOMNI Debug Helper - Kommando: ${command}`);
    
    switch (command) {
      case 'all':
        await this.runAllChecks();
        break;
      case 'auth':
        await this.checkAuth();
        break;
      case 'db':
        await this.checkDatabase();
        break;
      case 'env':
        await this.checkEnvironment();
        break;
      case 'status':
        await this.checkSystemStatus();
        break;
      case 'help':
        this.showHelp();
        break;
      default:
        logger.error(`Ukjent kommando: ${command}`);
        this.showHelp();
        process.exit(1);
    }
  }

  private async runAllChecks() {
    logger.info('🔍 Kjører alle systemsjekker...');
    
    const checks = [
      { name: 'Miljø', fn: () => this.checkEnvironment() },
      { name: 'Database', fn: () => this.checkDatabase() },
      { name: 'Auth', fn: () => this.checkAuth() },
      { name: 'System Status', fn: () => this.checkSystemStatus() }
    ];

    for (const check of checks) {
      try {
        logger.info(`\n📋 ${check.name}:`);
        await check.fn();
        logger.info(`✅ ${check.name} OK`);
      } catch (error) {
        logger.error(`❌ ${check.name} feilet:`, error);
      }
    }

    logger.info('\n🏁 Alle sjekker fullført');
  }

  private async checkEnvironment() {
    const report = validateEnvironment();
    
    logger.info('🔧 Miljørapport:', {
      mode: this.env.MODE,
      logLevel: this.env.LOG_LEVEL,
      hasSupabase: !!(this.env.SUPABASE_URL && this.env.SUPABASE_ANON_KEY),
      flags: Object.keys(this.env.FLAGS).length
    });

    if (!report.ok) {
      logger.warn('⚠️  Manglende miljøvariabler:', report.missing);
      return false;
    }

    logger.info('✅ Miljø validert');
    return true;
  }

  private async checkDatabase() {
    logger.info('🗄️  Sjekker database-tilkobling...');

    if (!this.env.SUPABASE_URL || !this.env.SUPABASE_ANON_KEY) {
      logger.warn('⚠️  Supabase ikke konfigurert');
      return false;
    }

    try {
      // Basic Supabase connection test (without importing actual Supabase)
      const response = await fetch(`${this.env.SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': this.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${this.env.SUPABASE_ANON_KEY}`
        }
      });

      if (response.ok) {
        logger.info('✅ Supabase tilkobling OK');
        return true;
      } else {
        logger.warn('⚠️  Supabase tilkobling feilet:', response.statusText);
        return false;
      }
    } catch (error) {
      logger.error('❌ Database sjekk feilet:', error);
      return false;
    }
  }

  private async checkAuth() {
    logger.info('🔐 Sjekker autentisering...');

    if (!this.env.SUPABASE_URL || !this.env.SUPABASE_ANON_KEY) {
      logger.warn('⚠️  Auth ikke tilgjengelig uten Supabase');
      return false;
    }

    try {
      // Check auth endpoint
      const response = await fetch(`${this.env.SUPABASE_URL}/auth/v1/settings`, {
        headers: {
          'apikey': this.env.SUPABASE_ANON_KEY
        }
      });

      if (response.ok) {
        const settings = await response.json();
        logger.info('✅ Auth-endepunkt tilgjengelig:', {
          external_email_enabled: settings.external?.email,
          external_phone_enabled: settings.external?.phone
        });
        return true;
      } else {
        logger.warn('⚠️  Auth-endepunkt ikke tilgjengelig');
        return false;
      }
    } catch (error) {
      logger.error('❌ Auth sjekk feilet:', error);
      return false;
    }
  }

  private async checkSystemStatus() {
    logger.info('📊 Sjekker systemstatus...');

    const status = {
      timestamp: new Date().toISOString(),
      mode: this.env.MODE,
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      cwd: process.cwd()
    };

    logger.info('📋 Systeminfo:', status);

    // Check if we're in degraded mode
    const degraded = Boolean(
      typeof window !== 'undefined' && 
      window.localStorage?.getItem('DEGRADED_MODE')
    );

    if (degraded) {
      logger.warn('⚠️  System kjører i degraded mode');
    } else {
      logger.info('✅ System kjører normalt');
    }

    return true;
  }

  private showHelp() {
    console.log(`
🩺 HOMNI Debug Helper

Tilgjengelige kommandoer:
  all     - Kjør alle systemsjekker (standard)
  auth    - Sjekk autentisering og Supabase auth
  db      - Sjekk database-tilkobling 
  env     - Valider miljøkonfiguration
  status  - Vis systemstatus og performance
  help    - Vis denne hjelpeteksten

Eksempler:
  npm run debug:helper all
  npm run debug:helper auth
  tsx scripts/debug-helper.ts env

Environment: ${this.env.MODE}
Log Level: ${this.env.LOG_LEVEL}
`);
  }
}

// CLI Entry Point
async function main() {
  const command = (process.argv[2] as DebugCommand) || 'all';
  const helper = new DebugHelper();
  
  try {
    await helper.run(command);
    logger.info('🎯 Debug helper fullført');
  } catch (error) {
    logger.error('💥 Debug helper feilet:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { DebugHelper };