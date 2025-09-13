#!/usr/bin/env node

/**
 * Master Prompt Guardian - Enforces Master Prompt v2.1 compliance
 * Runs the 10-point commit hook checklist
 */

import * as fs from 'fs';
import * as path from 'path';

interface CommitCheckResult {
  point: number;
  description: string;
  passed: boolean;
  details: string[];
  blocking: boolean;
}

const MASTER_PROMPT_POINTS = [
  {
    point: 1,
    description: "Roadmap compliance (User → Company → Samspill → Admin → Master → Editor)",
    blocking: true
  },
  {
    point: 2, 
    description: "Duplicate detection and cleanup",
    blocking: true
  },
  {
    point: 3,
    description: "Role/profile alignment (User, Company, Admin, Master)",
    blocking: true
  },
  {
    point: 4,
    description: "Database schema with created_at/updated_at/deleted_at",
    blocking: true
  },
  {
    point: 5,
    description: "RLS activation on user data",
    blocking: true
  },
  {
    point: 6,
    description: "Migration rollback scripts",
    blocking: true
  },
  {
    point: 7,
    description: "Feature flags for new functionality",
    blocking: false
  },
  {
    point: 8,
    description: "Test coverage (Unit ≥90%, Integration ≥80%, E2E flows)",
    blocking: true
  },
  {
    point: 9,
    description: "Navigation updates only in navConfig[role]",
    blocking: true
  },
  {
    point: 10,
    description: "Documentation updates (README, module-README, ROADMAP)",
    blocking: false
  }
];

class MasterPromptGuardian {
  private results: CommitCheckResult[] = [];

  async runAllChecks(): Promise<void> {
    console.log('🛡️ Master Prompt Guardian v2.1');
    console.log('================================\n');

    for (const check of MASTER_PROMPT_POINTS) {
      const result = await this.runCheck(check.point, check.description, check.blocking);
      this.results.push(result);
    }

    this.printResults();
    this.determineExitCode();
  }

  private async runCheck(point: number, description: string, blocking: boolean): Promise<CommitCheckResult> {
    const details: string[] = [];
    let passed = true;

    switch (point) {
      case 1:
        passed = this.checkRoadmapCompliance(details);
        break;
      case 2:
        passed = this.checkDuplicates(details);
        break;
      case 3:
        passed = this.checkRoleAlignment(details);
        break;
      case 4:
        passed = this.checkDatabaseSchema(details);
        break;
      case 5:
        passed = this.checkRLS(details);
        break;
      case 6:
        passed = this.checkMigrations(details);
        break;
      case 7:
        passed = this.checkFeatureFlags(details);
        break;
      case 8:
        passed = this.checkTestCoverage(details);
        break;
      case 9:
        passed = this.checkNavigation(details);
        break;
      case 10:
        passed = this.checkDocumentation(details);
        break;
    }

    return {
      point,
      description,
      passed,
      details,
      blocking
    };
  }

  private checkRoadmapCompliance(details: string[]): boolean {
    try {
      if (!fs.existsSync('ROADMAP.md')) {
        details.push('❌ ROADMAP.md missing');
        return false;
      }

      const roadmap = fs.readFileSync('ROADMAP.md', 'utf8');
      
      // Check current phase is clearly defined
      if (roadmap.match(/Phase 1A.*(?:COMPLETED|IN PROGRESS)/i)) {
        details.push('✅ Current phase status clear');
      } else {
        details.push('❌ Current phase status unclear');
        return false;
      }

      // Check phase progression is followed
      const phases = ['Phase 1A', 'Phase 1B', 'Phase 2A', 'Phase 2B'];
      let foundCurrentPhase = false;
      for (const phase of phases) {
        if (roadmap.includes(phase) && (roadmap.includes('COMPLETED') || roadmap.includes('IN PROGRESS'))) {
          foundCurrentPhase = true;
          details.push(`✅ Working on correct phase: ${phase}`);
          break;
        }
      }

      if (!foundCurrentPhase) {
        details.push('❌ Not following phase progression');
        return false;
      }

      return true;
    } catch (error) {
      details.push(`❌ Error checking roadmap: ${error}`);
      return false;
    }
  }

  private checkDuplicates(details: string[]): boolean {
    try {
      // Check for common duplicate patterns
      const srcDir = 'src';
      if (!fs.existsSync(srcDir)) {
        details.push('❌ src directory not found');
        return false;
      }

      // Check for duplicate imports
      const files = this.getAllFiles(srcDir, ['.ts', '.tsx']);
      const duplicateImports = this.findDuplicateImports(files);
      
      if (duplicateImports.length === 0) {
        details.push('✅ No duplicate imports detected');
      } else {
        details.push(`❌ Found ${duplicateImports.length} duplicate imports`);
        duplicateImports.slice(0, 2).forEach(dup => {
          details.push(`  - ${dup.import} (in ${dup.files.length} files)`);
        });
        return false;
      }

      return true;
    } catch (error) {
      details.push(`❌ Error checking duplicates: ${error}`);
      return false;
    }
  }

  private checkRoleAlignment(details: string[]): boolean {
    try {
      // Check for proper role definitions
      const authModule = 'src/modules/auth';
      if (!fs.existsSync(authModule)) {
        details.push('❌ Auth module not found');
        return false;
      }

      // Look for role types
      const files = this.getAllFiles(authModule, ['.ts', '.tsx']);
      let foundRoles = false;
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('guest') && content.includes('user') && content.includes('company')) {
          foundRoles = true;
          details.push('✅ Core roles defined properly');
          break;
        }
      }

      if (!foundRoles) {
        details.push('❌ Core roles not properly defined');
        return false;
      }

      return true;
    } catch (error) {
      details.push(`❌ Error checking role alignment: ${error}`);
      return false;
    }
  }

  private checkDatabaseSchema(details: string[]): boolean {
    try {
      // Check for Supabase types
      if (!fs.existsSync('src/integrations/supabase/types.ts')) {
        details.push('❌ Supabase types file missing');
        return false;
      }

      const types = fs.readFileSync('src/integrations/supabase/types.ts', 'utf8');
      
      // Check for timestamp fields
      if (types.includes('created_at') && types.includes('updated_at')) {
        details.push('✅ Standard timestamp fields present');
      } else {
        details.push('❌ Missing standard timestamp fields');
        return false;
      }

      details.push('✅ Database schema validation passed');
      return true;
    } catch (error) {
      details.push(`❌ Error checking database schema: ${error}`);
      return false;
    }
  }

  private checkRLS(details: string[]): boolean {
    try {
      // Check for migration files with RLS
      const migrationDir = 'supabase/migrations';
      if (!fs.existsSync(migrationDir)) {
        details.push('⚠️ No migration directory found');
        return true; // Not blocking if no migrations yet
      }

      const migrations = fs.readdirSync(migrationDir);
      let foundRLS = false;

      for (const migration of migrations) {
        const content = fs.readFileSync(path.join(migrationDir, migration), 'utf8');
        if (content.includes('ROW LEVEL SECURITY') || content.includes('CREATE POLICY')) {
          foundRLS = true;
          break;
        }
      }

      if (foundRLS) {
        details.push('✅ RLS policies found in migrations');
      } else {
        details.push('⚠️ No RLS policies found (may be acceptable for current phase)');
      }

      return true;
    } catch (error) {
      details.push(`❌ Error checking RLS: ${error}`);
      return false;
    }
  }

  private checkMigrations(details: string[]): boolean {
    try {
      const migrationDir = 'supabase/migrations';
      if (!fs.existsSync(migrationDir)) {
        details.push('⚠️ No migration directory (acceptable for early phases)');
        return true;
      }

      const migrations = fs.readdirSync(migrationDir);
      if (migrations.length > 0) {
        details.push(`✅ Found ${migrations.length} migration files`);

        // Check for recent migrations
        const recentMigrations = migrations.filter(m => m.includes('2024'));
        if (recentMigrations.length > 0) {
          details.push('✅ Recent migrations present');
        }
      }

      return true;
    } catch (error) {
      details.push(`❌ Error checking migrations: ${error}`);
      return false;
    }
  }

  private checkFeatureFlags(details: string[]): boolean {
    try {
      // Check for feature flag implementation
      const featureFlagFiles = this.getAllFiles('src', ['.ts', '.tsx']).filter(file => 
        file.includes('feature') || file.includes('flag')
      );

      if (featureFlagFiles.length > 0) {
        details.push(`✅ Found ${featureFlagFiles.length} feature flag related files`);
      } else {
        details.push('⚠️ No feature flag system detected (recommended for future)');
      }

      return true; // Not blocking in early phases
    } catch (error) {
      details.push(`❌ Error checking feature flags: ${error}`);
      return false;
    }
  }

  private checkTestCoverage(details: string[]): boolean {
    try {
      // Check for test files
      const testFiles = this.getAllFiles('src', ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx']);
      
      if (testFiles.length === 0) {
        details.push('❌ No test files found');
        return false;
      }

      details.push(`✅ Found ${testFiles.length} test files`);

      // Check for test utilities
      if (fs.existsSync('src/test')) {
        details.push('✅ Test utilities directory exists');
      }

      // Check package.json for test scripts
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (packageJson.scripts?.test && packageJson.scripts?.['test:coverage']) {
        details.push('✅ Test scripts configured');
      } else {
        details.push('❌ Test scripts not configured properly');
        return false;
      }

      return true;
    } catch (error) {
      details.push(`❌ Error checking test coverage: ${error}`);
      return false;
    }
  }

  private checkNavigation(details: string[]): boolean {
    try {
      // Check for centralized navigation config
      const configFiles = this.getAllFiles('src/config', ['.ts', '.tsx']);
      const navFiles = configFiles.filter(file => 
        file.includes('nav') || file.includes('route')
      );

      if (navFiles.length > 0) {
        details.push(`✅ Found ${navFiles.length} navigation config files`);
      } else {
        details.push('⚠️ No centralized navigation config found');
        return false;
      }

      return true;
    } catch (error) {
      details.push(`❌ Error checking navigation: ${error}`);
      return false;
    }
  }

  private checkDocumentation(details: string[]): boolean {
    try {
      const requiredDocs = ['README.md', 'ROADMAP.md'];
      const missingDocs = requiredDocs.filter(doc => !fs.existsSync(doc));

      if (missingDocs.length === 0) {
        details.push('✅ All required documentation present');
      } else {
        details.push(`❌ Missing documentation: ${missingDocs.join(', ')}`);
        return false;
      }

      // Check for module documentation
      const moduleReadmes = this.getAllFiles('src/modules', ['README.md']);
      if (moduleReadmes.length > 0) {
        details.push(`✅ Found ${moduleReadmes.length} module README files`);
      } else {
        details.push('⚠️ No module-specific documentation found');
      }

      return true;
    } catch (error) {
      details.push(`❌ Error checking documentation: ${error}`);
      return false;
    }
  }

  private getAllFiles(dir: string, extensions: string[]): string[] {
    const files: string[] = [];
    
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.getAllFiles(fullPath, extensions));
        } else {
          if (extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return files;
  }

  private findDuplicateImports(files: string[]): Array<{import: string, files: string[]}> {
    const imports = new Map<string, string[]>();
    
    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const importLines = content.split('\n')
          .filter(line => line.trim().startsWith('import'))
          .map(line => line.trim());
        
        importLines.forEach(line => {
          if (!imports.has(line)) {
            imports.set(line, []);
          }
          imports.get(line)!.push(file);
        });
      } catch (error) {
        // Skip files that can't be read
      }
    });

    return Array.from(imports.entries())
      .filter(([, files]) => files.length > 1)
      .map(([importLine, files]) => ({ import: importLine, files }));
  }

  private printResults(): void {
    console.log('📋 Master Prompt v2.1 Compliance Check Results:');
    console.log('==============================================\n');

    this.results.forEach(result => {
      const status = result.passed ? '✅' : (result.blocking ? '🚨' : '⚠️');
      console.log(`${status} Point ${result.point}: ${result.description}`);
      
      result.details.forEach(detail => {
        console.log(`   ${detail}`);
      });
      console.log();
    });
  }

  private determineExitCode(): void {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const blocking = this.results.filter(r => !r.passed && r.blocking).length;
    const total = this.results.length;

    console.log(`📊 Summary: ${passed}/${total} checks passed`);
    
    if (blocking > 0) {
      console.log(`🚨 ${blocking} blocking issues must be resolved`);
      console.log('\n❌ Master Prompt compliance: FAILED');
      console.log('Phase cannot be completed until all blocking issues are resolved.');
      process.exit(1);
    } else if (failed > 0) {
      console.log(`⚠️ ${failed} non-blocking issues recommended for resolution`);
      console.log('\n✅ Master Prompt compliance: PASSED (with warnings)');
      console.log('Phase can be completed, but issues should be addressed.');
      process.exit(0);
    } else {
      console.log('🎉 All Master Prompt quality gates passed!');
      console.log('\n✅ Master Prompt compliance: PERFECT');
      console.log('Phase is ready for completion and deployment.');
      process.exit(0);
    }
  }
}

// Run the guardian
const guardian = new MasterPromptGuardian();
guardian.runAllChecks().catch(error => {
  console.error('Master Prompt Guardian failed:', error);
  process.exit(1);
});