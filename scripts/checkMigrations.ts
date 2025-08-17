#!/usr/bin/env ts-node

/**
 * Check migrations have corresponding rollback scripts
 */

import * as fs from 'fs';

console.log('📜 Checking migrations...');

const migrationsDir = 'supabase/migrations';

if (!fs.existsSync(migrationsDir)) {
  console.log('⚠️  No migrations directory found');
  console.log('✅ Migration check passed (no migrations to validate)');
  process.exit(0);
}

const files = fs.readdirSync(migrationsDir);
const sqlFiles = files.filter(f => f.endsWith('.sql') && !f.endsWith('_down.sql'));
let hasIssues = false;

for (const file of sqlFiles) {
  const downFile = file.replace('.sql', '_down.sql');
  if (!files.includes(downFile)) {
    console.log(`❌ Missing rollback script: ${downFile}`);
    hasIssues = true;
  }
}

console.log('\n🎯 SUMMARY');
if (hasIssues) {
  console.log('❌ Migration issues found');
  process.exit(1);
} else {
  console.log('✅ All migrations have rollback scripts');
  process.exit(0);
}