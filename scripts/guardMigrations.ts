#!/usr/bin/env ts-node

/**
 * Script to check migration files for rollback capability and safety
 * Ensures all migrations have corresponding _down.sql files
 */

import * as fs from 'fs';
import * as path from 'path';

interface MigrationCheck {
  upFile: string;
  downFile: string | null;
  hasRollback: boolean;
  isDestructive: boolean;
  issues: string[];
  severity: 'error' | 'warning' | 'info';
}

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

// Destructive operations that need special attention
const DESTRUCTIVE_PATTERNS = [
  /DROP\s+TABLE/i,
  /DROP\s+COLUMN/i,
  /ALTER\s+TABLE.*DROP/i,
  /DELETE\s+FROM/i,
  /TRUNCATE/i
];

async function checkMigrations(): Promise<void> {
  console.log('📄 Checking migration files and rollback capability...\n');
  
  const migrationsDir = 'supabase/migrations';
  
  if (!fs.existsSync(migrationsDir)) {
    console.log(`${YELLOW}⚠️  No migrations directory found at ${migrationsDir}${RESET}`);
    return;
  }
  
  const checks: MigrationCheck[] = [];
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql') && !file.endsWith('_down.sql'))
    .sort();
  
  for (const upFile of migrationFiles) {
    const check = await checkMigration(migrationsDir, upFile);
    checks.push(check);
  }
  
  // Report findings
  let errors = 0;
  let warnings = 0;
  
  checks.forEach(check => {
    const color = check.severity === 'error' ? RED : check.severity === 'warning' ? YELLOW : GREEN;
    const icon = check.severity === 'error' ? '❌' : check.severity === 'warning' ? '⚠️' : '✅';
    
    console.log(`${color}${icon} Migration: ${check.upFile}${RESET}`);
    console.log(`   Has Rollback: ${check.hasRollback ? 'Yes' : 'No'}`);
    console.log(`   Is Destructive: ${check.isDestructive ? 'Yes' : 'No'}`);
    
    if (check.issues.length > 0) {
      console.log(`   Issues: ${check.issues.join(', ')}`);
    }
    
    console.log();
    
    if (check.severity === 'error') errors++;
    else if (check.severity === 'warning') warnings++;
  });
  
  console.log(`${RED}❌ Errors: ${errors}${RESET}`);
  console.log(`${YELLOW}⚠️  Warnings: ${warnings}${RESET}`);
  
  if (errors > 0) {
    console.log(`\n${RED}🚨 Migration check failed. Critical issues found.${RESET}`);
    process.exit(1);
  } else {
    console.log(`\n${GREEN}🎉 All migrations have proper rollback capability!${RESET}`);
  }
}

async function checkMigration(migrationsDir: string, upFile: string): Promise<MigrationCheck> {
  const upPath = path.join(migrationsDir, upFile);
  const downFile = upFile.replace('.sql', '_down.sql');
  const downPath = path.join(migrationsDir, downFile);
  
  const check: MigrationCheck = {
    upFile,
    downFile: fs.existsSync(downPath) ? downFile : null,
    hasRollback: fs.existsSync(downPath),
    isDestructive: false,
    issues: [],
    severity: 'info'
  };
  
  try {
    // Read and analyze migration content
    const upContent = fs.readFileSync(upPath, 'utf-8');
    
    // Check for destructive operations
    check.isDestructive = DESTRUCTIVE_PATTERNS.some(pattern => pattern.test(upContent));
    
    // Check for rollback file
    if (!check.hasRollback) {
      check.issues.push('Missing rollback file');
      check.severity = check.isDestructive ? 'error' : 'warning';
    } else {
      // Validate rollback file
      const downContent = fs.readFileSync(downPath, 'utf-8');
      
      if (downContent.trim().length === 0) {
        check.issues.push('Empty rollback file');
        check.severity = 'warning';
      }
      
      // Check if rollback looks reasonable
      if (!containsRollbackOperations(upContent, downContent)) {
        check.issues.push('Rollback may not properly reverse migration');
        check.severity = 'warning';
      }
    }
    
    // Check for unsafe patterns
    if (upContent.includes('ALTER DATABASE')) {
      check.issues.push('Contains ALTER DATABASE - not allowed');
      check.severity = 'error';
    }
    
    if (upContent.includes('DROP SCHEMA') && upContent.includes('CASCADE')) {
      check.issues.push('Dangerous CASCADE operation');
      check.severity = 'error';
    }
    
  } catch (error) {
    check.issues.push(`Failed to analyze: ${error instanceof Error ? error.message : String(error)}`);
    check.severity = 'error';
  }
  
  return check;
}

function containsRollbackOperations(upContent: string, downContent: string): boolean {
  // Basic heuristics to check if rollback looks reasonable
  const upHasCreate = /CREATE\s+(TABLE|FUNCTION|TRIGGER)/i.test(upContent);
  const downHasDrop = /DROP\s+(TABLE|FUNCTION|TRIGGER)/i.test(downContent);
  
  const upHasAlter = /ALTER\s+TABLE.*ADD/i.test(upContent);
  const downHasAlterDrop = /ALTER\s+TABLE.*DROP/i.test(downContent);
  
  const upHasInsert = /INSERT\s+INTO/i.test(upContent);
  const downHasDelete = /DELETE\s+FROM/i.test(downContent);
  
  // If up migration creates something, down should drop it
  if (upHasCreate && !downHasDrop) return false;
  
  // If up migration adds columns, down should drop them
  if (upHasAlter && !downHasAlterDrop) return false;
  
  // If up migration inserts data, down should delete it
  if (upHasInsert && !downHasDelete) return false;
  
  return true;
}

if (require.main === module) {
  checkMigrations().catch(console.error);
}