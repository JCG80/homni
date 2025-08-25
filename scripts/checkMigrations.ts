#!/usr/bin/env ts-node

/**
 * Check migration files for completeness
 */

import * as fs from 'fs';
import * as path from 'path';

console.log('🔍 Checking migrations...');

const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');

if (!fs.existsSync(migrationsDir)) {
  console.log('✅ No migrations directory found');
  process.exit(0);
}

const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql') && !file.endsWith('_down.sql'));

let hasIssues = false;

migrationFiles.forEach(file => {
  const downFile = file.replace('.sql', '_down.sql');
  const downPath = path.join(migrationsDir, downFile);
  
  if (!fs.existsSync(downPath)) {
    console.log(`❌ Missing down migration for: ${file}`);
    hasIssues = true;
  }
});

if (hasIssues) {
  console.log('\n❌ Migration issues found');
  process.exit(1);
} else {
  console.log('✅ All migrations have down scripts');
  process.exit(0);
}