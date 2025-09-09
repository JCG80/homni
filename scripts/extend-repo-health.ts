#!/usr/bin/env tsx
/**
 * Extended Repo Health Checker - Zero-Dupes Dev Standard
 * Enforces no JSX Routes, no duplicate headers, consistent imports
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

interface HealthCheck {
  name: string;
  passed: boolean;
  details: string[];
  critical?: boolean;
}

async function checkZeroDupesCompliance(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];

  // 1. CRITICAL: No JSX Routes outside AppRouter  
  const jsxRouteCheck: HealthCheck = {
    name: 'JSX Route Policy (CRITICAL)',
    passed: true,
    details: [],
    critical: true
  };
  
  const tsxFiles = await glob('src/**/*.tsx');
  for (const file of tsxFiles) {
    if (file.includes('AppRouter.tsx')) continue; // Skip AppRouter itself
    
    const content = readFileSync(file, 'utf8');
    if (content.includes('<Route ') && !content.includes('// JSX Route approved')) {
      jsxRouteCheck.passed = false;
      jsxRouteCheck.details.push(file);
    }
  }
  
  if (!jsxRouteCheck.passed) {
    jsxRouteCheck.details.unshift('❌ CRITICAL: JSX Routes found outside AppRouter');
    jsxRouteCheck.details.push('→ Convert to route objects in src/routes/*RouteObjects.ts');
  }
  checks.push(jsxRouteCheck);

  // 2. useToast Import Compliance
  const toastImportCheck: HealthCheck = {
    name: 'useToast Import Standard',
    passed: true,
    details: []
  };
  
  const allTsFiles = await glob('src/**/*.{ts,tsx}');
  for (const file of allTsFiles) {
    const content = readFileSync(file, 'utf8');
    if (content.includes('@/hooks/use-toast')) {
      toastImportCheck.passed = false;
      toastImportCheck.details.push(file);
    }
  }
  
  if (!toastImportCheck.passed) {
    toastImportCheck.details.unshift('❌ Old useToast imports found');
    toastImportCheck.details.push('→ Should use @/components/ui/use-toast (shadcn standard)');
  }
  checks.push(toastImportCheck);

  // 3. Lead Types Consolidation
  const leadTypesCheck: HealthCheck = {
    name: 'Lead Types Consolidation',
    passed: true,
    details: []
  };
  
  // Check if old leads.ts exists
  if (existsSync(join(process.cwd(), 'src/types/leads.ts'))) {
    leadTypesCheck.passed = false;
    leadTypesCheck.details.push('src/types/leads.ts still exists');
  }
  
  // Check for old leads imports
  for (const file of allTsFiles) {
    const content = readFileSync(file, 'utf8');
    if (content.includes('@/types/leads"') && !content.includes('leads-canonical')) {
      leadTypesCheck.passed = false;
      leadTypesCheck.details.push(file);
    }
  }
  
  if (!leadTypesCheck.passed) {
    leadTypesCheck.details.unshift('❌ Old lead types found');
    leadTypesCheck.details.push('→ Should use @/types/leads-canonical as single source');
  }
  checks.push(leadTypesCheck);

  // 4. Multiple H1 Detection
  const h1Check: HealthCheck = {
    name: 'Single H1 Policy',
    passed: true,
    details: []
  };
  
  for (const file of tsxFiles) {
    const content = readFileSync(file, 'utf8');
    const h1Matches = content.match(/<h1[^>]*>/g) || [];
    if (h1Matches.length > 1) {
      h1Check.passed = false;
      h1Check.details.push(\`\${file} has \${h1Matches.length} h1 elements\`);
    }
  }
  
  if (!h1Check.passed) {
    h1Check.details.unshift('❌ Multiple H1 elements found');
    h1Check.details.push('→ Use PageLayout with single H1, move titles to route objects');
  }
  checks.push(h1Check);

  // 5. Route Objects Existence
  const routeObjectsCheck: HealthCheck = {
    name: 'Route Objects Standard',
    passed: true,
    details: []
  };
  
  const requiredRouteFiles = [
    'src/routes/adminRouteObjects.ts',
    'src/routes/mainRouteObjects.ts', 
    'src/routes/companyRouteObjects.ts',
    'src/routes/insuranceRouteObjects.ts',
    'src/routes/adminInsuranceRouteObjects.ts'
  ];
  
  for (const routeFile of requiredRouteFiles) {
    if (!existsSync(join(process.cwd(), routeFile))) {
      routeObjectsCheck.passed = false;
      routeObjectsCheck.details.push(\`Missing: \${routeFile}\`);
    }
  }
  
  if (!routeObjectsCheck.passed) {
    routeObjectsCheck.details.unshift('❌ Missing route object files');
    routeObjectsCheck.details.push('→ Convert JSX routes to lazy-loaded route objects');
  }
  checks.push(routeObjectsCheck);

  return checks;
}

function printHealthReport(checks: HealthCheck[]): boolean {
  console.log('🏥 ZERO-DUPES REPO HEALTH REPORT');
  console.log('='.repeat(50));
  
  let allPassed = true;
  const criticalIssues = checks.filter(c => !c.passed && c.critical);
  
  if (criticalIssues.length > 0) {
    console.log('🚨 CRITICAL ISSUES (Must fix before merge):');
    criticalIssues.forEach(check => {
      console.log(\`❌ \${check.name}\`);
      check.details.forEach(detail => console.log(\`   \${detail}\`));
      console.log();
    });
    allPassed = false;
  }
  
  checks.filter(c => !c.critical).forEach(check => {
    const status = check.passed ? '✅' : '⚠️';
    console.log(\`\${status} \${check.name}\`);
    
    if (!check.passed) {
      check.details.forEach(detail => console.log(\`   \${detail}\`));
      console.log();
      allPassed = false;
    }
  });
  
  console.log('='.repeat(50));
  
  if (allPassed) {
    console.log('🎉 EXCELLENT: Zero-Dupes Standard Compliant');
    console.log('✨ Ready for production deployment');
  } else {
    console.log('❌ ISSUES FOUND: Fix above before proceeding');
    console.log('🔧 Run: npm run fix:zero-dupes');
  }
  
  return allPassed;
}

async function main() {
  try {
    console.log('🔍 Running Zero-Dupes compliance check...\n');
    
    const checks = await checkZeroDupesCompliance();
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

export { checkZeroDupesCompliance, printHealthReport };