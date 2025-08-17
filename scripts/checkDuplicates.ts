#!/usr/bin/env ts-node

/**
 * Check for duplicate components, types, and imports
 */

import { execSync } from 'child_process';

console.log('🔍 Checking for duplicates...');

let hasIssues = false;

// Check for duplicate component names
try {
  const result = execSync('find src -name "*.tsx" -exec basename {} \\; | sort | uniq -d', { encoding: 'utf8' });
  if (result.trim()) {
    console.log('❌ Duplicate component files:');
    console.log(result);
    hasIssues = true;
  } else {
    console.log('✅ No duplicate component files');
  }
} catch (error) {
  console.log('⚠️  Could not check duplicate components');
}

// Check for deprecated Supabase client imports
try {
  const result = execSync('grep -r "from.*@/integrations/supabase/client" src/ | wc -l', { encoding: 'utf8' });
  const count = parseInt(result.trim());
  if (count > 0) {
    console.log(`❌ Found ${count} files using deprecated Supabase client`);
    hasIssues = true;
  } else {
    console.log('✅ No deprecated Supabase client imports');
  }
} catch (error) {
  console.log('⚠️  Could not check Supabase imports');
}

console.log('\n🎯 SUMMARY');
if (hasIssues) {
  console.log('❌ Duplicates found');
  process.exit(1);
} else {
  console.log('✅ No duplicates detected');
  process.exit(0);
}