#!/usr/bin/env node

/**
 * Repo Health Check Script - Ultimate Master 2.0 Standard
 * Ensures code quality, type safety, and standards compliance
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running Repo Health Check...\n');

let allPassed = true;

// Helper function to run commands and capture output
function runCheck(name, command, optional = false) {
  try {
    console.log(`📋 ${name}...`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${name} passed\n`);
    return true;
  } catch (error) {
    if (optional) {
      console.log(`⚠️  ${name} failed (optional): ${error.message}\n`);
      return true;
    } else {
      console.error(`❌ ${name} failed:`);
      console.error(error.stdout || error.message);
      console.error('\n');
      allPassed = false;
      return false;
    }
  }
}

// 1. TypeScript type checking
runCheck('TypeScript Type Check', 'npx tsc --noEmit');

// 2. Build check
runCheck('Build Check', 'npm run build');

// 3. Unit tests (if available)
runCheck('Unit Tests', 'npm run test -- --run', true);

// 4. Lint check
runCheck('ESLint Check', 'npx eslint src --max-warnings 0', true);

// 5. Check for legacy roles in code
function checkLegacyRoles() {
  console.log('📋 Checking for legacy roles...');
  const legacyPatterns = [
    /['"]member['"]/g,
    /['"]guest['"]/g,
    /role:\s*['"]member['"]/g,
    /role:\s*['"]guest['"]/g
  ];
  
  let violations = [];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(file)) {
        scanDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        legacyPatterns.forEach((pattern, index) => {
          const matches = content.match(pattern);
          if (matches) {
            violations.push(`${filePath}: ${matches.join(', ')}`);
          }
        });
      }
    }
  }
  
  scanDirectory('src');
  
  if (violations.length > 0) {
    console.error('❌ Legacy role violations found:');
    violations.forEach(v => console.error(`  ${v}`));
    console.error('\n');
    allPassed = false;
    return false;
  } else {
    console.log('✅ No legacy roles found\n');
    return true;
  }
}

checkLegacyRoles();

// 6. Check for required files
function checkRequiredFiles() {
  console.log('📋 Checking required files...');
  const requiredFiles = [
    'src/config/routeForRole.ts',
    'src/modules/auth/hooks/useAuthGate.ts',
    'src/modules/auth/normalizeRole.ts'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`❌ Required file missing: ${file}`);
      allPassed = false;
    }
  }
  
  if (allPassed) {
    console.log('✅ All required files present\n');
  }
}

checkRequiredFiles();

// Final result
if (allPassed) {
  console.log('🎉 All repo health checks passed!');
  process.exit(0);
} else {
  console.error('💥 Some repo health checks failed. Please fix the issues above.');
  process.exit(1);
}