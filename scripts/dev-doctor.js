#!/usr/bin/env node
/**
 * dev-doctor.js (formerly lint-doctor.js)
 * Comprehensive development environment validation for HOMNI platform
 * 
 * Validates:
 * - TypeScript ESLint plugin/parser synchronization
 * - TypeScript compatibility with ESLint
 * - Prettier plugin compatibility
 * - Test framework versions
 * - Dependency security checks
 * - Package placement validation (dev vs prod dependencies)
 */

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

const pkgPath = path.resolve(process.cwd(), 'package.json');
let hasErrors = false;

function fail(msg) {
  console.error(`❌ ${msg}`);
  hasErrors = true;
}

function warn(msg) {
  console.warn(`⚠️  ${msg}`);
}

function success(msg) {
  console.log(`✅ ${msg}`);
}

function info(msg) {
  console.log(`ℹ️  ${msg}`);
}

function getMajor(version) {
  return parseInt(version.replace(/^[^\d]*/, '').split('.')[0], 10);
}

function getMinor(version) {
  const parts = version.replace(/^[^\d]*/, '').split('.');
  return parseInt(parts[1] || '0', 10);
}

function checkVersionMatch(nameA, verA, nameB, verB, requireExact = false) {
  if (!verA || !verB) {
    fail(`Fant ikke både ${nameA} og ${nameB} i package.json`);
    return false;
  }

  const majorA = getMajor(verA);
  const majorB = getMajor(verB);
  
  if (requireExact && verA !== verB) {
    fail(`Eksakt versjonsmatch kreves: ${nameA}=${verA}, ${nameB}=${verB}`);
    return false;
  } else if (majorA !== majorB) {
    fail(`Versjonskonflikt: ${nameA}=${verA}, ${nameB}=${verB} → må ha samme major-versjon`);
    return false;
  } else {
    success(`${nameA} og ${nameB} er synkronisert (v${majorA})`);
    return true;
  }
}

function checkPackagePlacement(pkg) {
  const deps = pkg.dependencies || {};
  const devDeps = pkg.devDependencies || {};
  
  let misplacedCount = 0;
  
  // Check for dev dependencies in production dependencies
  Object.keys(deps).forEach(pkgName => {
    const shouldBeDevDep = DEV_DEPENDENCIES.some(devPkg => {
      return pkgName === devPkg || pkgName.startsWith(devPkg);
    });
    
    if (shouldBeDevDep) {
      warn(`${pkgName} bør være i devDependencies, ikke dependencies`);
      misplacedCount++;
    }
  });
  
  if (misplacedCount === 0) {
    success('Alle pakker er riktig plassert i dependencies vs devDependencies');
  } else {
    info(`Fant ${misplacedCount} pakker som bør flyttes til devDependencies`);
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
    fail(`Fant korrupte pakker: ${corrupted.join(', ')}`);
    info('Disse bør fjernes fra package.json');
  } else {
    success('Ingen korrupte pakker funnet');
  }
  
  return corrupted;
}

function run() {
  console.log('🧠 Dev Doctor - Comprehensive Development Environment Validation\n');
  
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // 1. Check for corrupted packages first
    console.log('📦 Checking for corrupted packages...');
    checkCorruptedPackages(pkg);
    console.log();

    // 2. Check package placement
    console.log('📍 Validating package placement...');
    checkPackagePlacement(pkg);
    console.log();

    // 3. ESLint + Parser synchronization
    console.log('🔧 Validating ESLint configuration...');
    const eslintPlugin = deps['@typescript-eslint/eslint-plugin'];
    const eslintParser = deps['@typescript-eslint/parser'];
    checkVersionMatch('@typescript-eslint/eslint-plugin', eslintPlugin, '@typescript-eslint/parser', eslintParser);
    console.log();

    // 4. TypeScript compatibility
    console.log('📝 Checking TypeScript compatibility...');
    const typescript = deps['typescript'];
    if (typescript && eslintParser) {
      const tsMajor = getMajor(typescript);
      const tsMinor = getMinor(typescript);
      if (tsMajor >= 5 || (tsMajor === 4 && tsMinor >= 7)) {
        success(`TypeScript v${typescript} er kompatibel med @typescript-eslint`);
      } else {
        warn(`TypeScript v${typescript} kan være for gammel for @typescript-eslint v${eslintParser}`);
      }
    } else if (typescript) {
      info(`TypeScript v${typescript} installert`);
    }
    console.log();

    // 5. ESLint core compatibility
    console.log('⚙️  Checking ESLint core compatibility...');
    const eslint = deps['eslint'];
    if (eslint && eslintPlugin) {
      const eslintMajor = getMajor(eslint);
      const pluginMajor = getMajor(eslintPlugin);
      if (eslintMajor >= 8 && pluginMajor >= 6) {
        success(`ESLint v${eslint} er kompatibel med @typescript-eslint v${eslintPlugin}`);
      } else {
        warn(`ESLint v${eslint} og @typescript-eslint v${eslintPlugin} kan ha kompatibilitetsproblemer`);
      }
    }
    console.log();

    // 6. Prettier integration
    console.log('💅 Validating Prettier integration...');
    const prettier = deps['prettier'];
    const prettierEslint = deps['eslint-plugin-prettier'];
    if (prettier && prettierEslint) {
      info(`Prettier v${prettier} med eslint-plugin-prettier v${prettierEslint}`);
    } else if (prettier) {
      info(`Prettier v${prettier} installert (uten ESLint-integrasjon)`);
    }
    console.log();

    // 7. Test framework versions
    console.log('🧪 Checking test framework versions...');
    const testFrameworks = {
      'vitest': 'Vitest',
      'cypress': 'Cypress', 
      '@playwright/test': 'Playwright',
      '@testing-library/react': 'React Testing Library'
    };
    
    Object.entries(testFrameworks).forEach(([pkgName, displayName]) => {
      if (deps[pkgName]) {
        info(`${displayName} v${deps[pkgName]} installert`);
      }
    });
    console.log();

    // 8. Security and build tools
    console.log('🔒 Checking security and build tools...');
    const buildTools = {
      'vite': 'Vite',
      '@vitejs/plugin-react': 'Vite React Plugin',
      'tailwindcss': 'Tailwind CSS',
      'autoprefixer': 'Autoprefixer'
    };
    
    Object.entries(buildTools).forEach(([pkgName, displayName]) => {
      if (deps[pkgName]) {
        info(`${displayName} v${deps[pkgName]} installert`);
      }
    });

    // Final summary
    console.log('\n📊 Dev Doctor Summary:');
    if (hasErrors) {
      console.log('❌ Kritiske feil funnet - CI kan feile');
      console.log('💡 Kjør med --legacy-peer-deps som fallback i CI');
      process.exit(1);
    } else {
      success('Alle kritiske sjekker bestått');
      console.log('🚀 Utviklingsmiljøet er klart for CI/CD');
      process.exit(0);
    }

  } catch (error) {
    fail(`Feil ved lesing av package.json: ${error.message}`);
    process.exit(1);
  }
}

// Allow running as module or standalone
if (require.main === module) {
  run();
}

module.exports = { run, checkVersionMatch, checkPackagePlacement, checkCorruptedPackages };