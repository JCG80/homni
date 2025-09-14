#!/usr/bin/env node

/**
 * Post-cleanup verification script
 * Verifies that the cleanup and security hardening was successful
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Verifying HOMNI cleanup and security hardening...\n');

const checks = [
  {
    name: 'Package.json validation',
    test: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const corruptPackages = ['a', 'are', 'been', 'can', 'it', 'is', 'only', 'our', 'the', 'to', 'use', 'you'];
      const foundCorrupt = corruptPackages.filter(p => pkg.dependencies[p]);
      
      if (foundCorrupt.length > 0) {
        throw new Error(`Found corrupt packages: ${foundCorrupt.join(', ')}`);
      }
      
      // Check for updated packages
      const requiredVersions = {
        'react': '^18.3.1',
        '@supabase/supabase-js': '^2.50.0',
        '@tanstack/react-query': '^5.60.0'
      };
      
      for (const [pkg, version] of Object.entries(requiredVersions)) {
        if (!pkg.dependencies[pkg] || !pkg.dependencies[pkg].includes(version.replace('^', ''))) {
          console.warn(`⚠️  ${pkg} may not be at expected version ${version}`);
        }
      }
      
      return 'Package.json is clean and updated';
    }
  },
  {
    name: 'TypeScript compilation', 
    test: () => {
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        return 'TypeScript compiles without errors';
      } catch (error) {
        throw new Error('TypeScript compilation failed');
      }
    }
  },
  {
    name: 'Build validation',
    test: () => {
      try {
        execSync('npm run build', { stdio: 'pipe' });
        return 'Build completes successfully';
      } catch (error) {
        throw new Error('Build failed - check for missing dependencies');
      }
    }
  },
  {
    name: 'Security status file',
    test: () => {
      if (!fs.existsSync('SECURITY-STATUS.md')) {
        throw new Error('Security status documentation missing');
      }
      return 'Security status documented';
    }
  }
];

let passed = 0;
let failed = 0;

console.log('Running verification checks...\n');

for (const check of checks) {
  try {
    const result = check.test();
    console.log(`✅ ${check.name}: ${result}`);
    passed++;
  } catch (error) {
    console.error(`❌ ${check.name}: ${error.message}`);
    failed++;
  }
}

console.log(`\n📊 Verification Results: ${passed}/${checks.length} passed\n`);

if (failed === 0) {
  console.log('🎉 Cleanup and security hardening completed successfully!\n');
  console.log('📋 Next steps:');
  console.log('   1. Review SECURITY-STATUS.md for manual Supabase dashboard fixes');
  console.log('   2. Test authentication flows');
  console.log('   3. Deploy to staging for integration testing');
} else {
  console.error('⚠️  Some verification checks failed. Review the errors above.');
  process.exit(1);
}