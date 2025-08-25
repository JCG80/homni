#!/usr/bin/env ts-node

/**
 * Check for duplicate code patterns and inconsistent imports
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

console.log('🔍 Checking for duplicates and inconsistencies...');

let hasIssues = false;

// Check for inconsistent supabase imports
try {
  const result = execSync('grep -r "from.*supabase.*client" src/ --include="*.ts" --include="*.tsx"', { encoding: 'utf-8' });
  const lines = result.split('\n').filter(line => line.trim());
  
  const libSupabaseLines = lines.filter(line => line.includes('@/lib/supabaseClient'));
  const integrationsSupabaseLines = lines.filter(line => line.includes('@/integrations/supabase/client'));
  
  if (libSupabaseLines.length > 0 && integrationsSupabaseLines.length > 0) {
    console.log('❌ Inconsistent supabase imports found:');
    console.log(`   @/lib/supabaseClient: ${libSupabaseLines.length} files`);
    console.log(`   @/integrations/supabase/client: ${integrationsSupabaseLines.length} files`);
    hasIssues = true;
  } else {
    console.log('✅ Supabase imports are consistent');
  }
} catch (error) {
  console.log('✅ No supabase import issues found');
}

// Check for duplicate toast imports
try {
  const result = execSync('grep -r "from.*toast" src/ --include="*.ts" --include="*.tsx"', { encoding: 'utf-8' });
  const lines = result.split('\n').filter(line => line.trim());
  
  const uniqueImports = new Set(lines.map(line => {
    const match = line.match(/from ['"]([^'"]+)['"]/);
    return match ? match[1] : '';
  }));
  
  if (uniqueImports.size > 1) {
    console.log('❌ Multiple toast import sources found:', Array.from(uniqueImports));
    hasIssues = true;
  } else {
    console.log('✅ Toast imports are consistent');
  }
} catch (error) {
  console.log('✅ No toast import issues found');
}

if (hasIssues) {
  console.log('\n❌ Duplicate/inconsistency issues found');
  process.exit(1);
} else {
  console.log('\n✅ No duplicate/inconsistency issues found');
  process.exit(0);
}