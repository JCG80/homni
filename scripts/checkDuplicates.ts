#!/usr/bin/env ts-node

/**
 * Script to check for duplicate files, exports, and type definitions
 * Part of the Ultimate Master 2.0 quality gates
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface DuplicateIssue {
  type: 'file' | 'export' | 'type';
  name: string;
  locations: string[];
  severity: 'error' | 'warning';
}

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

async function checkDuplicates(): Promise<void> {
  console.log('🔍 Checking for duplicates...\n');
  
  const issues: DuplicateIssue[] = [];
  
  // Check for duplicate component files
  const componentDuplicates = findDuplicateFiles('src/components', '.tsx');
  issues.push(...componentDuplicates);
  
  // Check for duplicate hook files
  const hookDuplicates = findDuplicateFiles('src/hooks', '.ts');
  issues.push(...hookDuplicates);
  
  // Check for duplicate type files
  const typeDuplicates = findDuplicateFiles('src/types', '.ts');
  issues.push(...typeDuplicates);
  
  // Check for duplicate exports in index files
  const exportDuplicates = checkDuplicateExports();
  issues.push(...exportDuplicates);
  
  // Report findings
  if (issues.length === 0) {
    console.log(`${GREEN}✅ No duplicates found${RESET}`);
    return;
  }
  
  let errors = 0;
  let warnings = 0;
  
  issues.forEach(issue => {
    const color = issue.severity === 'error' ? RED : YELLOW;
    const icon = issue.severity === 'error' ? '❌' : '⚠️';
    
    console.log(`${color}${icon} Duplicate ${issue.type}: ${issue.name}${RESET}`);
    issue.locations.forEach(loc => console.log(`   ${loc}`));
    console.log();
    
    if (issue.severity === 'error') errors++;
    else warnings++;
  });
  
  console.log(`${RED}❌ Errors: ${errors}${RESET}`);
  console.log(`${YELLOW}⚠️  Warnings: ${warnings}${RESET}`);
  
  if (errors > 0) {
    console.log(`\n${RED}🚨 Duplicate check failed. Fix errors before proceeding.${RESET}`);
    process.exit(1);
  }
}

function findDuplicateFiles(dir: string, extension: string): DuplicateIssue[] {
  if (!fs.existsSync(dir)) return [];
  
  const files: { [key: string]: string[] } = {};
  
  function scanDirectory(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.name.endsWith(extension)) {
        const baseName = path.basename(entry.name, extension);
        if (!files[baseName]) files[baseName] = [];
        files[baseName].push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  
  return Object.entries(files)
    .filter(([_, locations]) => locations.length > 1)
    .map(([name, locations]) => ({
      type: 'file' as const,
      name,
      locations,
      severity: 'error' as const
    }));
}

function checkDuplicateExports(): DuplicateIssue[] {
  const issues: DuplicateIssue[] = [];
  
  // Find all index.ts files
  const indexFiles = findFiles('src', 'index.ts');
  
  indexFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const exports = extractExports(content);
      const duplicates = findDuplicatesInArray(exports);
      
      duplicates.forEach(duplicate => {
        issues.push({
          type: 'export',
          name: `${duplicate} (in ${file})`,
          locations: [`${file}: export appears ${exports.filter(e => e === duplicate).length} times`],
          severity: 'error'
        });
      });
    } catch (error) {
      // Skip files that can't be read
    }
  });
  
  return issues;
}

function findFiles(dir: string, filename: string): string[] {
  const results: string[] = [];
  
  function scan(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;
    
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.name === filename) {
        results.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return results;
}

function extractExports(content: string): string[] {
  const exportRegex = /export\s+(?:\{([^}]+)\}|(?:\*\s+as\s+(\w+))|(?:default\s+)?(\w+))/g;
  const exports: string[] = [];
  let match;
  
  while ((match = exportRegex.exec(content)) !== null) {
    if (match[1]) {
      // Named exports: export { a, b, c }
      const namedExports = match[1].split(',').map(e => e.trim().split(' as ')[0].trim());
      exports.push(...namedExports);
    } else if (match[2]) {
      // Re-export: export * as name
      exports.push(match[2]);
    } else if (match[3]) {
      // Default or named export
      exports.push(match[3]);
    }
  }
  
  return exports;
}

function findDuplicatesInArray<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  const duplicates = new Set<T>();
  
  arr.forEach(item => {
    if (seen.has(item)) {
      duplicates.add(item);
    } else {
      seen.add(item);
    }
  });
  
  return Array.from(duplicates);
}

if (require.main === module) {
  checkDuplicates().catch(console.error);
}