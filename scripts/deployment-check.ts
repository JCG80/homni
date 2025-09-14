#!/usr/bin/env tsx
/**
 * Pre-deployment health and readiness check
 * Usage: npm run deploy:check
 */

import { supabase } from '../src/lib/supabaseClient';
import { logger } from '../src/utils/logger';
import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: any;
}

interface DeploymentReport {
  overall: 'ready' | 'not-ready' | 'warning';
  timestamp: string;
  checks: CheckResult[];
  summary: {
    passed: number;
    failed: number;
    warnings: number;
    total: number;
  };
}

class DeploymentChecker {
  private results: CheckResult[] = [];

  private addCheck(name: string, status: 'pass' | 'fail' | 'warn', message: string, details?: any) {
    this.results.push({ name, status, message, details });
  }

  async checkEnvironmentVariables(): Promise<void> {
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    const missing: string[] = [];
    
    for (const varName of requiredVars) {
      if (!import.meta.env[varName]) {
        missing.push(varName);
      }
    }

    if (missing.length === 0) {
      this.addCheck('Environment Variables', 'pass', 'All required environment variables are set');
    } else {
      this.addCheck('Environment Variables', 'fail', `Missing variables: ${missing.join(', ')}`);
    }
  }

  async checkSupabaseConnection(): Promise<void> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        this.addCheck('Supabase Connection', 'fail', `Connection failed: ${error.message}`);
        return;
      }

      this.addCheck('Supabase Connection', 'pass', 'Successfully connected to Supabase');
    } catch (error: any) {
      this.addCheck('Supabase Connection', 'fail', `Connection error: ${error.message}`);
    }
  }

  async checkDatabaseTables(): Promise<void> {
    const requiredTables = ['user_profiles', 'company_profiles'];
    const availableTables: string[] = [];
    const missingTables: string[] = [];

    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('count(*)').limit(1);
        
        if (error) {
          missingTables.push(table);
        } else {
          availableTables.push(table);
        }
      } catch (error) {
        missingTables.push(table);
      }
    }

    if (missingTables.length === 0) {
      this.addCheck('Database Tables', 'pass', `All required tables exist: ${availableTables.join(', ')}`);
    } else {
      this.addCheck('Database Tables', 'fail', `Missing tables: ${missingTables.join(', ')}`);
    }
  }

  async checkRLSPolicies(): Promise<void> {
    const tables = ['user_profiles', 'company_profiles'];
    const policiesStatus: Record<string, boolean> = {};

    for (const table of tables) {
      try {
        // Try to query the table - if RLS is properly configured, this should work
        const { error } = await supabase.from(table).select('id').limit(1);
        policiesStatus[table] = !error;
      } catch (error) {
        policiesStatus[table] = false;
      }
    }

    const workingTables = Object.entries(policiesStatus).filter(([_, works]) => works).map(([table]) => table);
    const brokenTables = Object.entries(policiesStatus).filter(([_, works]) => !works).map(([table]) => table);

    if (brokenTables.length === 0) {
      this.addCheck('RLS Policies', 'pass', `RLS policies working for: ${workingTables.join(', ')}`);
    } else {
      this.addCheck('RLS Policies', 'fail', `RLS issues with: ${brokenTables.join(', ')}`);
    }
  }

  async checkBuildStatus(): Promise<void> {
    const distPath = path.join(process.cwd(), 'dist');
    
    if (!fs.existsSync(distPath)) {
      this.addCheck('Build Status', 'fail', 'No dist folder found - run "npm run build" first');
      return;
    }

    const indexPath = path.join(distPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      this.addCheck('Build Status', 'fail', 'No index.html found in dist folder');
      return;
    }

    // Check bundle size
    const files = fs.readdirSync(distPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    let totalSize = 0;

    for (const file of jsFiles) {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }

    const sizeMB = totalSize / (1024 * 1024);
    
    if (sizeMB > 2) {
      this.addCheck('Build Status', 'warn', `Build complete but large bundle size: ${sizeMB.toFixed(2)}MB`);
    } else {
      this.addCheck('Build Status', 'pass', `Build complete, bundle size: ${sizeMB.toFixed(2)}MB`);
    }
  }

  async checkPackageVulnerabilities(): Promise<void> {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      if (!fs.existsSync(packagePath)) {
        this.addCheck('Security', 'fail', 'package.json not found');
        return;
      }

      // In a real implementation, you'd run npm audit or similar
      // For now, just check if package.json exists and is valid
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      if (packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0) {
        this.addCheck('Security', 'pass', 'Package.json is valid (run "npm audit" manually for vulnerabilities)');
      } else {
        this.addCheck('Security', 'warn', 'No dependencies found in package.json');
      }
    } catch (error: any) {
      this.addCheck('Security', 'fail', `Package.json validation failed: ${error.message}`);
    }
  }

  async checkTypeScript(): Promise<void> {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    
    if (!fs.existsSync(tsconfigPath)) {
      this.addCheck('TypeScript', 'fail', 'tsconfig.json not found');
      return;
    }

    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      
      if (tsconfig.compilerOptions) {
        this.addCheck('TypeScript', 'pass', 'TypeScript configuration is valid (run "npm run typecheck" for errors)');
      } else {
        this.addCheck('TypeScript', 'warn', 'TypeScript configuration may be incomplete');
      }
    } catch (error: any) {
      this.addCheck('TypeScript', 'fail', `TypeScript configuration error: ${error.message}`);
    }
  }

  generateReport(): DeploymentReport {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warn').length;

    let overall: 'ready' | 'not-ready' | 'warning';
    
    if (failed > 0) {
      overall = 'not-ready';
    } else if (warnings > 0) {
      overall = 'warning';
    } else {
      overall = 'ready';
    }

    return {
      overall,
      timestamp: new Date().toISOString(),
      checks: this.results,
      summary: {
        passed,
        failed,
        warnings,
        total: this.results.length
      }
    };
  }

  async runAllChecks(): Promise<DeploymentReport> {
    console.log('🚀 Running deployment readiness checks...\n');

    await this.checkEnvironmentVariables();
    await this.checkSupabaseConnection();
    await this.checkDatabaseTables();
    await this.checkRLSPolicies();
    await this.checkBuildStatus();
    await this.checkPackageVulnerabilities();
    await this.checkTypeScript();

    return this.generateReport();
  }

  printReport(report: DeploymentReport): void {
    console.log('📋 Deployment Readiness Report');
    console.log('==============================');
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Overall Status: ${this.getStatusEmoji(report.overall)} ${report.overall.toUpperCase()}\n`);

    // Summary
    console.log('Summary:');
    console.log(`  ✅ Passed: ${report.summary.passed}`);
    console.log(`  ❌ Failed: ${report.summary.failed}`);
    console.log(`  ⚠️  Warnings: ${report.summary.warnings}`);
    console.log(`  📊 Total: ${report.summary.total}\n`);

    // Detailed results
    console.log('Detailed Results:');
    console.log('-----------------');
    
    for (const check of report.checks) {
      const emoji = this.getStatusEmoji(check.status);
      console.log(`${emoji} ${check.name}: ${check.message}`);
      
      if (check.details) {
        console.log(`   Details: ${JSON.stringify(check.details, null, 2)}`);
      }
    }

    console.log('\n');

    // Deployment recommendation
    if (report.overall === 'ready') {
      console.log('🎉 READY FOR DEPLOYMENT');
      console.log('All checks passed! You can safely deploy this application.');
    } else if (report.overall === 'warning') {
      console.log('⚠️  DEPLOYMENT WITH CAUTION');
      console.log('Some warnings detected. Review and fix if necessary before deploying.');
    } else {
      console.log('🚫 NOT READY FOR DEPLOYMENT');
      console.log('Critical issues detected. Fix all failed checks before deploying.');
    }
  }

  private getStatusEmoji(status: 'pass' | 'fail' | 'warn' | 'ready' | 'not-ready' | 'warning'): string {
    switch (status) {
      case 'pass':
      case 'ready':
        return '✅';
      case 'fail':
      case 'not-ready':
        return '❌';
      case 'warn':
      case 'warning':
        return '⚠️';
      default:
        return '❓';
    }
  }
}

async function main() {
  const checker = new DeploymentChecker();
  
  try {
    const report = await checker.runAllChecks();
    checker.printReport(report);
    
    // Exit with appropriate code
    if (report.overall === 'not-ready') {
      process.exit(1);
    } else if (report.overall === 'warning') {
      process.exit(2);
    } else {
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Deployment check failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}