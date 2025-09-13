#!/usr/bin/env ts-node

/**
 * Build Verification Script
 * Comprehensive check for common TypeScript and build issues
 */

import { readFileSync, existsSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

interface VerificationResult {
  category: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string[];
}

class BuildVerifier {
  private results: VerificationResult[] = [];

  private addResult(category: string, status: 'pass' | 'fail' | 'warning', message: string, details?: string[]) {
    this.results.push({ category, status, message, details });
  }

  async checkTypeExports() {
    console.log('🔍 Checking type exports...');
    
    try {
      // Check if consolidated types exist
      const consolidatedTypesExist = existsSync('src/types/service-types.ts') && 
                                   existsSync('src/types/company-types.ts');
      
      if (consolidatedTypesExist) {
        this.addResult('Types', 'pass', 'Consolidated type files exist');
      } else {
        this.addResult('Types', 'fail', 'Missing consolidated type files', [
          'src/types/service-types.ts',
          'src/types/company-types.ts'
        ]);
      }

      // Check for duplicate type definitions
      const tsFiles = await glob('src/**/*.ts');
      const duplicateTypes = new Map<string, string[]>();
      
      for (const file of tsFiles) {
        try {
          const content = readFileSync(file, 'utf-8');
          
          // Look for interface/type definitions
          const interfaceMatches = content.match(/export interface (\w+)/g);
          const typeMatches = content.match(/export type (\w+)/g);
          
          [...(interfaceMatches || []), ...(typeMatches || [])].forEach(match => {
            const typeName = match.replace(/export (interface|type) /, '');
            if (!duplicateTypes.has(typeName)) {
              duplicateTypes.set(typeName, []);
            }
            duplicateTypes.get(typeName)!.push(file);
          });
        } catch (error) {
          // Skip files that can't be read
        }
      }

      const actualDuplicates = Array.from(duplicateTypes.entries())
        .filter(([_, files]) => files.length > 1)
        .map(([typeName, files]) => `${typeName}: ${files.join(', ')}`);

      if (actualDuplicates.length === 0) {
        this.addResult('Types', 'pass', 'No duplicate type definitions found');
      } else {
        this.addResult('Types', 'warning', 'Potential duplicate types found', actualDuplicates);
      }

    } catch (error) {
      this.addResult('Types', 'fail', 'Error checking types', [(error as Error).message]);
    }
  }

  async checkImports() {
    console.log('🔍 Checking imports...');
    
    try {
      const tsFiles = await glob('src/**/*.ts');
      const problematicImports: string[] = [];
      
      for (const file of tsFiles) {
        try {
          const content = readFileSync(file, 'utf-8');
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            // Check for potential import issues
            if (line.includes('import') && line.includes('from')) {
              // Relative imports going too deep
              if ((line.match(/\.\.\//g) || []).length > 3) {
                problematicImports.push(`${file}:${index + 1} - Deep relative import: ${line.trim()}`);
              }
              
              // Imports without file extensions that might fail
              if (line.includes('./') && !line.includes('.ts') && !line.includes('.js') && !line.includes("'@/")) {
                if (!line.includes('/index') && !line.includes('react') && !line.includes('node_modules')) {
                  problematicImports.push(`${file}:${index + 1} - Missing extension: ${line.trim()}`);
                }
              }
            }
          });
        } catch (error) {
          // Skip files that can't be read
        }
      }

      if (problematicImports.length === 0) {
        this.addResult('Imports', 'pass', 'No problematic imports found');
      } else {
        this.addResult('Imports', 'warning', 'Potential import issues found', problematicImports.slice(0, 10));
      }

    } catch (error) {
      this.addResult('Imports', 'fail', 'Error checking imports', [(error as Error).message]);
    }
  }

  async checkApiStructure() {
    console.log('🔍 Checking API structure...');
    
    try {
      const requiredApiFiles = [
        'src/modules/auth/api/index.ts',
        'src/modules/company/api/index.ts',
        'src/modules/leads/api/index.ts',
        'src/modules/system/api/index.ts'
      ];

      const missingFiles = requiredApiFiles.filter(file => !existsSync(file));
      
      if (missingFiles.length === 0) {
        this.addResult('API', 'pass', 'All required API module index files exist');
      } else {
        this.addResult('API', 'fail', 'Missing API module files', missingFiles);
      }

      // Check for proper exports in API modules
      const apiIndexFiles = await glob('src/modules/*/api/index.ts');
      const emptyExports: string[] = [];
      
      for (const file of apiIndexFiles) {
        try {
          const content = readFileSync(file, 'utf-8');
          if (content.trim().length < 50 || !content.includes('export')) {
            emptyExports.push(file);
          }
        } catch (error) {
          emptyExports.push(`${file} (read error)`);
        }
      }

      if (emptyExports.length === 0) {
        this.addResult('API', 'pass', 'All API modules have proper exports');
      } else {
        this.addResult('API', 'warning', 'API modules with minimal exports', emptyExports);
      }

    } catch (error) {
      this.addResult('API', 'fail', 'Error checking API structure', [(error as Error).message]);
    }
  }

  async checkUtilityFiles() {
    console.log('🔍 Checking utility files...');
    
    const requiredUtils = [
      'src/utils/apiHelpers.ts',
      'src/utils/logger.ts',
      'src/utils/errorHandling.ts'
    ];

    const missingUtils = requiredUtils.filter(file => !existsSync(file));
    
    if (missingUtils.length === 0) {
      this.addResult('Utils', 'pass', 'All required utility files exist');
    } else {
      this.addResult('Utils', 'fail', 'Missing utility files', missingUtils);
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 BUILD VERIFICATION RESULTS');
    console.log('='.repeat(60));
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    
    console.log(`✅ Passed: ${passed} | ❌ Failed: ${failed} | ⚠️  Warnings: ${warnings}\n`);
    
    this.results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      console.log(`${icon} [${result.category}] ${result.message}`);
      
      if (result.details && result.details.length > 0) {
        result.details.forEach(detail => {
          console.log(`   └─ ${detail}`);
        });
      }
    });
    
    console.log('\n' + '='.repeat(60));
    
    const overallStatus = failed === 0 ? 'PASS' : 'FAIL';
    console.log(`🏁 Overall Status: ${overallStatus}`);
    console.log('='.repeat(60));
    
    return failed === 0;
  }

  async run() {
    console.log('🚀 Starting Build Verification...\n');
    
    await this.checkTypeExports();
    await this.checkImports();
    await this.checkApiStructure();
    await this.checkUtilityFiles();
    
    return this.printResults();
  }
}

// Run verification
if (require.main === module) {
  const verifier = new BuildVerifier();
  verifier.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
}

export { BuildVerifier };