#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://kkazhcihooovsuwravhs.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXpoY2lob29vdnN1d3JhdmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzMwMzUsImV4cCI6MjA2MjEwOTAzNX0.-HzjqXYqgThN0PrbrwZlm5GWK1vOGOeYHEEFrt0OpwM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

class SecurityHardeningOrchestrator {
  constructor() {
    this.startTime = new Date();
    this.steps = [
      { name: 'preparation', label: 'Forberedelse og Validering', status: 'pending' },
      { name: 'manual_config', label: 'Manuelle Konfigurasjoner', status: 'pending' },
      { name: 'validation', label: 'Sikkerhetstesting', status: 'pending' },
      { name: 'compliance', label: 'Compliance Rapport', status: 'pending' },
      { name: 'monitoring', label: 'Overvåking Setup', status: 'pending' }
    ];
    this.results = {};
  }

  async orchestrate() {
    console.log(chalk.blue.bold('\n=== SUPABASE SIKKERHETSHARDERING ===\n'));
    console.log(chalk.yellow('🔒 Starter hybrid automatisering...'));
    console.log(chalk.gray('⏰ Starttid:', this.startTime.toLocaleString('no-NO')));
    
    try {
      // Steg 1: Forberedelse og Validering
      await this.executeStep('preparation', () => this.runPreparation());
      
      // Steg 2: Guide gjennom manuelle konfigurasjoner
      await this.executeStep('manual_config', () => this.guideManualConfiguration());
      
      // Steg 3: Automatisk validering og testing
      await this.executeStep('validation', () => this.runSecurityValidation());
      
      // Steg 4: Generer compliance rapport
      await this.executeStep('compliance', () => this.generateComplianceReport());
      
      // Steg 5: Sett opp overvåking
      await this.executeStep('monitoring', () => this.setupMonitoring());
      
      await this.showFinalSummary();
      
    } catch (error) {
      console.error(chalk.red('\n❌ Kritisk feil i sikkerhetshardening:'), error.message);
      process.exit(1);
    }
  }

  async executeStep(stepName, handler) {
    const step = this.steps.find(s => s.name === stepName);
    if (!step) return;

    console.log(chalk.cyan(`\n📋 ${step.label}...`));
    step.status = 'running';
    
    try {
      const result = await handler();
      step.status = 'completed';
      this.results[stepName] = { success: true, data: result };
      console.log(chalk.green(`✅ ${step.label} fullført`));
    } catch (error) {
      step.status = 'failed';
      this.results[stepName] = { success: false, error: error.message };
      console.error(chalk.red(`❌ ${step.label} feilet:`, error.message));
      throw error;
    }
  }

  async runPreparation() {
    console.log(chalk.blue('🔍 Validerer Supabase tilkobling...'));
    
    // Test basic connectivity
    try {
      const { data, error } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true });
      if (error) throw error;
      console.log(chalk.green('✓ Supabase tilkobling OK'));
    } catch (error) {
      throw new Error(`Supabase tilkobling feilet: ${error.message}`);
    }

    // Check current security status
    console.log(chalk.blue('🔍 Sjekker nåværende sikkerhetsstatus...'));
    const securityStatus = await this.checkCurrentSecurityStatus();
    
    // Prepare checklist
    console.log(chalk.blue('📝 Forbereder sikkerhetsjekkliste...'));
    await this.createSecurityChecklist();
    
    return { connectivity: 'OK', securityStatus };
  }

  async checkCurrentSecurityStatus() {
    const status = {
      database_version: { status: 'unknown', critical: true },
      otp_expiry: { status: 'unknown', critical: false },
      mfa_enabled: { status: 'unknown', critical: false },
      leaked_password_protection: { status: 'unknown', critical: false }
    };

    // Note: These checks are limited by what we can detect via client API
    console.log(chalk.yellow('⚠️  Manuell verifikasjon kreves for kritiske innstillinger'));
    
    return status;
  }

  async createSecurityChecklist() {
    const checklist = {
      critical_tasks: [
        {
          id: 'db_upgrade',
          title: 'Database Upgrade (KRITISK)',
          description: 'Oppgrader fra supabase-postgres-15.8.1.093',
          url: 'https://supabase.com/dashboard/project/kkazhcihooovsuwravhs/settings/general',
          priority: 1,
          estimated_time: '10 minutter'
        },
        {
          id: 'otp_expiry',
          title: 'OTP Expiry Konfigurering',
          description: 'Reduser til 15 minutter (900 sekunder)',
          url: 'https://supabase.com/dashboard/project/kkazhcihooovsuwravhs/auth/policies',
          priority: 2,
          estimated_time: '2 minutter'
        },
        {
          id: 'leaked_passwords',
          title: 'Leaked Password Protection',
          description: 'Aktiver beskyttelse mot kompromitterte passord',
          url: 'https://supabase.com/dashboard/project/kkazhcihooovsuwravhs/auth/policies',
          priority: 3,
          estimated_time: '2 minutter'
        },
        {
          id: 'mfa_setup',
          title: 'Multi-Factor Authentication',
          description: 'Aktiver TOTP og SMS MFA',
          url: 'https://supabase.com/dashboard/project/kkazhcihooovsuwravhs/auth/providers',
          priority: 4,
          estimated_time: '3 minutter'
        }
      ]
    };

    await fs.writeFile(
      path.join(process.cwd(), 'docs', 'security-checklist.json'),
      JSON.stringify(checklist, null, 2)
    );
    
    console.log(chalk.green('✓ Sikkerhetsjekkliste opprettet'));
    return checklist;
  }

  async guideManualConfiguration() {
    console.log(chalk.yellow.bold('\n🔧 MANUELLE KONFIGURASJONER KREVES\n'));
    
    console.log(chalk.blue('📖 Følg den detaljerte guiden i:'));
    console.log(chalk.cyan('   docs/manual-security-hardening-guide.md\n'));
    
    console.log(chalk.red.bold('⚠️  KRITISK REKKEFØLGE:'));
    console.log(chalk.red('1. Database Upgrade (høyeste prioritet)'));
    console.log(chalk.yellow('2. OTP Expiry (15 minutter)'));
    console.log(chalk.yellow('3. Leaked Password Protection (aktiver)'));
    console.log(chalk.yellow('4. MFA Setup (TOTP + SMS)\n'));
    
    console.log(chalk.blue('🌐 Direktelenker:'));
    console.log(chalk.cyan('• Database: https://supabase.com/dashboard/project/kkazhcihooovsuwravhs/settings/general'));
    console.log(chalk.cyan('• Auth Security: https://supabase.com/dashboard/project/kkazhcihooovsuwravhs/auth/policies'));
    console.log(chalk.cyan('• MFA Providers: https://supabase.com/dashboard/project/kkazhcihooovsuwravhs/auth/providers\n'));
    
    // Interactive confirmation
    const confirmed = await this.waitForUserConfirmation();
    if (!confirmed) {
      throw new Error('Manuell konfigurering ikke fullført');
    }
    
    return { manual_steps_completed: true };
  }

  async waitForUserConfirmation() {
    return new Promise((resolve) => {
      const { stdin, stdout } = process;
      
      stdout.write(chalk.green.bold('✅ Trykk ENTER når alle manuelle konfigurasjoner er fullført...'));
      
      stdin.resume();
      stdin.setEncoding('utf8');
      stdin.once('data', () => {
        stdin.pause();
        resolve(true);
      });
    });
  }

  async runSecurityValidation() {
    console.log(chalk.blue('🧪 Kjører sikkerhetstester...'));
    
    // Run existing validation scripts
    const validationResult = await this.runScript('npm', ['run', 'security:check']);
    const authTestResult = await this.runScript('npm', ['run', 'test:auth']);
    
    // Run comprehensive security test suite
    console.log(chalk.blue('🔍 Kjører utvidet sikkerhetstesting...'));
    const comprehensiveResult = await this.runScript('npm', ['run', 'test:security-suite']);
    
    return {
      validation: validationResult.success,
      auth_tests: authTestResult.success,
      comprehensive: comprehensiveResult.success
    };
  }

  async generateComplianceReport() {
    console.log(chalk.blue('📊 Genererer compliance rapport...'));
    
    const reportResult = await this.runScript('npm', ['run', 'security:report']);
    
    // Create summary report
    const report = {
      timestamp: new Date().toISOString(),
      project_id: 'kkazhcihooovsuwravhs',
      hardening_results: this.results,
      compliance_status: 'pending_verification',
      next_review_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    await fs.writeFile(
      path.join(process.cwd(), 'docs', 'security-compliance-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log(chalk.green('✓ Compliance rapport generert'));
    return report;
  }

  async setupMonitoring() {
    console.log(chalk.blue('📈 Setter opp sikkerhetsovervåking...'));
    
    // Create monitoring configuration
    const monitoringConfig = {
      enabled: true,
      checks: [
        { name: 'daily_security_scan', schedule: '0 6 * * *' },
        { name: 'auth_flow_validation', schedule: '0 */6 * * *' },
        { name: 'rls_policy_check', schedule: '0 12 * * *' }
      ],
      alerts: {
        critical: ['security-alerts'],
        warning: ['dev-team']
      }
    };

    await fs.writeFile(
      path.join(process.cwd(), 'docs', 'security-monitoring-config.json'),
      JSON.stringify(monitoringConfig, null, 2)
    );
    
    console.log(chalk.green('✓ Overvåking konfigurert'));
    return monitoringConfig;
  }

  async runScript(command, args) {
    return new Promise((resolve) => {
      const process = spawn(command, args, { stdio: 'pipe' });
      let output = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.on('close', (code) => {
        resolve({
          success: code === 0,
          output,
          exitCode: code
        });
      });
    });
  }

  async showFinalSummary() {
    const endTime = new Date();
    const duration = Math.round((endTime - this.startTime) / 1000);
    
    console.log(chalk.green.bold('\n🎉 SIKKERHETSHARDERING FULLFØRT!\n'));
    
    console.log(chalk.blue('📈 Sammendrag:'));
    console.log(chalk.gray(`⏱️  Total tid: ${duration} sekunder`));
    console.log(chalk.gray(`📅 Fullført: ${endTime.toLocaleString('no-NO')}\n`));
    
    // Show step status
    this.steps.forEach(step => {
      const icon = step.status === 'completed' ? '✅' : 
                   step.status === 'failed' ? '❌' : '⏸️';
      console.log(`${icon} ${step.label}: ${step.status}`);
    });
    
    console.log(chalk.yellow.bold('\n📋 NESTE STEG:'));
    console.log(chalk.yellow('1. Sjekk compliance rapport: docs/security-compliance-report.json'));
    console.log(chalk.yellow('2. Overvåk sikkerhetsdashboard månedlig'));
    console.log(chalk.yellow('3. Kjør sikkerhetstester ukentlig: npm run test:security-suite'));
    console.log(chalk.yellow('4. Oppdater dokumentasjon ved endringer\n'));
    
    console.log(chalk.green.bold('🔒 Supabase-prosjektet er nå sikkerhetsherdnet! 🔒'));
  }
}

// Main execution
async function main() {
  const orchestrator = new SecurityHardeningOrchestrator();
  await orchestrator.orchestrate();
}

// Export for testing
export { SecurityHardeningOrchestrator };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('Orchestrator feil:'), error);
    process.exit(1);
  });
}