#!/usr/bin/env tsx

/**
 * System Status Reporter - Comprehensive system health check
 * Used by VS Code debugging and CI/CD monitoring
 */

import { getEnv } from '../src/utils/env';
import { logger } from '../src/utils/logger';
import { validateEnvironment } from '../src/utils/envCheck';

interface SystemReport {
  timestamp: string;
  environment: {
    mode: string;
    logLevel: string;
    hasSupabase: boolean;
    flagCount: number;
  };
  runtime: {
    nodeVersion: string;
    platform: string;
    arch: string;
    uptime: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  health: {
    envValid: boolean;
    degradedMode: boolean;
    criticalErrors: string[];
    warnings: string[];
  };
}

class SystemStatusReporter {
  private env = getEnv();

  async generateReport(): Promise<SystemReport> {
    logger.info('📊 Genererer systemstatusrapport...');

    const envReport = validateEnvironment();
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal + memUsage.external;

    const report: SystemReport = {
      timestamp: new Date().toISOString(),
      environment: {
        mode: this.env.MODE,
        logLevel: this.env.LOG_LEVEL,
        hasSupabase: !!(this.env.SUPABASE_URL && this.env.SUPABASE_ANON_KEY),
        flagCount: Object.keys(this.env.FLAGS).length
      },
      runtime: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: Math.round(process.uptime())
      },
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(totalMem / 1024 / 1024),
        percentage: Math.round((memUsage.heapUsed / totalMem) * 100)
      },
      health: {
        envValid: envReport.ok,
        degradedMode: this.checkDegradedMode(),
        criticalErrors: this.findCriticalErrors(envReport),
        warnings: this.findWarnings(envReport)
      }
    };

    return report;
  }

  async printReport(): Promise<void> {
    const report = await this.generateReport();

    console.log('\n🏥 HOMNI SYSTEMSTATUS RAPPORT');
    console.log('═'.repeat(50));
    
    // Environment Status
    console.log('\n🌍 MILJØ:');
    console.log(`  Mode: ${report.environment.mode}`);
    console.log(`  Log Level: ${report.environment.logLevel}`);
    console.log(`  Supabase: ${report.environment.hasSupabase ? '✅ Tilkoblet' : '❌ Ikke konfigurert'}`);
    console.log(`  Feature Flags: ${report.environment.flagCount}`);

    // Runtime Status  
    console.log('\n⚡ RUNTIME:');
    console.log(`  Node.js: ${report.runtime.nodeVersion}`);
    console.log(`  Platform: ${report.runtime.platform} (${report.runtime.arch})`);
    console.log(`  Uptime: ${report.runtime.uptime}s`);

    // Memory Status
    console.log('\n🧠 MINNE:');
    console.log(`  Brukt: ${report.memory.used} MB`);
    console.log(`  Total: ${report.memory.total} MB`);
    console.log(`  Prosent: ${report.memory.percentage}%`);

    // Health Status
    console.log('\n🏥 HELSE:');
    console.log(`  Miljø gyldig: ${report.health.envValid ? '✅' : '❌'}`);
    console.log(`  Degraded mode: ${report.health.degradedMode ? '⚠️  Aktiv' : '✅ Normal'}`);

    if (report.health.criticalErrors.length > 0) {
      console.log('\n❌ KRITISKE FEIL:');
      report.health.criticalErrors.forEach(error => {
        console.log(`  • ${error}`);
      });
    }

    if (report.health.warnings.length > 0) {
      console.log('\n⚠️  ADVARSLER:');
      report.health.warnings.forEach(warning => {
        console.log(`  • ${warning}`);
      });
    }

    // Overall Status
    const isHealthy = report.health.envValid && 
                     !report.health.degradedMode && 
                     report.health.criticalErrors.length === 0;
    
    console.log('\n🎯 OVERALL STATUS:');
    if (isHealthy) {
      console.log('  ✅ SYSTEM KJØRER NORMALT');
    } else {
      console.log('  ⚠️  SYSTEM HAR PROBLEMER - SJEKK FEIL OG ADVARSLER');
    }

    console.log(`\n📅 Generert: ${report.timestamp}`);
    console.log('═'.repeat(50));

    // Log structured data for monitoring systems
    logger.info('📊 Systemstatusrapport generert', report);
  }

  private checkDegradedMode(): boolean {
    // Check various indicators of degraded mode
    try {
      // Check if localStorage indicates degraded mode (browser context)
      if (typeof window !== 'undefined' && window.localStorage) {
        return Boolean(window.localStorage.getItem('DEGRADED_MODE'));
      }
      
      // Check environment variables
      return Boolean(process.env.DEGRADED_MODE);
    } catch {
      return false;
    }
  }

  private findCriticalErrors(envReport: any): string[] {
    const errors: string[] = [];

    if (!envReport.ok) {
      errors.push(`Manglende miljøvariabler: ${envReport.missing.join(', ')}`);
    }

    if (!this.env.SUPABASE_URL && this.env.PROD) {
      errors.push('Supabase URL mangler i produksjon');
    }

    if (!this.env.SUPABASE_ANON_KEY && this.env.PROD) {
      errors.push('Supabase anon key mangler i produksjon');
    }

    return errors;
  }

  private findWarnings(envReport: any): string[] {
    const warnings: string[] = [];

    if (this.env.LOG_LEVEL === 'debug' && this.env.PROD) {
      warnings.push('Debug logging aktivert i produksjon');
    }

    if (this.env.DEV && !this.env.SUPABASE_URL) {
      warnings.push('Supabase ikke konfigurert i utviklingsmiljø');
    }

    if (Object.keys(this.env.FLAGS).length === 0) {
      warnings.push('Ingen feature flags definert');
    }

    return warnings;
  }
}

// CLI Entry Point
async function main() {
  const reporter = new SystemStatusReporter();
  
  try {
    await reporter.printReport();
  } catch (error) {
    logger.error('💥 System status rapport feilet:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { SystemStatusReporter };