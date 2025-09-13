#!/usr/bin/env ts-node

/**
 * Comprehensive Repository Health Check
 * Master validation for production readiness
 */

import checkDuplicates from './checkDuplicates';
import { checkRLS } from './checkRls';
import { checkFunctions } from './checkFunctions';
import { checkMigrations } from './checkMigrations';
import { checkLegacyRoles } from './guardLegacyRoles';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface HealthCheck {
  name: string;
  passed: boolean;
  message: string;
  critical: boolean;
}

async function runRepositoryHealth(): Promise<{ passed: boolean; score: number; checks: HealthCheck[] }> {
  console.log('🏥 Running comprehensive repository health check...\n');
  
  const checks: HealthCheck[] = [];
  
  // 1. TypeScript compilation
  try {
    console.log('📝 Checking TypeScript compilation...');
    await execAsync('npx tsc --noEmit');
    checks.push({
      name: 'TypeScript Compilation',
      passed: true,
      message: '✅ TypeScript compiles without errors',
      critical: true
    });
  } catch (error) {
    checks.push({
      name: 'TypeScript Compilation', 
      passed: false,
      message: '❌ TypeScript compilation failed',
      critical: true
    });
  }
  
  // 2. Duplicate detection
  console.log('🔍 Checking for duplicates...');
  const duplicateResult = checkDuplicates();
  checks.push({
    name: 'Duplicate Detection',
    passed: duplicateResult.passed,
    message: duplicateResult.message,
    critical: true
  });
  
  // 3. Legacy role patterns  
  console.log('👥 Checking legacy role patterns...');
  const roleResult = checkLegacyRoles();
  checks.push({
    name: 'Role Alignment',
    passed: roleResult.passed,
    message: roleResult.message,
    critical: false
  });
  
  // 4. RLS policies
  console.log('🔒 Checking RLS policies...');
  try {
    const rlsResult = await checkRLS();
    checks.push({
      name: 'RLS Policies',
      passed: rlsResult.passed,
      message: rlsResult.message,
      critical: true
    });
  } catch (error) {
    checks.push({
      name: 'RLS Policies',
      passed: false,
      message: '❌ RLS check failed: ' + (error instanceof Error ? error.message : String(error)),
      critical: true
    });
  }
  
  // 5. Database functions
  console.log('🔧 Checking database functions...');
  try {
    const funcResult = await checkFunctions();
    checks.push({
      name: 'Database Functions',
      passed: funcResult.passed,
      message: funcResult.message,
      critical: false
    });
  } catch (error) {
    checks.push({
      name: 'Database Functions',
      passed: false,
      message: '❌ Function check failed: ' + (error instanceof Error ? error.message : String(error)),
      critical: false
    });
  }
  
  // 6. Migration safety
  console.log('📋 Checking migrations...');
  const migrationResult = checkMigrations();
  checks.push({
    name: 'Migration Safety',
    passed: migrationResult.passed,
    message: migrationResult.message,
    critical: false
  });
  
  // 7. Build test
  console.log('🏗️  Testing build...');
  try {
    await execAsync('npm run build');
    checks.push({
      name: 'Build Process',
      passed: true,
      message: '✅ Build completes successfully',
      critical: true
    });
  } catch (error) {
    checks.push({
      name: 'Build Process',
      passed: false,
      message: '❌ Build failed',
      critical: true
    });
  }
  
  // Calculate health score
  const totalChecks = checks.length;
  const passedChecks = checks.filter(c => c.passed).length;
  const criticalFailed = checks.filter(c => c.critical && !c.passed).length;
  
  const score = Math.round((passedChecks / totalChecks) * 100);
  const passed = criticalFailed === 0 && score >= 80;
  
  return { passed, score, checks };
}

async function main() {
  try {
    const result = await runRepositoryHealth();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPOSITORY HEALTH REPORT');
    console.log('='.repeat(60));
    
    console.log(`Overall Score: ${result.score}%`);
    console.log(`Status: ${result.passed ? '✅ HEALTHY' : '❌ NEEDS ATTENTION'}`);
    
    console.log('\nDetailed Results:');
    result.checks.forEach(check => {
      const icon = check.passed ? '✅' : '❌';
      const critical = check.critical ? ' (CRITICAL)' : '';
      console.log(`  ${icon} ${check.name}${critical}`);
      if (!check.passed) {
        console.log(`      ${check.message}`);
      }
    });
    
    const criticalFailed = result.checks.filter(c => c.critical && !c.passed);
    if (criticalFailed.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES MUST BE FIXED BEFORE PRODUCTION:');
      criticalFailed.forEach(check => {
        console.log(`   - ${check.name}: ${check.message}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (result.passed) {
      console.log('🎉 Repository is production-ready!');
      console.log('Next steps: Deploy with confidence');
    } else {
      console.log('⚠️  Repository needs attention before production deployment');
      console.log('Fix critical issues and re-run: npm run repo:health');
    }
    
    process.exit(result.passed ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Health check failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { runRepositoryHealth };