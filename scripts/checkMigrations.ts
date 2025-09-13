#!/usr/bin/env ts-node

/**
 * Migration Safety Checker
 * Validates database migrations for rollback safety and best practices
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface Migration {
  id: string;
  filename: string;
  hasDown: boolean;
  hasRollback: boolean;
  issues: string[];
}

interface MigrationCheck {
  passed: boolean;
  message: string;
  migrations: Migration[];
}

function checkMigrations(): MigrationCheck {
  console.log('📋 Checking migration safety and rollback capabilities...\n');
  
  const migrationsDir = 'supabase/migrations';
  const issues: string[] = [];
  const migrations: Migration[] = [];
  
  if (!existsSync(migrationsDir)) {
    return {
      passed: false,
      message: '❌ Migrations directory not found',
      migrations: []
    };
  }
  
  try {
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    for (const file of migrationFiles) {
      const migration: Migration = {
        id: file.split('_')[0] || file,
        filename: file,
        hasDown: false,
        hasRollback: false,
        issues: []
      };
      
      const filePath = join(migrationsDir, file);
      const content = readFileSync(filePath, 'utf8');
      
      // Check for rollback script
      const downFile = file.replace('.sql', '_down.sql');
      migration.hasDown = existsSync(join(migrationsDir, downFile));
      
      // Check for rollback commands in the same file
      const hasRollbackCommands = /-- Rollback|DROP TABLE|DROP FUNCTION|DROP POLICY/i.test(content);
      migration.hasRollback = hasRollbackCommands;
      
      // Analyze migration content for safety
      const lines = content.split('\n').map(l => l.trim().toLowerCase());
      
      // Check for dangerous operations
      if (lines.some(l => l.includes('drop table') && !l.includes('if exists'))) {
        migration.issues.push('Unsafe DROP TABLE without IF EXISTS');
      }
      
      if (lines.some(l => l.includes('alter table') && l.includes('drop column'))) {
        migration.issues.push('DROP COLUMN operation - ensure data backup');
      }
      
      if (lines.some(l => l.includes('truncate') || l.includes('delete from'))) {
        migration.issues.push('Data deletion operation - ensure backup');
      }
      
      // Check for RLS setup
      if (lines.some(l => l.includes('create table')) && !content.includes('enable row level security')) {
        migration.issues.push('New table without RLS - security risk');
      }
      
      // Check for proper function security
      if (lines.some(l => l.includes('create function') || l.includes('create or replace function'))) {
        if (!content.includes('SECURITY DEFINER') && !content.includes('security definer')) {
          migration.issues.push('Function without SECURITY DEFINER - review security');
        }
        if (!content.includes('SET search_path')) {
          migration.issues.push('Function without search_path setting - security risk');
        }
      }
      
      // Migration should have rollback plan
      if (!migration.hasDown && !migration.hasRollback) {
        migration.issues.push('No rollback strategy - create _down.sql file');
      }
      
      migrations.push(migration);
    }
    
    // Overall analysis
    const criticalIssues = migrations.filter(m => 
      m.issues.some(i => i.includes('security') || i.includes('Unsafe'))
    );
    
    const missingRollbacks = migrations.filter(m => !m.hasDown && !m.hasRollback);
    
    if (criticalIssues.length > 0) {
      issues.push(`${criticalIssues.length} migrations with CRITICAL issues`);
    }
    
    if (missingRollbacks.length > 0) {
      issues.push(`${missingRollbacks.length} migrations missing rollback strategies`);
    }
    
    const passed = criticalIssues.length === 0 && missingRollbacks.length <= 2; // Allow some flexibility
    const message = passed 
      ? `✅ Migration safety checks passed (${migrations.length} migrations validated)`
      : `❌ Migration validation failed:\n${issues.join('\n')}`;
    
    return { passed, message, migrations };
    
  } catch (error) {
    return {
      passed: false,
      message: `❌ Error checking migrations: ${error instanceof Error ? error.message : String(error)}`,
      migrations: []
    };
  }
}

if (require.main === module) {
  const result = checkMigrations();
  console.log(result.message);
  
  if (result.migrations.length > 0) {
    console.log('\nMigration Summary:');
    result.migrations.forEach(m => {
      const status = m.issues.length === 0 ? '✅' : '⚠️';
      console.log(`  ${status} ${m.filename} (Down: ${m.hasDown ? '✓' : '✗'})`);
      if (m.issues.length > 0) {
        m.issues.forEach(issue => console.log(`      - ${issue}`));
      }
    });
  }
  
  process.exit(result.passed ? 0 : 1);
}

export { checkMigrations };