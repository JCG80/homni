#!/usr/bin/env ts-node

/**
 * Duplicate Detection Guard
 * Part of Homni Master Prompt compliance
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface DuplicateCheck {
  passed: boolean;
  message: string;
  files?: string[];
}

function checkDuplicates(): DuplicateCheck {
  console.log('🔍 Checking for duplicate files and code patterns...\n');
  
  const issues: string[] = [];
  const duplicateFiles: string[] = [];
  
  try {
    // Check for common duplicate patterns
    const tsFiles = glob.sync('src/**/*.{ts,tsx}', { ignore: ['**/*.d.ts', '**/*.test.ts', '**/*.spec.ts'] });
    
    // Track duplicate component names
    const componentNames = new Map<string, string[]>();
    const hookNames = new Map<string, string[]>();
    
    for (const file of tsFiles) {
      const fileName = path.basename(file, path.extname(file));
      
      // Check for duplicate component names
      if (fileName.match(/^[A-Z]/)) {
        if (!componentNames.has(fileName)) {
          componentNames.set(fileName, []);
        }
        componentNames.get(fileName)!.push(file);
      }
      
      // Check for duplicate hook names
      if (fileName.startsWith('use')) {
        if (!hookNames.has(fileName)) {
          hookNames.set(fileName, []);
        }
        hookNames.get(fileName)!.push(file);
      }
    }
    
    // Report duplicates
    for (const [name, files] of componentNames) {
      if (files.length > 1) {
        issues.push(`Duplicate component: ${name} (${files.join(', ')})`);
        duplicateFiles.push(...files);
      }
    }
    
    for (const [name, files] of hookNames) {
      if (files.length > 1) {
        issues.push(`Duplicate hook: ${name} (${files.join(', ')})`);
        duplicateFiles.push(...files);
      }
    }
    
    // Check for case sensitivity issues
    const fileMap = new Map<string, string[]>();
    for (const file of tsFiles) {
      const lowerFile = file.toLowerCase();
      if (!fileMap.has(lowerFile)) {
        fileMap.set(lowerFile, []);
      }
      fileMap.get(lowerFile)!.push(file);
    }
    
    for (const [lowerName, files] of fileMap) {
      if (files.length > 1) {
        issues.push(`Case sensitivity issue: ${files.join(' vs ')}`);
        duplicateFiles.push(...files);
      }
    }
    
    if (issues.length === 0) {
      return {
        passed: true,
        message: '✅ No duplicates found'
      };
    } else {
      return {
        passed: false,
        message: `❌ Found ${issues.length} duplicate issues:\n${issues.map(i => `  - ${i}`).join('\n')}`,
        files: [...new Set(duplicateFiles)]
      };
    }
    
  } catch (error) {
    return {
      passed: false,
      message: `❌ Error checking duplicates: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

if (require.main === module) {
  const result = checkDuplicates();
  console.log(result.message);
  process.exit(result.passed ? 0 : 1);
}

export default checkDuplicates;