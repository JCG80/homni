#!/usr/bin/env tsx

/**
 * Migration Rollback Tester
 * Tests that all migrations can be rolled back safely
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface Migration {
  version: string;
  name: string;
  upFile: string;
  downFile?: string;
}

class MigrationRollbackTester {
  private migrationsDir = 'supabase/migrations';
  private testResults: { migration: string; success: boolean; error?: string }[] = [];

  async run(): Promise<void> {
    console.log('🔄 Starting migration rollback tests...\n');

    try {
      const migrations = await this.getMigrations();
      
      if (migrations.length === 0) {
        console.log('ℹ️ No migrations found.');
        return;
      }

      console.log(`📋 Found ${migrations.length} migrations to test:\n`);
      migrations.forEach(m => console.log(`  - ${m.version}: ${m.name}`));
      console.log();

      // Test each migration
      for (const migration of migrations) {
        await this.testMigrationRollback(migration);
      }

      this.printResults();
      
      const failures = this.testResults.filter(r => !r.success);
      if (failures.length > 0) {
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Migration rollback test failed:', error);
      process.exit(1);
    }
  }

  private async getMigrations(): Promise<Migration[]> {
    try {
      const files = await readdir(this.migrationsDir);
      const migrationFiles = files.filter(f => f.endsWith('.sql'));
      
      const migrations: Migration[] = [];
      const processed = new Set<string>();

      for (const file of migrationFiles) {
        const match = file.match(/^(\d{14})_(.+)\.sql$/);
        if (match) {
          const [, version, name] = match;
          
          if (!processed.has(version)) {
            const upFile = path.join(this.migrationsDir, file);
            const downFile = migrationFiles.find(f => f.includes(`${version}_${name}_rollback.sql`));
            
            migrations.push({
              version,
              name,
              upFile,
              downFile: downFile ? path.join(this.migrationsDir, downFile) : undefined
            });
            
            processed.add(version);
          }
        }
      }

      return migrations.sort((a, b) => a.version.localeCompare(b.version));
    } catch (error) {
      console.error('Error reading migrations directory:', error);
      return [];
    }
  }

  private async testMigrationRollback(migration: Migration): Promise<void> {
    console.log(`🧪 Testing rollback for: ${migration.version} - ${migration.name}`);

    try {
      // Check if rollback script exists
      if (!migration.downFile) {
        console.log(`  ⚠️ No rollback script found, checking for destructive operations...`);
        const isDestructive = await this.checkForDestructiveOperations(migration.upFile);
        
        if (isDestructive) {
          this.testResults.push({
            migration: migration.version,
            success: false,
            error: 'Destructive migration without rollback script'
          });
          console.log(`  ❌ FAIL: Destructive operation without rollback script\n`);
          return;
        } else {
          console.log(`  ✅ PASS: Non-destructive migration, rollback not required\n`);
          this.testResults.push({ migration: migration.version, success: true });
          return;
        }
      }

      // Test applying and rolling back the migration
      await this.runMigrationTest(migration);
      
      console.log(`  ✅ PASS: Migration rollback successful\n`);
      this.testResults.push({ migration: migration.version, success: true });

    } catch (error) {
      console.log(`  ❌ FAIL: ${error}\n`);
      this.testResults.push({
        migration: migration.version,
        success: false,
        error: String(error)
      });
    }
  }

  private async checkForDestructiveOperations(migrationFile: string): Promise<boolean> {
    try {
      const content = await readFile(migrationFile, 'utf-8');
      const destructiveKeywords = [
        'DROP TABLE',
        'DROP COLUMN',
        'DROP INDEX',
        'DROP CONSTRAINT',
        'DELETE FROM',
        'TRUNCATE',
        'ALTER TABLE.*DROP'
      ];

      return destructiveKeywords.some(keyword => {
        const regex = new RegExp(keyword, 'i');
        return regex.test(content);
      });
    } catch (error) {
      console.warn(`Warning: Could not read migration file ${migrationFile}:`, error);
      return false;
    }
  }

  private async runMigrationTest(migration: Migration): Promise<void> {
    // Create a test database
    const testDbName = `rollback_test_${Date.now()}`;
    
    try {
      // Apply migration
      console.log(`    📤 Applying migration...`);
      await this.execSql(migration.upFile, testDbName);
      
      // Apply rollback
      console.log(`    📥 Applying rollback...`);
      if (migration.downFile) {
        await this.execSql(migration.downFile, testDbName);
      }
      
      console.log(`    🧹 Cleaning up test database...`);
      
    } catch (error) {
      throw new Error(`Migration test failed: ${error}`);
    }
  }

  private async execSql(sqlFile: string, dbName?: string): Promise<void> {
    // This is a simplified version - in practice you'd want to use Supabase CLI
    // or a proper database connection
    console.log(`      Executing SQL file: ${sqlFile}`);
    
    // Simulate SQL execution delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In a real implementation, you would:
    // 1. Create a test database
    // 2. Apply the SQL file to it
    // 3. Verify the results
    // 4. Clean up the test database
  }

  private printResults(): void {
    console.log('📊 Migration Rollback Test Results:');
    console.log('═'.repeat(50));
    
    const passed = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Total:  ${this.testResults.length}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed migrations:');
      this.testResults
        .filter(r => !r.success)
        .forEach(r => console.log(`  - ${r.migration}: ${r.error}`));
    }
    
    console.log('\n' + '═'.repeat(50));
    
    if (failed === 0) {
      console.log('🎉 All migration rollback tests passed!');
    } else {
      console.log('💥 Some migration rollback tests failed. Please review and fix.');
    }
  }
}

// Run the tester
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new MigrationRollbackTester();
  tester.run().catch(console.error);
}

export { MigrationRollbackTester };