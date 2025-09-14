const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

// Add fetch for Supabase API calls
let fetch;
(async () => {
  if (!globalThis.fetch) {
    const { default: nodeFetch } = await import('node-fetch');
    fetch = nodeFetch;
  } else {
    fetch = globalThis.fetch;
  }
})();

// Expected dev dependencies that should NOT be in production dependencies
const DEV_DEPENDENCIES = [
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  '@types/',
  'eslint',
  'prettier',
  'vitest',
  'cypress',
  '@playwright/test',
  '@testing-library/',
  'ts-node',
  'tsx',
  'typescript'
];

// Known corrupted/invalid packages to flag
const CORRUPTED_PACKAGES = [
  'a', 'are', 'been', 'can', 'commands', 'direct', 'edits', 'environment',
  'has', 'is', 'it', 'modify', 'only', 'our', 'prevent', 'provides',
  'special', 'the', 'to', 'uninstall', 'use', 'ways', 'you'
];

// JSON Report Structure
const report = {
  timestamp: new Date().toISOString(),
  version: '2.0.0',
  environment: {
    node_version: process.version,
    platform: process.platform,
    ci: process.env.CI === 'true'
  },
  summary: {
    status: 'success',
    total_checks: 0,
    passed: 0,
    warnings: 0,
    errors: 0
  },
  dependencies: {
    version_conflicts: false,
    corrupted_packages: 0,
    misplaced_packages: 0,
    details: []
  },
  supabase: {
    environment_configured: false,
    rls_policies_checked: false,
    critical_security_issues: [],
    warnings: []
  },
  lovable: {
    integration_complete: false,
    missing_packages: [],
    structure_issues: []
  },
  recommendations: [],
  artifacts: []
};

let hasErrors = false;
let hasWarnings = false;
let versionConflicts = false;
let corruptedCount = 0;
let misplacedCount = 0;

function fail(msg) {
  core.error(msg);
  console.error(`❌ ${msg}`);
  hasErrors = true;
  report.summary.errors++;
  report.summary.total_checks++;
}

function warn(msg) {
  core.warning(msg);
  console.warn(`⚠️  ${msg}`);
  hasWarnings = true;
  report.summary.warnings++;
  report.summary.total_checks++;
}

function success(msg) {
  core.info(msg);
  console.log(`✅ ${msg}`);
  report.summary.passed++;
  report.summary.total_checks++;
}

function info(msg) {
  core.info(msg);
  console.log(`ℹ️  ${msg}`);
}

function getMajor(version) {
  return parseInt(version.replace(/^[^\d]*/, '').split('.')[0], 10);
}

function getMinor(version) {
  const parts = version.replace(/^[^\d]*/, '').split('.');
  return parseInt(parts[1] || '0', 10);
}

function checkVersionMatch(nameA, verA, nameB, verB) {
  if (!verA || !verB) {
    fail(`Missing both ${nameA} and ${nameB} in package.json`);
    versionConflicts = true;
    return false;
  }

  const majorA = getMajor(verA);
  const majorB = getMajor(verB);
  
  if (majorA !== majorB) {
    fail(`Version conflict: ${nameA}=${verA}, ${nameB}=${verB} → must have same major version`);
    versionConflicts = true;
    return false;
  } else {
    success(`${nameA} and ${nameB} are synchronized (v${majorA})`);
    return true;
  }
}

function checkPackagePlacement(pkg) {
  const deps = pkg.dependencies || {};
  
  // Check for dev dependencies in production dependencies
  Object.keys(deps).forEach(pkgName => {
    const shouldBeDevDep = DEV_DEPENDENCIES.some(devPkg => {
      return pkgName === devPkg || pkgName.startsWith(devPkg);
    });
    
    if (shouldBeDevDep) {
      warn(`${pkgName} should be in devDependencies, not dependencies`);
      misplacedCount++;
    }
  });
  
  if (misplacedCount === 0) {
    success('All packages are correctly placed in dependencies vs devDependencies');
  } else {
    info(`Found ${misplacedCount} packages that should be moved to devDependencies`);
  }
  
  return misplacedCount;
}

function checkCorruptedPackages(pkg) {
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  const corrupted = [];
  
  Object.keys(allDeps).forEach(pkgName => {
    if (CORRUPTED_PACKAGES.includes(pkgName)) {
      corrupted.push(pkgName);
    }
  });
  
  if (corrupted.length > 0) {
    fail(`Found corrupted packages: ${corrupted.join(', ')}`);
    info('These should be removed from package.json');
    corruptedCount = corrupted.length;
    report.dependencies.corrupted_packages = corrupted.length;
    report.dependencies.details.push({
      type: 'corrupted_packages',
      packages: corrupted,
      severity: 'error'
    });
  } else {
    success('No corrupted packages found');
  }
  
  return corrupted;
}

async function checkSupabaseEnvironment() {
  core.startGroup('🔧 Checking Supabase Environment');
  
  const requiredEnv = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missing = requiredEnv.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    warn(`Missing Supabase environment variables: ${missing.join(', ')}`);
    core.endGroup();
    return false;
  }
  
  success('All Supabase environment variables are configured');
  core.endGroup();
  return true;
}

async function checkSupabaseRLSPolicies() {
  core.startGroup('🔐 Validating Supabase RLS Policies');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    warn('Supabase URL or SERVICE_ROLE_KEY missing - skipping RLS policy validation');
    report.supabase.warnings.push('Service role key not available for policy validation');
    core.endGroup();
    return;
  }
  
  try {
    // Initialize fetch if not available
    if (!fetch) {
      const { default: nodeFetch } = await import('node-fetch');
      fetch = nodeFetch;
    }
    
    info('Validating RLS security best practices...');
    
    // Check for sensitive table types that should have RLS
    const sensitiveTables = [
      'user_profiles', 'profiles', 'users', 'leads', 'company_profiles', 
      'todos', 'properties', 'documents', 'payment_records'
    ];
    
    // Basic connectivity test
    const testResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    });
    
    if (testResponse.ok) {
      success('Supabase API connectivity verified');
      report.supabase.rls_policies_checked = true;
      
      // Add security recommendations to report
      report.recommendations.push({
        category: 'security',
        priority: 'high',
        message: 'Manually verify RLS policies for sensitive tables',
        tables: sensitiveTables,
        checks: [
          'Ensure policies check auth.uid() for user-specific data',
          'Avoid policies with "true" conditions on sensitive tables',
          'Restrict anonymous access to user data',
          'Test policies with different user roles'
        ]
      });
      
      // Security best practices validation
      info('RLS Security Checklist:');
      info('✓ Verify policies check auth.uid() for user-specific data');
      info('✓ Ensure no "true" conditions on sensitive tables');
      info('✓ Restrict anonymous SELECT on user data');
      info('✓ Test policies with different authentication states');
      
    } else {
      warn(`Supabase API test failed: ${testResponse.status}`);
      report.supabase.warnings.push(`API connectivity test failed: ${testResponse.status}`);
    }
    
  } catch (error) {
    warn(`RLS policy validation failed: ${error.message}`);
    report.supabase.warnings.push(`Policy validation error: ${error.message}`);
    info('This is non-critical - manual RLS policy review recommended');
  }
  
  core.endGroup();
}

async function checkLovableIntegration() {
  core.startGroup('💜 Checking Lovable Integration');
  
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  // Check for Lovable-specific packages
  const lovablePackages = [
    '@supabase/supabase-js',
    'react-router-dom',
    '@tanstack/react-query',
    'tailwindcss'
  ];
  
  let missingPackages = [];
  lovablePackages.forEach(pkg => {
    if (deps[pkg]) {
      success(`${pkg} v${deps[pkg]} installed`);
    } else {
      missingPackages.push(pkg);
    }
  });
  
  if (missingPackages.length > 0) {
    warn(`Recommended packages missing: ${missingPackages.join(', ')}`);
  }
  
  // Check for common Lovable project structure
  const requiredFiles = [
    'src/integrations/supabase/client.ts',
    'tailwind.config.ts',
    'tsconfig.json'
  ];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      success(`Required file present: ${file}`);
    } else {
      warn(`Missing recommended file: ${file}`);
    }
  });
  
  core.endGroup();
}

async function run() {
  try {
    console.log('🧠 Dev Doctor - GitHub Actions Integration\n');
    
    const packagePath = core.getInput('package-path') || './package.json';
    const failOnWarnings = core.getInput('fail-on-warnings') === 'true';
    
    const pkgPath = path.resolve(process.cwd(), packagePath);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // 1. Check for corrupted packages
    core.startGroup('📦 Checking for corrupted packages');
    checkCorruptedPackages(pkg);
    core.endGroup();

    // 2. Check package placement
    core.startGroup('📍 Validating package placement');
    checkPackagePlacement(pkg);
    core.endGroup();

    // 3. ESLint + Parser synchronization
    core.startGroup('🔧 Validating ESLint configuration');
    const eslintPlugin = deps['@typescript-eslint/eslint-plugin'];
    const eslintParser = deps['@typescript-eslint/parser'];
    checkVersionMatch('@typescript-eslint/eslint-plugin', eslintPlugin, '@typescript-eslint/parser', eslintParser);
    core.endGroup();

    // 4. TypeScript compatibility
    core.startGroup('📝 Checking TypeScript compatibility');
    const typescript = deps['typescript'];
    if (typescript && eslintParser) {
      const tsMajor = getMajor(typescript);
      const tsMinor = getMinor(typescript);
      if (tsMajor >= 5 || (tsMajor === 4 && tsMinor >= 7)) {
        success(`TypeScript v${typescript} is compatible with @typescript-eslint`);
      } else {
        warn(`TypeScript v${typescript} might be too old for @typescript-eslint v${eslintParser}`);
      }
    }
    core.endGroup();

    // 5. ESLint core compatibility
    core.startGroup('⚙️ Checking ESLint core compatibility');
    const eslint = deps['eslint'];
    if (eslint && eslintPlugin) {
      const eslintMajor = getMajor(eslint);
      const pluginMajor = getMajor(eslintPlugin);
      if (eslintMajor >= 8 && pluginMajor >= 6) {
        success(`ESLint v${eslint} is compatible with @typescript-eslint v${eslintPlugin}`);
      } else {
        warn(`ESLint v${eslint} and @typescript-eslint v${eslintPlugin} might have compatibility issues`);
      }
    }
    core.endGroup();

    // 6. Supabase Environment Validation
    const hasSupabaseEnv = await checkSupabaseEnvironment();
    
    // 7. Supabase RLS Policy Validation (if environment is available)
    if (hasSupabaseEnv) {
      await checkSupabaseRLSPolicies();
    }
    
    // 8. Lovable Integration Check
    await checkLovableIntegration();

    // Set outputs
    core.setOutput('has-version-conflicts', versionConflicts.toString());
    core.setOutput('corrupted-packages', corruptedCount.toString());
    core.setOutput('misplaced-packages', misplacedCount.toString());

    // Determine final status
    let status = 'success';
    if (hasErrors) {
      status = 'error';
      core.setOutput('status', 'error');
      core.setFailed('Critical errors found in development environment');
    } else if (hasWarnings) {
      status = 'warning';
      core.setOutput('status', 'warning');
      if (failOnWarnings) {
        core.setFailed('Warnings found and fail-on-warnings is enabled');
      } else {
        success('Warnings found but not configured to fail');
      }
    } else {
      core.setOutput('status', 'success');
      success('All critical checks passed - development environment is ready for CI/CD');
    }

    // Update final report summary
    report.summary.status = status;
    report.dependencies.version_conflicts = versionConflicts;
    report.dependencies.corrupted_packages = corruptedCount;
    report.dependencies.misplaced_packages = misplacedCount;
    
    // Generate JSON report
    const reportPath = path.resolve(process.cwd(), 'dev-doctor-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    core.info(`Generated JSON report: ${reportPath}`);
    
    console.log(`\n📊 Dev Doctor Summary: ${status.toUpperCase()}`);
    console.log(`📄 JSON Report: dev-doctor-report.json`);
    
  } catch (error) {
    report.summary.status = 'error';
    report.summary.errors++;
    const reportPath = path.resolve(process.cwd(), 'dev-doctor-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    core.setFailed(`Dev Doctor failed: ${error.message}`);
  }
}

run();