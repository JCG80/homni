#!/usr/bin/env node

/**
 * Guard script: Check that all migrations have corresponding _down.sql files
 * Part of Hybrid Testability & QA Pass v3.1
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function checkMigrations() {
  console.log('🔍 Checking migration reversibility...');
  
  const migrationsDir = 'supabase/migrations';
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('ℹ️  No migrations directory found');
    return;
  }
  
  const upFiles = glob.sync(`${migrationsDir}/**/*.sql`).filter(file => !file.endsWith('_down.sql'));
  const downFiles = glob.sync(`${migrationsDir}/**/*_down.sql`);
  
  const missingDownFiles = [];
  
  upFiles.forEach(upFile => {
    const expectedDownFile = upFile.replace('.sql', '_down.sql');
    if (!fs.existsSync(expectedDownFile)) {
      missingDownFiles.push({
        up: upFile,
        expectedDown: expectedDownFile
      });
    }
  });
  
  console.log(`📊 Migration Status:`);
  console.log(`   Up files: ${upFiles.length}`);
  console.log(`   Down files: ${downFiles.length}`);
  console.log(`   Missing: ${missingDownFiles.length}`);
  
  if (missingDownFiles.length === 0) {
    console.log('✅ All migrations have corresponding _down.sql files');
    return;
  }
  
  console.log('\n❌ Missing _down.sql files:');
  missingDownFiles.forEach(({ up, expectedDown }) => {
    console.log(`   ${up} → ${expectedDown}`);
  });
  
  console.log('\n💡 Create _down.sql files to make migrations reversible');
  process.exit(1);
}

checkMigrations();