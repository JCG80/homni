const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

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

let hasErrors = false;
let hasWarnings = false;
let versionConflicts = false;
let corruptedCount = 0;
let misplacedCount = 0;

function fail(msg) {
  core.error(msg);
  console.error(`❌ ${msg}`);
  hasErrors = true;
}

function warn(msg) {
  core.warning(msg);
  console.warn(`⚠️  ${msg}`);
  hasWarnings = true;
}

function success(msg) {
  core.info(msg);
  console.log(`✅ ${msg}`);
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
  } else {
    success('No corrupted packages found');
  }
  
  return corrupted;
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

    console.log(`\n📊 Dev Doctor Summary: ${status.toUpperCase()}`);
    
  } catch (error) {
    core.setFailed(`Dev Doctor failed: ${error.message}`);
  }
}

run();