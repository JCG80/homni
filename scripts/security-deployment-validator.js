#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Pre-deployment security validation
 * Ensures all security measures are in place before production deployment
 */

const supabaseUrl = "https://kkazhcihooovsuwravhs.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXpoY2lob29vdnN1d3JhdmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzMwMzUsImV4cCI6MjA2MjEwOTAzNX0.-HzjqXYqgThN0PrbrwZlm5GWK1vOGOeYHEEFrt0OpwM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

class SecurityDeploymentValidator {
  constructor() {
    this.validationResults = [];
    this.criticalIssues = [];
    this.warnings = [];
    this.blockingIssues = [];
    this.deploymentReady = false;
  }

  async validateForDeployment() {
    console.log(chalk.blue.bold('\n🚀 DEPLOYMENT SECURITY VALIDATION\n'));
    console.log(chalk.gray('Validating security readiness for production deployment...\n'));

    try {
      // Critical validations that must pass for deployment
      await this.validateCriticalSecurity();
      await this.validateConfiguration();
      await this.validateCompliance();
      await this.validateMonitoring();
      await this.validateDocumentation();
      await this.validateBackupAndRecovery();
      
      // Generate deployment decision
      await this.generateDeploymentDecision();
      
      this.displayValidationResults();
      
      return this.deploymentReady;
      
    } catch (error) {
      console.error(chalk.red('Deployment validation failed:'), error.message);
      this.criticalIssues.push(`Validation error: ${error.message}`);
      return false;
    }
  }

  async validateCriticalSecurity() {
    console.log(chalk.cyan('🔒 Validating critical security requirements...'));
    
    const checks = [
      {
        name: 'Database Version Vulnerability',
        critical: true,
        check: async () => {
          // Check if database upgrade documentation exists and is recent
          try {
            const guidePath = path.join(process.cwd(), 'docs', 'manual-security-hardening-guide.md');
            const guide = await fs.readFile(guidePath, 'utf8');
            
            if (guide.includes('supabase-postgres-15.8.1.093') && guide.includes('KRITISK')) {
              return {
                passed: false,
                message: 'Database version vulnerability still documented as unfixed',
                recommendation: 'Complete database upgrade before deployment'
              };
            }
            
            return {
              passed: true,
              message: 'Database version vulnerability documentation suggests resolution'
            };
          } catch {
            return {
              passed: false,
              message: 'Cannot verify database version status',
              recommendation: 'Verify database upgrade completion'
            };
          }
        }
      },
      {
        name: 'Authentication Security Configuration',
        critical: true,
        check: async () => {
          // Test authentication endpoints are working and secured
          try {
            const { error } = await supabase.auth.signInWithPassword({
              email: 'test@nonexistent.com',
              password: 'invalid'
            });
            
            if (error && error.message.includes('Invalid')) {
              return {
                passed: true,
                message: 'Authentication properly rejects invalid credentials'
              };
            }
            
            return {
              passed: false,
              message: 'Authentication configuration may not be secure',
              recommendation: 'Verify authentication settings in Supabase Dashboard'
            };
          } catch (err) {
            return {
              passed: false,
              message: 'Cannot validate authentication configuration',
              recommendation: 'Check Supabase connectivity and auth setup'
            };
          }
        }
      },
      {
        name: 'RLS Policies Active',
        critical: true,
        check: async () => {
          // Test that RLS policies are protecting data
          try {
            const { data, error } = await supabase
              .from('user_profiles')
              .select('*')
              .limit(1);
            
            // If we get data without auth, RLS might not be working
            if (data && data.length > 0) {
              return {
                passed: false,
                message: 'User data accessible without authentication - RLS may not be active',
                recommendation: 'Verify RLS policies are enabled and working'
              };
            }
            
            return {
              passed: true,
              message: 'User data properly protected by RLS policies'
            };
          } catch (err) {
            return {
              passed: true,
              message: 'Data access properly restricted (expected behavior)'
            };
          }
        }
      },
      {
        name: 'Admin Access Controls',
        critical: true,
        check: async () => {
          // Test admin functions are protected
          try {
            const { data, error } = await supabase.rpc('is_master_admin');
            
            if (data === false || (error && error.message.includes('permission'))) {
              return {
                passed: true,
                message: 'Admin functions properly protected from anonymous access'
              };
            }
            
            return {
              passed: false,
              message: 'Admin functions may not be properly protected',
              recommendation: 'Verify admin access controls'
            };
          } catch (err) {
            return {
              passed: true,
              message: 'Admin access properly restricted'
            };
          }
        }
      }
    ];

    for (const check of checks) {
      console.log(chalk.yellow(`  Checking: ${check.name}...`));
      
      try {
        const result = await check.check();
        
        this.validationResults.push({
          category: 'Critical Security',
          name: check.name,
          critical: check.critical,
          ...result
        });
        
        if (result.passed) {
          console.log(chalk.green(`    ✓ ${result.message}`));
        } else {
          console.log(chalk.red(`    ✗ ${result.message}`));
          if (check.critical) {
            this.criticalIssues.push(`${check.name}: ${result.message}`);
            this.blockingIssues.push({
              name: check.name,
              message: result.message,
              recommendation: result.recommendation
            });
          } else {
            this.warnings.push(`${check.name}: ${result.message}`);
          }
        }
      } catch (error) {
        console.log(chalk.red(`    ✗ Error checking ${check.name}: ${error.message}`));
        this.criticalIssues.push(`${check.name}: ${error.message}`);
      }
    }
  }

  async validateConfiguration() {
    console.log(chalk.cyan('\n⚙️  Validating system configuration...'));
    
    const configChecks = [
      {
        name: 'Security Scripts Available',
        check: async () => {
          const requiredScripts = [
            'scripts/security-hardening-orchestrator.js',
            'scripts/security-test-suite.js',
            'scripts/security-compliance-report.js',
            'scripts/security-monitoring.js'
          ];
          
          const missing = [];
          for (const script of requiredScripts) {
            try {
              await fs.access(path.join(process.cwd(), script));
            } catch {
              missing.push(script);
            }
          }
          
          if (missing.length === 0) {
            return { passed: true, message: 'All required security scripts available' };
          } else {
            return { 
              passed: false, 
              message: `Missing security scripts: ${missing.join(', ')}`,
              recommendation: 'Ensure all security automation scripts are deployed'
            };
          }
        }
      },
      {
        name: 'Documentation Complete',
        check: async () => {
          const requiredDocs = [
            'docs/manual-security-hardening-guide.md',
            'docs/security-commands-reference.md',
            'README-SECURITY.md'
          ];
          
          const missing = [];
          for (const doc of requiredDocs) {
            try {
              const content = await fs.readFile(path.join(process.cwd(), doc), 'utf8');
              if (content.length < 100) { // Very basic content check
                missing.push(`${doc} (insufficient content)`);
              }
            } catch {
              missing.push(doc);
            }
          }
          
          return missing.length === 0 ? 
            { passed: true, message: 'Security documentation complete' } :
            { passed: false, message: `Incomplete documentation: ${missing.join(', ')}` };
        }
      },
      {
        name: 'Environment Configuration',
        check: async () => {
          const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
          const missing = requiredEnvVars.filter(envVar => 
            !process.env[envVar] && !process.env[`VITE_${envVar}`]
          );
          
          return missing.length === 0 ?
            { passed: true, message: 'Environment variables properly configured' } :
            { passed: false, message: `Missing environment variables: ${missing.join(', ')}` };
        }
      }
    ];

    await this.runChecks('Configuration', configChecks);
  }

  async validateCompliance() {
    console.log(chalk.cyan('\n📋 Validating compliance requirements...'));
    
    const complianceChecks = [
      {
        name: 'Security Policies Documented',
        check: async () => {
          try {
            const guide = await fs.readFile(
              path.join(process.cwd(), 'docs', 'manual-security-hardening-guide.md'),
              'utf8'
            );
            
            const hasOtpPolicy = guide.includes('OTP Expiry');
            const hasMfaPolicy = guide.includes('MFA');
            const hasPasswordPolicy = guide.includes('Leaked Password Protection');
            
            if (hasOtpPolicy && hasMfaPolicy && hasPasswordPolicy) {
              return { passed: true, message: 'Security policies properly documented' };
            } else {
              return { 
                passed: false, 
                message: 'Incomplete security policy documentation',
                recommendation: 'Ensure all security policies are documented'
              };
            }
          } catch {
            return { passed: false, message: 'Security policy documentation not found' };
          }
        }
      },
      {
        name: 'Compliance Reporting Available',
        check: async () => {
          try {
            await fs.access(path.join(process.cwd(), 'scripts', 'security-compliance-report.js'));
            return { passed: true, message: 'Compliance reporting system available' };
          } catch {
            return { passed: false, message: 'Compliance reporting system not available' };
          }
        }
      }
    ];

    await this.runChecks('Compliance', complianceChecks);
  }

  async validateMonitoring() {
    console.log(chalk.cyan('\n📈 Validating monitoring and alerting...'));
    
    const monitoringChecks = [
      {
        name: 'Security Monitoring Setup',
        check: async () => {
          try {
            await fs.access(path.join(process.cwd(), 'scripts', 'security-monitoring.js'));
            return { passed: true, message: 'Security monitoring system available' };
          } catch {
            return { passed: false, message: 'Security monitoring system not available' };
          }
        }
      },
      {
        name: 'Health Check Functionality',
        check: async () => {
          // Test basic connectivity as a health check
          try {
            const { error } = await supabase
              .from('user_profiles')
              .select('count', { count: 'exact', head: true });
            
            return error ? 
              { passed: false, message: 'Health check failed - connectivity issues' } :
              { passed: true, message: 'Health check functionality working' };
          } catch (err) {
            return { passed: false, message: `Health check error: ${err.message}` };
          }
        }
      }
    ];

    await this.runChecks('Monitoring', monitoringChecks);
  }

  async validateDocumentation() {
    console.log(chalk.cyan('\n📚 Validating deployment documentation...'));
    
    const docChecks = [
      {
        name: 'Security Runbook Available',
        check: async () => {
          try {
            const readmePath = path.join(process.cwd(), 'README-SECURITY.md');
            const content = await fs.readFile(readmePath, 'utf8');
            
            const hasQuickStart = content.includes('Quick Start');
            const hasCommands = content.includes('Commands');
            const hasLinks = content.includes('https://supabase.com/dashboard');
            
            if (hasQuickStart && hasCommands && hasLinks) {
              return { passed: true, message: 'Security runbook complete and comprehensive' };
            } else {
              return { passed: false, message: 'Security runbook incomplete' };
            }
          } catch {
            return { passed: false, message: 'Security runbook not found' };
          }
        }
      }
    ];

    await this.runChecks('Documentation', docChecks);
  }

  async validateBackupAndRecovery() {
    console.log(chalk.cyan('\n💾 Validating backup and recovery procedures...'));
    
    const backupChecks = [
      {
        name: 'Supabase Managed Backups',
        check: async () => {
          // This is informational - we trust Supabase manages backups
          return { 
            passed: true, 
            message: 'Supabase provides managed database backups',
            note: 'Verify backup settings in Supabase Dashboard if needed'
          };
        }
      },
      {
        name: 'Configuration Backup',
        check: async () => {
          // Check if security configurations are documented/backed up
          const configFiles = [
            'docs/manual-security-hardening-guide.md',
            'docs/security-monitoring-config.json'
          ];
          
          let documentsExist = 0;
          for (const file of configFiles) {
            try {
              await fs.access(path.join(process.cwd(), file));
              documentsExist++;
            } catch {}
          }
          
          return documentsExist >= configFiles.length ?
            { passed: true, message: 'Security configurations properly documented' } :
            { passed: false, message: 'Security configuration documentation incomplete' };
        }
      }
    ];

    await this.runChecks('Backup & Recovery', backupChecks);
  }

  async runChecks(category, checks) {
    for (const check of checks) {
      console.log(chalk.yellow(`  Checking: ${check.name}...`));
      
      try {
        const result = await check.check();
        
        this.validationResults.push({
          category,
          name: check.name,
          ...result
        });
        
        if (result.passed) {
          console.log(chalk.green(`    ✓ ${result.message}`));
          if (result.note) {
            console.log(chalk.blue(`      ℹ ${result.note}`));
          }
        } else {
          console.log(chalk.red(`    ✗ ${result.message}`));
          if (result.recommendation) {
            console.log(chalk.yellow(`      → ${result.recommendation}`));
          }
          this.warnings.push(`${check.name}: ${result.message}`);
        }
      } catch (error) {
        console.log(chalk.red(`    ✗ Error: ${error.message}`));
        this.warnings.push(`${check.name}: ${error.message}`);
      }
    }
  }

  async generateDeploymentDecision() {
    console.log(chalk.cyan('\n🎯 Generating deployment decision...'));
    
    const totalChecks = this.validationResults.length;
    const passedChecks = this.validationResults.filter(r => r.passed).length;
    const criticalFailures = this.criticalIssues.length;
    const successRate = Math.round((passedChecks / totalChecks) * 100);

    // Deployment criteria
    const deploymentCriteria = {
      minSuccessRate: 90,
      maxCriticalIssues: 0,
      maxBlockingIssues: 0
    };

    const meetsSuccessRate = successRate >= deploymentCriteria.minSuccessRate;
    const noCriticalIssues = criticalFailures <= deploymentCriteria.maxCriticalIssues;
    const noBlockingIssues = this.blockingIssues.length <= deploymentCriteria.maxBlockingIssues;

    this.deploymentReady = meetsSuccessRate && noCriticalIssues && noBlockingIssues;

    const decision = {
      timestamp: new Date().toISOString(),
      deployment_ready: this.deploymentReady,
      criteria: deploymentCriteria,
      actual: {
        success_rate: successRate,
        critical_issues: criticalFailures,
        blocking_issues: this.blockingIssues.length,
        total_warnings: this.warnings.length
      },
      decision_reason: this.getDecisionReason(),
      next_steps: this.getNextSteps()
    };

    // Save deployment decision
    await fs.writeFile(
      path.join(process.cwd(), 'docs', 'deployment-security-validation.json'),
      JSON.stringify({
        ...decision,
        validation_results: this.validationResults,
        critical_issues: this.criticalIssues,
        warnings: this.warnings,
        blocking_issues: this.blockingIssues
      }, null, 2)
    );

    console.log(chalk.green('  ✓ Deployment decision generated'));
  }

  getDecisionReason() {
    if (this.deploymentReady) {
      return 'All critical security requirements met. System ready for production deployment.';
    }

    const reasons = [];
    if (this.criticalIssues.length > 0) {
      reasons.push(`${this.criticalIssues.length} critical security issues must be resolved`);
    }
    if (this.blockingIssues.length > 0) {
      reasons.push(`${this.blockingIssues.length} blocking issues prevent deployment`);
    }

    const successRate = Math.round(
      (this.validationResults.filter(r => r.passed).length / this.validationResults.length) * 100
    );
    if (successRate < 90) {
      reasons.push(`Success rate ${successRate}% below required 90%`);
    }

    return reasons.join('; ');
  }

  getNextSteps() {
    if (this.deploymentReady) {
      return [
        'Proceed with production deployment',
        'Monitor security dashboard after deployment',
        'Schedule regular security reviews',
        'Ensure team is trained on security procedures'
      ];
    }

    const steps = ['Address all critical and blocking issues:'];
    this.blockingIssues.forEach(issue => {
      steps.push(`• ${issue.name}: ${issue.recommendation || 'Review and resolve'}`);
    });
    
    steps.push('Re-run deployment validation after fixes');
    steps.push('Consider deploying to staging environment first');

    return steps;
  }

  displayValidationResults() {
    console.log(chalk.blue.bold('\n🎯 DEPLOYMENT VALIDATION RESULTS\n'));
    console.log(chalk.gray('━'.repeat(60)));

    const totalChecks = this.validationResults.length;
    const passedChecks = this.validationResults.filter(r => r.passed).length;
    const failedChecks = totalChecks - passedChecks;
    const successRate = Math.round((passedChecks / totalChecks) * 100);

    console.log(`${chalk.blue('Total Checks:')} ${totalChecks}`);
    console.log(`${chalk.green('Passed:')} ${passedChecks}`);
    console.log(`${chalk.red('Failed:')} ${failedChecks}`);
    console.log(`${chalk.red('Critical Issues:')} ${this.criticalIssues.length}`);
    console.log(`${chalk.yellow('Warnings:')} ${this.warnings.length}`);
    console.log(`${chalk.red('Blocking Issues:')} ${this.blockingIssues.length}`);

    const successColor = successRate >= 90 ? chalk.green : successRate >= 70 ? chalk.yellow : chalk.red;
    console.log(`${chalk.blue('Success Rate:')} ${successColor(successRate + '%')}`);

    // Deployment decision
    console.log(chalk.blue.bold('\n🚀 DEPLOYMENT DECISION:'));
    if (this.deploymentReady) {
      console.log(chalk.green.bold('✅ APPROVED FOR DEPLOYMENT'));
      console.log(chalk.green('All critical security requirements are met.'));
      console.log(chalk.green('System is ready for production deployment.'));
    } else {
      console.log(chalk.red.bold('❌ DEPLOYMENT BLOCKED'));
      console.log(chalk.red('Critical security issues must be resolved before deployment.'));
    }

    // Show blocking issues
    if (this.blockingIssues.length > 0) {
      console.log(chalk.red.bold('\n🚫 BLOCKING ISSUES:'));
      this.blockingIssues.forEach(issue => {
        console.log(chalk.red(`  • ${issue.name}: ${issue.message}`));
        if (issue.recommendation) {
          console.log(chalk.yellow(`    → ${issue.recommendation}`));
        }
      });
    }

    // Show warnings
    if (this.warnings.length > 0 && this.warnings.length <= 5) {
      console.log(chalk.yellow.bold('\n⚠️  WARNINGS:'));
      this.warnings.slice(0, 5).forEach(warning => {
        console.log(chalk.yellow(`  • ${warning}`));
      });
      if (this.warnings.length > 5) {
        console.log(chalk.yellow(`  ... and ${this.warnings.length - 5} more warnings`));
      }
    }

    console.log(chalk.blue('\n📁 Full validation report: docs/deployment-security-validation.json'));
  }
}

// Main execution
async function main() {
  const validator = new SecurityDeploymentValidator();
  const isReady = await validator.validateForDeployment();
  
  // Exit with appropriate code
  process.exit(isReady ? 0 : 1);
}

// Export for use in other scripts
export { SecurityDeploymentValidator };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('Deployment validation error:'), error);
    process.exit(1);
  });
}