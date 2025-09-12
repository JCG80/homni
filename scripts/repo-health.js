#!/usr/bin/env node

/**
 * Repo Health Check Script
 * Validates project integrity before deployment
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class HealthChecker {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  async runCheck(name, command, isRequired = true) {
    console.log(`🔍 Running: ${name}...`);
    try {
      const { stdout, stderr } = await execAsync(command);
      this.results.push({ name, status: 'PASS', message: 'OK', isRequired });
      this.passed++;
      console.log(`✅ ${name}: PASSED`);
      return true;
    } catch (error) {
      const message = error.message || error.stderr || 'Unknown error';
      this.results.push({ name, status: 'FAIL', message, isRequired });
      this.failed++;
      console.log(`❌ ${name}: FAILED - ${message}`);
      return false;
    }
  }

  async runHealthChecks() {
    console.log('🏥 Starting Repo Health Check...\n');

    // TypeScript compilation
    await this.runCheck('TypeScript Check', 'npx tsc --noEmit');
    
    // ESLint
    await this.runCheck('ESLint Check', 'npx eslint . --ext .ts,.tsx --max-warnings 0');
    
    // Build check
    await this.runCheck('Build Check', 'npm run build');
    
    // Security audit
    await this.runCheck('Security Audit', 'npm audit --audit-level=moderate', false);
    
    // Check for console.log statements
    await this.runCheck('Console Log Check', 'grep -r "console\\.log" src/ && exit 1 || exit 0', false);
    
    console.log('\n📊 Health Check Summary:');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    
    if (this.failed > 0) {
      console.log('\n❌ Health check failed. Please fix the issues above before deploying.');
      process.exit(1);
    } else {
      console.log('\n🎉 All health checks passed! Repository is deployment-ready.');
      process.exit(0);
    }
  }
}

// Run health checks
const checker = new HealthChecker();
checker.runHealthChecks().catch(error => {
  console.error('❌ Health check script failed:', error);
  process.exit(1);
});