#!/usr/bin/env tsx
/**
 * Repository health checker
 * Prevents bad patterns and enforces Ultimate Master 2.0 standards
 */

import { readFileSync, existsSync } from 'fs';
import { glob } from 'glob';

interface HealthCheck {
  name: string;
  passed: boolean;
  details: string[];
}

async function checkRepoHealth(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];

  // 1. Forbid JSX <Route> outside AppRouter
  const jsxRouteCheck: HealthCheck = {
    name: 'JSX Route Policy',
    passed: true,
    details: []
  };

  const tsxFiles = await glob('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
  
  for (const file of tsxFiles) {
    if (!existsSync(file)) continue;
    
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    // Check for JSX <Route> usage
    lines.forEach((line, index) => {
      if (line.includes('<Route') && !file.includes('AppRouter') && !file.includes('index.tsx')) {
        jsxRouteCheck.passed = false;
        jsxRouteCheck.details.push(`${file}:${index + 1} - JSX Route found outside AppRouter`);
      }
    });
  }
  
  checks.push(jsxRouteCheck);

  // 2. Check for duplicate dashboard components
  const duplicateCheck: HealthCheck = {
    name: 'Duplicate Dashboard Check',
    passed: true,
    details: []
  };

  const dashboardFiles = await glob('src/**/*Dashboard*.{ts,tsx}', { ignore: 'node_modules/**' });
  const dashboardNames = new Map<string, string[]>();

  dashboardFiles.forEach(file => {
    const fileName = file.split('/').pop()?.replace(/\.(ts|tsx)$/, '') || '';
    if (!dashboardNames.has(fileName)) {
      dashboardNames.set(fileName, []);
    }
    dashboardNames.get(fileName)?.push(file);
  });

  dashboardNames.forEach((files, name) => {
    if (files.length > 1) {
      duplicateCheck.passed = false;
      duplicateCheck.details.push(`Duplicate dashboard '${name}': ${files.join(', ')}`);
    }
  });

  checks.push(duplicateCheck);

  // 3. Check for casing issues (TS1261 prevention)
  const casingCheck: HealthCheck = {
    name: 'File Casing Consistency',
    passed: true,
    details: []
  };

  const allFiles = await glob('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
  const fileNames = new Map<string, string[]>();

  allFiles.forEach(file => {
    const fileName = file.split('/').pop()?.toLowerCase() || '';
    if (!fileNames.has(fileName)) {
      fileNames.set(fileName, []);
    }
    fileNames.get(fileName)?.push(file);
  });

  fileNames.forEach((files, name) => {
    if (files.length > 1) {
      const actualNames = files.map(f => f.split('/').pop());
      const uniqueNames = [...new Set(actualNames)];
      if (uniqueNames.length > 1) {
        casingCheck.passed = false;
        casingCheck.details.push(`Casing conflict: ${uniqueNames.join(' vs ')}`);
      }
    }
  });

  checks.push(casingCheck);

  return checks;
}

function printHealthReport(checks: HealthCheck[]) {
  console.log('🏥 REPOSITORY HEALTH REPORT\n');
  console.log('='.repeat(50));

  let allPassed = true;
  
  checks.forEach(check => {
    const status = check.passed ? '✅' : '❌';
    console.log(`\n${status} ${check.name}`);
    
    if (!check.passed) {
      allPassed = false;
      check.details.forEach(detail => {
        console.log(`  - ${detail}`);
      });
    } else if (check.details.length > 0) {
      console.log(`  - ${check.details.length} items checked, all good`);
    }
  });

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Overall Health: ${allPassed ? '✅ HEALTHY' : '❌ ISSUES FOUND'}`);
  
  if (!allPassed) {
    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('  - Consolidate duplicate components');
    console.log('  - Use Route Objects instead of JSX <Route>');
    console.log('  - Fix file casing inconsistencies');
  }

  return allPassed;
}

async function main() {
  try {
    console.log('🔍 Running repository health checks...\n');
    
    const checks = await checkRepoHealth();
    const healthy = printHealthReport(checks);
    
    process.exit(healthy ? 0 : 1);
  } catch (error) {
    console.error('❌ Error running health checks:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { checkRepoHealth, printHealthReport };