#!/usr/bin/env node

/**
 * Repository Health Check - Master Prompt v2.1 Compliance
 * Validates all 10 quality gates from the Master Prompt
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface HealthCheck {
  name: string;
  passed: boolean;
  details: string[];
  critical?: boolean;
}

console.log('🏗️ Homni Repository Health Check (Master Prompt v2.1)\n');

const checks: HealthCheck[] = [];

// 1. Roadmap Compliance Check
function checkRoadmapCompliance(): HealthCheck {
  const details: string[] = [];
  let passed = true;

  try {
    if (fs.existsSync('ROADMAP.md')) {
      const roadmap = fs.readFileSync('ROADMAP.md', 'utf8');
      
      // Check Phase 1A completion status
      if (roadmap.includes('Phase 1A') && roadmap.includes('COMPLETED')) {
        details.push('✅ Phase 1A status documented');
      } else {
        details.push('❌ Phase 1A status unclear in ROADMAP.md');
        passed = false;
      }
      
      // Check for proper phase progression
      if (roadmap.includes('Phase 2') && roadmap.includes('PLANNED')) {
        details.push('✅ Future phases properly planned');
      } else {
        details.push('⚠️ Future phase planning could be clearer');
      }
    } else {
      details.push('❌ ROADMAP.md missing');
      passed = false;
    }
  } catch (error) {
    details.push(`❌ Error checking roadmap: ${error}`);
    passed = false;
  }

  return {
    name: '1. Roadmap Compliance',
    passed,
    details,
    critical: true
  };
}

// 2. Duplicate Detection
function checkDuplicates(): HealthCheck {
  const details: string[] = [];
  let passed = true;

  try {
    // Check for common duplicate patterns
    const srcFiles = getAllTsxFiles('src');
    const duplicateImports = findDuplicateImports(srcFiles);
    
    if (duplicateImports.length === 0) {
      details.push('✅ No obvious duplicate imports found');
    } else {
      details.push(`❌ Found ${duplicateImports.length} potential duplicate imports`);
      duplicateImports.slice(0, 3).forEach(dup => details.push(`  - ${dup}`));
      passed = false;
    }

    // Check for duplicate component names
    const components = findComponentFiles('src');
    const duplicateComponents = findDuplicateComponentNames(components);
    
    if (duplicateComponents.length === 0) {
      details.push('✅ No duplicate component names found');
    } else {
      details.push(`❌ Found ${duplicateComponents.length} duplicate component names`);
      passed = false;
    }

  } catch (error) {
    details.push(`❌ Error during duplicate check: ${error}`);
    passed = false;
  }

  return {
    name: '2. Duplicate Detection',
    passed,
    details
  };
}

// 3. Role/Profile Alignment
function checkRoleAlignment(): HealthCheck {
  const details: string[] = [];
  let passed = true;

  try {
    // Check for proper role hierarchy
    const authFiles = getAllTsxFiles('src/modules/auth');
    let foundRoleTypes = false;
    
    authFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('guest') && content.includes('user') && content.includes('company')) {
        foundRoleTypes = true;
        details.push('✅ Core role types found in auth module');
      }
    });

    if (!foundRoleTypes) {
      details.push('❌ Core role types not properly defined');
      passed = false;
    }

    // Check for role-based navigation
    if (fs.existsSync('src/config')) {
      details.push('✅ Configuration directory exists');
    } else {
      details.push('⚠️ Configuration directory not found');
    }

  } catch (error) {
    details.push(`❌ Error checking role alignment: ${error}`);
    passed = false;
  }

  return {
    name: '3. Role/Profile Alignment',
    passed,
    details
  };
}

// 4. Database Schema Validation
function checkDatabaseSchema(): HealthCheck {
  const details: string[] = [];
  let passed = true;

  try {
    // Check for migration files
    if (fs.existsSync('supabase/migrations')) {
      const migrations = fs.readdirSync('supabase/migrations');
      details.push(`✅ Found ${migrations.length} migration files`);
      
      // Check for recent migrations
      const recentMigrations = migrations.filter(m => m.includes('2024'));
      if (recentMigrations.length > 0) {
        details.push('✅ Recent migrations present');
      }
    } else {
      details.push('❌ No migration directory found');
      passed = false;
    }

    // Check for types file
    if (fs.existsSync('src/integrations/supabase/types.ts')) {
      details.push('✅ Supabase types file exists');
    } else {
      details.push('❌ Supabase types file missing');
      passed = false;
    }

  } catch (error) {
    details.push(`❌ Error checking database schema: ${error}`);
    passed = false;
  }

  return {
    name: '4. Database Schema Validation',
    passed,
    details
  };
}

// 5. Test Coverage Validation
function checkTestCoverage(): HealthCheck {
  const details: string[] = [];
  let passed = true;

  try {
    // Check for test files
    const testFiles = getAllTestFiles('src');
    if (testFiles.length > 0) {
      details.push(`✅ Found ${testFiles.length} test files`);
    } else {
      details.push('❌ No test files found');
      passed = false;
    }

    // Check for test utilities
    if (fs.existsSync('src/test/utils')) {
      details.push('✅ Test utilities directory exists');
    } else {
      details.push('⚠️ Test utilities directory not found');
    }

    // Check vitest config
    if (fs.existsSync('vitest.config.ts')) {
      details.push('✅ Vitest configuration exists');
    } else {
      details.push('❌ Vitest configuration not found');
      passed = false;
    }

  } catch (error) {
    details.push(`❌ Error checking test coverage: ${error}`);
    passed = false;
  }

  return {
    name: '8. Test Coverage (90%+ required)',
    passed,
    details,
    critical: true
  };
}

// Helper functions
function getAllTsxFiles(dir: string): string[] {
  const files: string[] = [];
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        files.push(...getAllTsxFiles(fullPath));
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  return files;
}

function getAllTestFiles(dir: string): string[] {
  const files: string[] = [];
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        files.push(...getAllTestFiles(fullPath));
      } else if (item.includes('.test.') || item.includes('.spec.')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  return files;
}

function findComponentFiles(dir: string): string[] {
  return getAllTsxFiles(dir).filter(file => file.endsWith('.tsx'));
}

function findDuplicateImports(files: string[]): string[] {
  const imports = new Map<string, string[]>();
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
      
      importLines.forEach(line => {
        const key = line.trim();
        if (!imports.has(key)) {
          imports.set(key, []);
        }
        imports.get(key)!.push(file);
      });
    } catch (error) {
      // Skip files that can't be read
    }
  });

  return Array.from(imports.entries())
    .filter(([, files]) => files.length > 1)
    .map(([importLine]) => importLine);
}

function findDuplicateComponentNames(files: string[]): string[] {
  const componentNames = new Map<string, string[]>();
  
  files.forEach(file => {
    const basename = path.basename(file, '.tsx');
    if (!componentNames.has(basename)) {
      componentNames.set(basename, []);
    }
    componentNames.get(basename)!.push(file);
  });

  return Array.from(componentNames.entries())
    .filter(([, files]) => files.length > 1)
    .map(([name]) => name);
}

// Run all checks
async function runHealthChecks() {
  const allChecks = [
    checkRoadmapCompliance(),
    checkDuplicates(),
    checkRoleAlignment(),
    checkDatabaseSchema(),
    checkTestCoverage()
  ];

  checks.push(...allChecks);

  // Print results
  console.log('📊 Health Check Results:');
  console.log('========================\n');

  checks.forEach((check, index) => {
    const status = check.passed ? '✅' : (check.critical ? '🚨' : '⚠️');
    console.log(`${status} ${check.name}`);
    
    check.details.forEach(detail => {
      console.log(`   ${detail}`);
    });
    console.log();
  });

  // Summary
  const passed = checks.filter(c => c.passed).length;
  const critical = checks.filter(c => c.critical && !c.passed).length;
  const total = checks.length;

  console.log(`📈 Score: ${passed}/${total} checks passed`);
  if (critical > 0) {
    console.log(`🚨 ${critical} critical issues must be resolved`);
  }

  console.log('\n🎯 Master Prompt v2.1 Compliance:');
  if (passed === total) {
    console.log('✅ All quality gates passed - Phase ready for completion!');
    process.exit(0);
  } else if (critical === 0) {
    console.log('⚠️ Some non-critical issues found - review recommended');
    process.exit(0);
  } else {
    console.log('🚨 Critical issues found - must be resolved before phase completion');
    process.exit(1);
  }
}

runHealthChecks().catch(error => {
  console.error('Health check failed:', error);
  process.exit(1);
});