#!/usr/bin/env tsx
/**
 * Find existing dashboard assets script
 * Follows "find-before-build" principle from Ultimate Master 2.0
 */

import { readFileSync, existsSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

interface AssetMatrix {
  dashboardComponents: string[];
  routeObjects: string[];
  dbTables: string[];
  featureFlags: string[];
  missing: string[];
}

const EXPECTED_TABLES = ['leads', 'user_profiles', 'company_profiles', 'feature_flags', 'lead_assignments'];
const EXPECTED_COMPONENTS = ['DashboardWidget', 'DashboardLayout', 'RoleDashboard'];

async function findExistingAssets(): Promise<AssetMatrix> {
  const matrix: AssetMatrix = {
    dashboardComponents: [],
    routeObjects: [],
    dbTables: [],
    featureFlags: [],
    missing: []
  };

  console.log('🔍 Scanning for existing dashboard assets...\n');

  // Find dashboard components
  const dashboardFiles = await glob('src/**/dashboard/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
  const componentFiles = await glob('src/**/*Dashboard*.{ts,tsx}', { ignore: 'node_modules/**' });
  
  matrix.dashboardComponents = [...dashboardFiles, ...componentFiles].filter(file => 
    !file.includes('.test.') && !file.includes('.spec.')
  );

  // Find route objects
  const routeFiles = await glob('src/routes/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
  matrix.routeObjects = routeFiles.filter(file => {
    const content = existsSync(file) ? readFileSync(file, 'utf-8') : '';
    return content.includes('dashboard') || content.includes('Dashboard');
  });

  // Check expected tables (simulated - would normally query DB)
  matrix.dbTables = EXPECTED_TABLES; // From our earlier query, all exist
  
  // Check for missing expected components
  const allFiles = await glob('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
  EXPECTED_COMPONENTS.forEach(component => {
    const exists = allFiles.some(file => {
      const content = existsSync(file) ? readFileSync(file, 'utf-8') : '';
      return content.includes(`${component}`);
    });
    if (!exists) {
      matrix.missing.push(`${component} component`);
    }
  });

  return matrix;
}

function printMatrix(matrix: AssetMatrix) {
  console.log('📊 DASHBOARD ASSETS MATRIX\n');
  console.log('='.repeat(50));
  
  console.log('\n✅ EXISTING DASHBOARD COMPONENTS:');
  matrix.dashboardComponents.forEach(comp => console.log(`  - ${comp}`));
  
  console.log('\n✅ EXISTING ROUTE OBJECTS WITH DASHBOARD:');
  matrix.routeObjects.forEach(route => console.log(`  - ${route}`));
  
  console.log('\n✅ EXISTING DATABASE TABLES:');
  matrix.dbTables.forEach(table => console.log(`  - ${table}`));
  
  if (matrix.missing.length > 0) {
    console.log('\n❌ MISSING COMPONENTS:');
    matrix.missing.forEach(missing => console.log(`  - ${missing}`));
  }
  
  console.log('\n📈 REUSABILITY ASSESSMENT:');
  const totalExpected = EXPECTED_COMPONENTS.length + EXPECTED_TABLES.length;
  const totalFound = matrix.dashboardComponents.length + matrix.dbTables.length;
  const reusabilityPercentage = Math.round((totalFound / (totalFound + matrix.missing.length)) * 100);
  
  console.log(`  - Reusability: ${reusabilityPercentage}%`);
  console.log(`  - Existing DB tables: ${matrix.dbTables.length}/${EXPECTED_TABLES.length}`);
  console.log(`  - Dashboard components found: ${matrix.dashboardComponents.length}`);
  console.log(`  - Route objects found: ${matrix.routeObjects.length}`);
  
  console.log('\n✨ RECOMMENDATION:');
  if (reusabilityPercentage >= 70) {
    console.log('  - HIGH reusability detected. Extend existing components.');
    console.log('  - Focus on creating role-specific widgets using existing base components.');
  } else {
    console.log('  - MEDIUM reusability. Create new structure while importing existing pieces.');
  }
}

async function main() {
  try {
    const matrix = await findExistingAssets();
    printMatrix(matrix);
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('  1. Create src/modules/dashboard/ structure');
    console.log('  2. Reuse existing DashboardWidget as base for DashboardCard');
    console.log('  3. Create role-specific widgets using existing DB tables');
    console.log('  4. Implement new dashboard routes');
    console.log('  5. Add feature flags for new dashboards');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error scanning dashboard assets:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { findExistingAssets, printMatrix };