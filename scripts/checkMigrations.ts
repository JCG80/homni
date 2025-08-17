#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

async function checkMigrations(): Promise<void> {
  const migrationsDir = 'supabase/migrations';
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('✅ No migrations directory found');
    return;
  }

  const migrationFiles = await glob(`${migrationsDir}/*.sql`);
  const upMigrations = migrationFiles.filter(f => !f.endsWith('_down.sql'));
  
  let hasIssues = false;
  
  for (const upMigration of upMigrations) {
    const baseName = path.basename(upMigration, '.sql');
    const downMigration = path.join(migrationsDir, `${baseName}_down.sql`);
    
    if (!fs.existsSync(downMigration)) {
      console.error(`❌ Missing rollback migration: ${downMigration}`);
      hasIssues = true;
    } else {
      // Check that down migration is not empty
      const downContent = fs.readFileSync(downMigration, 'utf8').trim();
      if (downContent.length === 0) {
        console.error(`❌ Empty rollback migration: ${downMigration}`);
        hasIssues = true;
      }
    }
  }
  
  if (hasIssues) {
    console.error('\n❌ Migration rollback issues found.');
    console.error('Every migration should have a corresponding _down.sql file.');
    process.exit(1);
  } else {
    console.log(`✅ All ${upMigrations.length} migrations have rollback files`);
  }
}

if (require.main === module) {
  checkMigrations().catch(console.error);
}