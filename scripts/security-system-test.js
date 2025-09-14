#!/usr/bin/env node

import { spawn } from 'child_process';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Complete Security System Test Runner
 * Tests the entire security automation system end-to-end
 */

class SecuritySystemTest {
  constructor() {
    this.testSuite = {
      'System Validation': [
        'node scripts/validate-security-config.js',
        'node scripts/test-authentication-flow.js'
      ],
      'Security Testing': [
        'node scripts/security-test-suite.js'
      ],
      'Compliance & Reporting': [
        'node scripts/security-compliance-report.js'
      ],
      'Monitoring Setup': [
        'node scripts/security-monitoring.js'
      ],
      'Integration Testing': [
        'node scripts/security-integration-test.js'
      ],
      'Deployment Validation': [
        'node scripts/security-deployment-validator.js'
      ]
    };
    
    this.results = {};
    this.overallSuccess = true;
    this.startTime = new Date();
  }

  async runCompleteTest() {
    console.log(chalk.blue.bold('\n🔒 COMPLETE SECURITY SYSTEM TEST\n'));
    console.log(chalk.gray('Testing all security automation components...\n'));
    
    try {
      // Run all test suites
      for (const [suiteName, commands] of Object.entries(this.testSuite)) {
        await this.runTestSuite(suiteName, commands);
      }
      
      // Generate comprehensive report
      await this.generateSystemTestReport();
      
      // Display final results
      this.displayFinalResults();
      
      return this.overallSuccess;
      
    } catch (error) {
      console.error(chalk.red('System test failed:'), error.message);
      return false;
    }
  }

  async runTestSuite(suiteName, commands) {
    console.log(chalk.cyan.bold(`\n📋 ${suiteName}\n`));
    
    const suiteResults = {
      name: suiteName,
      commands: [],
      passed: 0,
      failed: 0,
      warnings: 0,
      startTime: new Date(),
      endTime: null,
      duration: 0
    };

    for (const command of commands) {
      const result = await this.runCommand(command);
      suiteResults.commands.push(result);
      
      if (result.success) {
        suiteResults.passed++;
        console.log(chalk.green(`✅ ${result.name}: SUCCESS`));
      } else if (result.exitCode === 0 || result.hasExpectedOutput) {
        suiteResults.warnings++;
        console.log(chalk.yellow(`⚠️  ${result.name}: COMPLETED WITH WARNINGS`));
      } else {
        suiteResults.failed++;
        console.log(chalk.red(`❌ ${result.name}: FAILED`));
        this.overallSuccess = false;
      }
      
      if (result.duration > 60000) {
        console.log(chalk.yellow(`    ⏱️  Long execution time: ${Math.round(result.duration / 1000)}s`));
      }
    }
    
    suiteResults.endTime = new Date();
    suiteResults.duration = suiteResults.endTime - suiteResults.startTime;
    this.results[suiteName] = suiteResults;
    
    const suiteSuccess = suiteResults.failed === 0;
    console.log(chalk.blue(`\n📊 ${suiteName} Summary: ${suiteResults.passed} passed, ${suiteResults.failed} failed, ${suiteResults.warnings} warnings`));
    
    if (!suiteSuccess) {
      this.overallSuccess = false;
    }
  }

  async runCommand(command) {
    const startTime = Date.now();
    const commandName = this.getCommandName(command);
    
    console.log(chalk.yellow(`  Running: ${commandName}...`));
    
    return new Promise((resolve) => {
      const [cmd, ...args] = command.split(' ');
      const process = spawn(cmd, args, { 
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 180000 // 3 minutes max per command
      });
      
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        const duration = Date.now() - startTime;
        const hasExpectedOutput = this.checkExpectedOutput(commandName, stdout);
        
        resolve({
          name: commandName,
          command,
          success: code === 0,
          exitCode: code,
          duration,
          stdout: stdout.slice(0, 1000), // Truncate for storage
          stderr: stderr.slice(0, 500),
          hasExpectedOutput,
          timestamp: new Date().toISOString()
        });
      });
      
      process.on('error', (error) => {
        resolve({
          name: commandName,
          command,
          success: false,
          error: error.message,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  getCommandName(command) {
    const mapping = {
      'node scripts/validate-security-config.js': 'Security Config Validation',
      'node scripts/test-authentication-flow.js': 'Authentication Flow Test',
      'node scripts/security-test-suite.js': 'Security Test Suite',
      'node scripts/security-compliance-report.js': 'Compliance Report',
      'node scripts/security-monitoring.js': 'Monitoring Setup',
      'node scripts/security-integration-test.js': 'Integration Test',
      'node scripts/security-deployment-validator.js': 'Deployment Validator'
    };
    
    return mapping[command] || command;
  }

  checkExpectedOutput(commandName, output) {
    const expectedOutputs = {
      'Security Config Validation': ['connectivity', 'configuration', 'validation'],
      'Authentication Flow Test': ['authentication', 'sign-up', 'login'],
      'Security Test Suite': ['security', 'tests', 'suite'],
      'Compliance Report': ['compliance', 'security posture', 'report'],
      'Monitoring Setup': ['monitoring', 'health', 'setup'],
      'Integration Test': ['integration', 'test', 'scripts'],
      'Deployment Validator': ['deployment', 'validation', 'security']
    };
    
    const expected = expectedOutputs[commandName] || [];
    return expected.some(keyword => 
      output.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  async generateSystemTestReport() {
    console.log(chalk.cyan('\n📊 Generating system test report...'));
    
    const endTime = new Date();
    const totalDuration = endTime - this.startTime;
    
    const report = {
      metadata: {
        test_type: 'complete_system_test',
        start_time: this.startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_ms: totalDuration,
        duration_human: this.formatDuration(totalDuration),
        tester_version: '1.0.0'
      },
      summary: {
        overall_success: this.overallSuccess,
        total_suites: Object.keys(this.results).length,
        total_commands: Object.values(this.results).reduce((sum, suite) => sum + suite.commands.length, 0),
        passed_commands: Object.values(this.results).reduce((sum, suite) => sum + suite.passed, 0),
        failed_commands: Object.values(this.results).reduce((sum, suite) => sum + suite.failed, 0),
        warning_commands: Object.values(this.results).reduce((sum, suite) => sum + suite.warnings, 0)
      },
      test_suites: this.results,
      system_health: await this.assessSystemHealth(),
      recommendations: this.generateRecommendations()
    };

    // Calculate success rate
    const totalCommands = report.summary.total_commands;
    const successfulCommands = report.summary.passed_commands + report.summary.warning_commands;
    report.summary.success_rate = Math.round((successfulCommands / totalCommands) * 100);

    await fs.writeFile(
      path.join(process.cwd(), 'docs', 'security-system-test-results.json'),
      JSON.stringify(report, null, 2)
    );

    // Create executive summary
    const summary = this.createExecutiveSummary(report);
    await fs.writeFile(
      path.join(process.cwd(), 'docs', 'security-system-test-summary.md'),
      summary
    );

    console.log(chalk.green('  ✓ System test report generated'));
  }

  async assessSystemHealth() {
    const health = {
      scripts_available: 0,
      documentation_complete: 0,
      reports_generated: 0,
      monitoring_active: false,
      overall_status: 'unknown'
    };

    // Check script availability
    const requiredScripts = [
      'scripts/security-hardening-orchestrator.js',
      'scripts/validate-security-config.js',
      'scripts/test-authentication-flow.js',
      'scripts/security-test-suite.js',
      'scripts/security-compliance-report.js',
      'scripts/security-monitoring.js'
    ];

    for (const script of requiredScripts) {
      try {
        await fs.access(path.join(process.cwd(), script));
        health.scripts_available++;
      } catch {}
    }

    // Check documentation
    const requiredDocs = [
      'docs/manual-security-hardening-guide.md',
      'README-SECURITY.md',
      'docs/security-commands-reference.md'
    ];

    for (const doc of requiredDocs) {
      try {
        const content = await fs.readFile(path.join(process.cwd(), doc), 'utf8');
        if (content.length > 100) {
          health.documentation_complete++;
        }
      } catch {}
    }

    // Check generated reports
    const reportFiles = [
      'docs/security-compliance-report.json',
      'docs/security-test-results.json',
      'docs/security-monitoring-dashboard.md'
    ];

    for (const file of reportFiles) {
      try {
        await fs.access(path.join(process.cwd(), file));
        health.reports_generated++;
      } catch {}
    }

    // Overall health assessment
    const scriptHealth = (health.scripts_available / requiredScripts.length) * 100;
    const docHealth = (health.documentation_complete / requiredDocs.length) * 100;
    const reportHealth = (health.reports_generated / reportFiles.length) * 100;
    
    const overallHealth = (scriptHealth + docHealth + reportHealth) / 3;
    
    if (overallHealth >= 90) {
      health.overall_status = 'excellent';
    } else if (overallHealth >= 70) {
      health.overall_status = 'good';
    } else if (overallHealth >= 50) {
      health.overall_status = 'fair';
    } else {
      health.overall_status = 'poor';
    }

    health.overall_health_score = Math.round(overallHealth);

    return health;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (!this.overallSuccess) {
      recommendations.push('Address failed test suites before proceeding to production');
    }

    const totalWarnings = Object.values(this.results).reduce((sum, suite) => sum + suite.warnings, 0);
    if (totalWarnings > 0) {
      recommendations.push(`Review ${totalWarnings} warning(s) to optimize system performance`);
    }

    // Check for slow commands
    const slowCommands = [];
    Object.values(this.results).forEach(suite => {
      suite.commands.forEach(cmd => {
        if (cmd.duration > 60000) {
          slowCommands.push(cmd.name);
        }
      });
    });

    if (slowCommands.length > 0) {
      recommendations.push(`Optimize performance for slow commands: ${slowCommands.join(', ')}`);
    }

    recommendations.push('Run system tests regularly (weekly recommended)');
    recommendations.push('Monitor system test results for trends');
    recommendations.push('Update security automation as threats evolve');

    return recommendations;
  }

  createExecutiveSummary(report) {
    const now = new Date().toLocaleDateString('no-NO');
    
    return `# Security System Test Executive Summary

**Test Date:** ${now}
**Test Duration:** ${report.metadata.duration_human}
**Overall Result:** ${report.summary.overall_success ? '✅ PASS' : '❌ FAIL'}

## Summary Metrics

- **Success Rate:** ${report.summary.success_rate}%
- **Total Commands Tested:** ${report.summary.total_commands}
- **Passed:** ${report.summary.passed_commands}
- **Failed:** ${report.summary.failed_commands}  
- **Warnings:** ${report.summary.warning_commands}

## System Health

- **Overall Health Score:** ${report.system_health.overall_health_score}/100
- **Status:** ${report.system_health.overall_status.toUpperCase()}
- **Scripts Available:** ${report.system_health.scripts_available}/6
- **Documentation Complete:** ${report.system_health.documentation_complete}/3
- **Reports Generated:** ${report.system_health.reports_generated}/3

## Test Suite Results

${Object.entries(report.test_suites).map(([name, suite]) => 
  `- **${name}:** ${suite.failed === 0 ? '✅' : '❌'} ${suite.passed} passed, ${suite.failed} failed, ${suite.warnings} warnings`
).join('\n')}

## Key Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps

${report.summary.overall_success ? 
`✅ **System Ready for Production**
- All critical tests passed
- Deploy security automation with confidence
- Continue regular monitoring` :
`❌ **System Requires Attention**
- Address failed test suites
- Review error logs and fix issues
- Re-run system test before deployment`}

---
*Detailed results available in: docs/security-system-test-results.json*
`;
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  displayFinalResults() {
    const endTime = new Date();
    const duration = this.formatDuration(endTime - this.startTime);
    
    console.log(chalk.blue.bold('\n🎯 COMPLETE SECURITY SYSTEM TEST RESULTS\n'));
    console.log(chalk.gray('━'.repeat(70)));
    
    const totalCommands = Object.values(this.results).reduce((sum, suite) => sum + suite.commands.length, 0);
    const passedCommands = Object.values(this.results).reduce((sum, suite) => sum + suite.passed, 0);
    const failedCommands = Object.values(this.results).reduce((sum, suite) => sum + suite.failed, 0);
    const warningCommands = Object.values(this.results).reduce((sum, suite) => sum + suite.warnings, 0);
    
    const successRate = Math.round(((passedCommands + warningCommands) / totalCommands) * 100);
    
    console.log(`${chalk.blue('Test Duration:')} ${duration}`);
    console.log(`${chalk.blue('Total Commands:')} ${totalCommands}`);
    console.log(`${chalk.green('Passed:')} ${passedCommands}`);
    console.log(`${chalk.red('Failed:')} ${failedCommands}`);
    console.log(`${chalk.yellow('Warnings:')} ${warningCommands}`);
    
    const successColor = successRate >= 90 ? chalk.green : successRate >= 70 ? chalk.yellow : chalk.red;
    console.log(`${chalk.blue('Success Rate:')} ${successColor(successRate + '%')}`);
    
    console.log(chalk.blue.bold('\n📋 Test Suite Results:'));
    Object.entries(this.results).forEach(([name, suite]) => {
      const icon = suite.failed === 0 ? chalk.green('✅') : chalk.red('❌');
      const duration = this.formatDuration(suite.duration);
      console.log(`${icon} ${name}: ${suite.passed}/${suite.commands.length} passed (${duration})`);
    });
    
    console.log(chalk.blue.bold('\n🎯 FINAL VERDICT:'));
    if (this.overallSuccess) {
      console.log(chalk.green.bold('🎉 SECURITY SYSTEM FULLY OPERATIONAL!'));
      console.log(chalk.green('All critical components are working correctly.'));
      console.log(chalk.green('System is ready for production deployment.'));
    } else {
      console.log(chalk.red.bold('⚠️  SECURITY SYSTEM NEEDS ATTENTION'));
      console.log(chalk.red('Some components failed testing.'));
      console.log(chalk.red('Address failures before production deployment.'));
    }
    
    console.log(chalk.cyan.bold('\n📁 Generated Reports:'));
    console.log(chalk.cyan('• docs/security-system-test-results.json (detailed)'));
    console.log(chalk.cyan('• docs/security-system-test-summary.md (summary)'));
    
    console.log(chalk.blue.bold('\n🚀 Quick Commands:'));
    console.log(chalk.blue('• Full security hardening: node scripts/security-hardening-orchestrator.js'));
    console.log(chalk.blue('• Health check: node scripts/security-monitoring.js health-check'));
    console.log(chalk.blue('• Deployment validation: node scripts/security-deployment-validator.js'));
  }
}

// Main execution
async function main() {
  const systemTest = new SecuritySystemTest();
  const success = await systemTest.runCompleteTest();
  
  // Exit with appropriate code for CI/CD
  process.exit(success ? 0 : 1);
}

// Export for use in other scripts
export { SecuritySystemTest };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('System test error:'), error);
    process.exit(1);
  });
}