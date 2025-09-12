#!/usr/bin/env node

/**
 * Final Quality Gate Check for HOMNI
 * Comprehensive validation before deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Running HOMNI Final Quality Gate Check...\n');

const checks = [];

// Check 1: Health scripts
async function runHealthChecks() {
  console.log('1️⃣  Running health checks...');
  try {
    if (fs.existsSync('scripts/health/check-duplicate-checklists.js')) {
      execSync('node scripts/health/check-duplicate-checklists.js', { stdio: 'inherit' });
    }
    if (fs.existsSync('scripts/health/check-routes-and-imports.js')) {
      execSync('node scripts/health/check-routes-and-imports.js', { stdio: 'inherit' });
    }
    if (fs.existsSync('scripts/health/check-docs-updated.js')) {
      execSync('node scripts/health/check-docs-updated.js', { stdio: 'inherit' });
    }
    checks.push('✅ Health checks passed');
  } catch (error) {
    checks.push('❌ Health checks failed');
    console.error('Health check error:', error.message);
  }
}

// Check 2: TypeScript compilation
async function checkTypeScript() {
  console.log('\n2️⃣  Checking TypeScript compilation...');
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    checks.push('✅ TypeScript compilation passed');
  } catch (error) {
    checks.push('❌ TypeScript compilation failed');
    console.error('TypeScript error - check for type errors');
  }
}

// Check 3: Critical files exist
function checkCriticalFiles() {
  console.log('\n3️⃣  Checking critical files...');
  const criticalFiles = [
    'src/lib/supabaseClient.ts',
    'src/components/auth/RequireAuth.tsx',
    'src/modules/maintenance/components/MaintenanceDashboard.tsx',
    'src/modules/maintenance/README.md',
    'ROADMAP.md',
    '.github/workflows/ci.yml'
  ];
  
  const missing = criticalFiles.filter(file => !fs.existsSync(file));
  if (missing.length === 0) {
    checks.push('✅ All critical files present');
  } else {
    checks.push(`❌ Missing critical files: ${missing.join(', ')}`);
  }
}

// Check 4: Feature flags and routes
function checkFeatureIntegration() {
  console.log('\n4️⃣  Checking feature integration...');
  try {
    const shellContent = fs.readFileSync('src/components/layout/Shell.tsx', 'utf8');
    const maintenanceRoutes = fs.readFileSync('src/routes/maintenanceRouteObjects.ts', 'utf8');
    
    if (shellContent.includes('maintenanceRouteObjects') && 
        maintenanceRoutes.includes('maintenance/dashboard')) {
      checks.push('✅ Feature integration verified');
    } else {
      checks.push('❌ Feature integration incomplete');
    }
  } catch (error) {
    checks.push('❌ Could not verify feature integration');
  }
}

// Check 5: Debug components (admin only)
function checkDebugComponents() {
  console.log('\n5️⃣  Checking debug components...');
  const debugFiles = [
    'src/components/debug/UpdateAppButton.tsx',
    'src/components/debug/EnvProbe.tsx',
    'src/components/router/RouterDiagnostics.tsx'
  ];
  
  const existing = debugFiles.filter(file => fs.existsSync(file));
  if (existing.length === debugFiles.length) {
    checks.push('✅ Debug components available');
  } else {
    checks.push(`❌ Missing debug components: ${debugFiles.length - existing.length}`);
  }
}

// Run all checks
async function runAllChecks() {
  await runHealthChecks();
  await checkTypeScript();
  checkCriticalFiles();
  checkFeatureIntegration();
  checkDebugComponents();
  
  console.log('\n📊 Final Quality Gate Results:');
  console.log('================================');
  checks.forEach(check => console.log(check));
  
  const passed = checks.filter(c => c.startsWith('✅')).length;
  const total = checks.length;
  
  console.log(`\n📈 Score: ${passed}/${total} checks passed`);
  
  if (passed === total) {
    console.log('\n🎉 HOMNI implementation ready for deployment!');
    console.log('All quality gates passed successfully.');
  } else {
    console.log('\n⚠️  Some quality gates failed. Review and fix issues before deployment.');
    process.exit(1);
  }
}

runAllChecks().catch(error => {
  console.error('Quality gate check failed:', error);
  process.exit(1);
});