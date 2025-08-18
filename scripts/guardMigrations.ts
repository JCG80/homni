#!/usr/bin/env ts-node

import { glob } from 'glob';
import fs from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m', 
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

interface MigrationCheck {
  upFile: string;
  downFile: string;
  hasDown: boolean;
  hasDestructive: boolean;
  issues: string[];
}

// Patterns that indicate potentially destructive operations
const DESTRUCTIVE_PATTERNS = [
  /DROP\s+TABLE/i,
  /DROP\s+COLUMN/i,
  /DROP\s+INDEX/i,
  /DROP\s+CONSTRAINT/i,
  /ALTER\s+TABLE.*DROP/i,
  /TRUNCATE/i,
  /DELETE\s+FROM/i
];

async function checkMigrations() {
  try {
    console.log(`${colors.cyan}📜 Checking migrations...${colors.reset}`);
    
    const migrationsDir = 'supabase/migrations';
    
    if (!fs.existsSync(migrationsDir)) {
      console.log(`${colors.yellow}⚠️  No migrations directory found at ${migrationsDir}${colors.reset}`);
      console.log(`${colors.green}✅ Migration check passed (no migrations to validate)${colors.reset}`);
      process.exit(0);
    }

    const upFiles = await glob(`${migrationsDir}/**/*_up.sql`);
    
    if (upFiles.length === 0) {
      console.log(`${colors.yellow}⚠️  No migration files found${colors.reset}`);
      console.log(`${colors.green}✅ Migration check passed (no migrations to validate)${colors.reset}`);
      process.exit(0);
    }

    console.log(`${colors.cyan}📁 Found ${upFiles.length} migration files${colors.reset}`);

    const checks: MigrationCheck[] = [];
    let hasErrors = false;
    let hasWarnings = false;

    for (const upFile of upFiles) {
      const check = await checkMigration(migrationsDir, upFile);
      checks.push(check);
      
      if (!check.hasDown) {
        console.log(`${colors.red}❌ Missing rollback script: ${check.downFile}${colors.reset}`);
        hasErrors = true;
      } else {
        console.log(`${colors.green}✅ ${path.basename(check.upFile)} has rollback script${colors.reset}`);
      }
      
      if (check.hasDestructive) {
        console.log(`${colors.yellow}⚠️  ${path.basename(check.upFile)} contains potentially destructive operations${colors.reset}`);
        hasWarnings = true;
      }
      
      if (check.issues.length > 0) {
        console.log(`${colors.yellow}ℹ️  ${path.basename(check.upFile)} issues:${colors.reset}`);
        check.issues.forEach(issue => {
          console.log(`   ${colors.cyan}- ${issue}${colors.reset}`);
        });
      }
    }

    console.log(`\n${colors.bright}🎯 SUMMARY${colors.reset}`);
    console.log(`${colors.cyan}Total migrations: ${checks.length}${colors.reset}`);
    console.log(`${colors.green}With rollback scripts: ${checks.filter(c => c.hasDown).length}${colors.reset}`);
    console.log(`${colors.yellow}With destructive ops: ${checks.filter(c => c.hasDestructive).length}${colors.reset}`);

    if (hasErrors) {
      console.log(`${colors.red}❌ Migration issues found${colors.reset}`);
      process.exit(1);
    } else if (hasWarnings) {
      console.log(`${colors.yellow}⚠️  All migrations have rollback scripts, but some contain destructive operations${colors.reset}`);
      console.log(`${colors.green}✅ Migration check passed with warnings${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ All migrations have rollback scripts${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Error during migration check:${colors.reset}`, error);
    process.exit(1);
  }
}

async function checkMigration(migrationsDir: string, upFile: string): Promise<MigrationCheck> {
  const downFile = upFile.replace(/_up\.sql$/, '_down.sql');
  const hasDown = fs.existsSync(downFile);
  
  let hasDestructive = false;
  const issues: string[] = [];
  
  try {
    const upContent = fs.readFileSync(upFile, 'utf8');
    
    // Check for destructive operations
    for (const pattern of DESTRUCTIVE_PATTERNS) {
      if (pattern.test(upContent)) {
        hasDestructive = true;
        break;
      }
    }
    
    // Check for specific unsafe patterns
    if (upContent.includes('ALTER DATABASE')) {
      issues.push('Contains ALTER DATABASE statement (not allowed)');
    }
    
    if (upContent.includes('DROP SCHEMA CASCADE')) {
      issues.push('Contains DROP SCHEMA CASCADE (potentially dangerous)');
    }
    
    // If we have a down file, check if it properly reverses the up operations
    if (hasDown) {
      try {
        const downContent = fs.readFileSync(downFile, 'utf8');
        if (!containsRollbackOperations(upContent, downContent)) {
          issues.push('Rollback script may not properly reverse all operations');
        }
      } catch (error) {
        issues.push('Could not read rollback script');
      }
    }
    
  } catch (error) {
    issues.push('Could not read migration file');
  }
  
  return {
    upFile,
    downFile,
    hasDown,
    hasDestructive,
    issues
  };
}

function containsRollbackOperations(upContent: string, downContent: string): boolean {
  // Basic heuristics to check if down script reverses up operations
  const upHasCreate = /CREATE\s+TABLE/i.test(upContent);
  const downHasDrop = /DROP\s+TABLE/i.test(downContent);
  
  const upHasAddColumn = /ADD\s+COLUMN/i.test(upContent);
  const downHasDropColumn = /DROP\s+COLUMN/i.test(downContent);
  
  // If up creates tables, down should drop them
  if (upHasCreate && !downHasDrop) {
    return false;
  }
  
  // If up adds columns, down should drop them
  if (upHasAddColumn && !downHasDropColumn) {
    return false;
  }
  
  return true;
}

// Run the script when called directly
if (require.main === module) {
  checkMigrations();
}