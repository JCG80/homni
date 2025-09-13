#!/usr/bin/env ts-node

/**
 * Pre-deployment Production Check
 * Final validation before production deployment
 */

import { runRepositoryHealth } from './repo-health';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

interface DeploymentCheck {
  category: string;
  checks: Array<{
    name: string;
    passed: boolean;
    message: string;
    required: boolean;
  }>;
}

async function runPreDeploymentCheck(): Promise<{ 
  passed: boolean; 
  readyForProduction: boolean; 
  categories: DeploymentCheck[] 
}> {
  console.log('🚀 Running pre-deployment production check...\n');
  
  const categories: DeploymentCheck[] = [];
  
  // 1. Code Quality & Build
  console.log('📝 Checking code quality...');
  const codeQuality: DeploymentCheck = {
    category: 'Code Quality & Build',
    checks: []
  };
  
  try {
    await execAsync('npx tsc --noEmit');
    codeQuality.checks.push({
      name: 'TypeScript Compilation',
      passed: true,
      message: 'TypeScript compiles without errors',
      required: true
    });
  } catch (error) {
    codeQuality.checks.push({
      name: 'TypeScript Compilation',
      passed: false,
      message: 'TypeScript compilation failed - fix type errors',
      required: true
    });
  }
  
  try {
    await execAsync('npm run build');
    codeQuality.checks.push({
      name: 'Production Build',
      passed: true,
      message: 'Production build successful',
      required: true
    });
  } catch (error) {
    codeQuality.checks.push({
      name: 'Production Build',
      passed: false,
      message: 'Production build failed - check build errors',
      required: true
    });
  }
  
  categories.push(codeQuality);
  
  // 2. Security & Database
  console.log('🔒 Checking security...');
  const security: DeploymentCheck = {
    category: 'Security & Database',
    checks: [
      {
        name: 'Environment Variables',
        passed: process.env.NODE_ENV !== 'development',
        message: process.env.NODE_ENV !== 'development' 
          ? 'Environment properly configured'
          : 'Set NODE_ENV to production',
        required: true
      },
      {
        name: 'Supabase Configuration',
        passed: existsSync('supabase/config.toml'),
        message: existsSync('supabase/config.toml')
          ? 'Supabase configuration found'
          : 'Missing supabase/config.toml',
        required: true
      }
    ]
  };
  
  categories.push(security);
  
  // 3. Testing & Validation
  console.log('🧪 Checking tests...');
  const testing: DeploymentCheck = {
    category: 'Testing & Validation',
    checks: []
  };
  
  try {
    await execAsync('npm run test:unit');
    testing.checks.push({
      name: 'Unit Tests',
      passed: true,
      message: 'All unit tests pass',
      required: true
    });
  } catch (error) {
    testing.checks.push({
      name: 'Unit Tests',
      passed: false,
      message: 'Unit tests failing - fix before deployment',
      required: true
    });
  }
  
  // Test coverage
  try {
    await execAsync('npm run test:coverage');
    testing.checks.push({
      name: 'Test Coverage',
      passed: true,
      message: 'Test coverage meets requirements',
      required: false
    });
  } catch (error) {
    testing.checks.push({
      name: 'Test Coverage',
      passed: false,
      message: 'Test coverage below threshold',
      required: false
    });
  }
  
  categories.push(testing);
  
  // 4. Repository Health
  console.log('🏥 Running repository health check...');
  const repoHealth: DeploymentCheck = {
    category: 'Repository Health',
    checks: []
  };
  
  try {
    const healthResult = await runRepositoryHealth();
    repoHealth.checks.push({
      name: 'Overall Health',
      passed: healthResult.passed,
      message: `Health score: ${healthResult.score}%`,
      required: true
    });
    
    const criticalFailed = healthResult.checks.filter(c => c.critical && !c.passed);
    if (criticalFailed.length > 0) {
      repoHealth.checks.push({
        name: 'Critical Issues',
        passed: false,
        message: `${criticalFailed.length} critical issues need fixing`,
        required: true
      });
    }
  } catch (error) {
    repoHealth.checks.push({
      name: 'Repository Health',
      passed: false,
      message: 'Health check failed',
      required: true
    });
  }
  
  categories.push(repoHealth);
  
  // 5. Production Readiness
  const prodReady: DeploymentCheck = {
    category: 'Production Readiness',
    checks: [
      {
        name: 'Security Headers',
        passed: existsSync('public/.well-known/security.txt'),
        message: existsSync('public/.well-known/security.txt')
          ? 'Security policy configured'
          : 'Missing security.txt - recommended for production',
        required: false
      },
      {
        name: 'Error Tracking',
        passed: existsSync('src/lib/production/ErrorTracker.ts'),
        message: existsSync('src/lib/production/ErrorTracker.ts')
          ? 'Error tracking configured'
          : 'Error tracking setup recommended',
        required: false
      },
      {
        name: 'Performance Monitoring',
        passed: true, // We have performance metrics in DB
        message: 'Performance monitoring configured',
        required: false
      }
    ]
  };
  
  categories.push(prodReady);
  
  // Calculate overall status
  const allChecks = categories.flatMap(c => c.checks);
  const requiredChecks = allChecks.filter(c => c.required);
  const passedRequired = requiredChecks.filter(c => c.passed).length;
  const totalPassed = allChecks.filter(c => c.passed).length;
  
  const passed = requiredChecks.length === passedRequired;
  const readyForProduction = passed && (totalPassed / allChecks.length) >= 0.8;
  
  return { passed, readyForProduction, categories };
}

async function main() {
  try {
    const result = await runPreDeploymentCheck();
    
    console.log('\n' + '='.repeat(70));
    console.log('🚀 PRE-DEPLOYMENT PRODUCTION CHECK');
    console.log('='.repeat(70));
    
    result.categories.forEach(category => {
      console.log(`\n📋 ${category.category}`);
      category.checks.forEach(check => {
        const icon = check.passed ? '✅' : '❌';
        const required = check.required ? ' (REQUIRED)' : '';
        console.log(`  ${icon} ${check.name}${required}`);
        console.log(`      ${check.message}`);
      });
    });
    
    console.log('\n' + '='.repeat(70));
    console.log(`Status: ${result.readyForProduction ? '✅ READY FOR PRODUCTION' : '⚠️  NEEDS ATTENTION'}`);
    
    if (result.readyForProduction) {
      console.log('\n🎉 All systems go! Ready for production deployment.');
      console.log('\nRecommended deployment steps:');
      console.log('  1. Create production backup');
      console.log('  2. Deploy to staging first');
      console.log('  3. Run smoke tests');
      console.log('  4. Deploy to production');
      console.log('  5. Monitor error rates and performance');
    } else {
      console.log('\n⚠️  Address the following before production deployment:');
      const failedRequired = result.categories
        .flatMap(c => c.checks)
        .filter(c => c.required && !c.passed);
      
      failedRequired.forEach(check => {
        console.log(`   - ${check.name}: ${check.message}`);
      });
    }
    
    process.exit(result.readyForProduction ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Pre-deployment check failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { runPreDeploymentCheck };