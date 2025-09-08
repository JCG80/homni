#!/usr/bin/env ts-node

/**
 * Enhanced duplicate detection script
 * Detects duplicate pages, types, and constants to prevent code duplication
 */

import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';

interface DuplicateIssue {
  type: 'page' | 'type' | 'constant';
  name: string;
  locations: string[];
  severity: 'error' | 'warning';
}

async function findDuplicatePages(): Promise<DuplicateIssue[]> {
  const issues: DuplicateIssue[] = [];
  
  // Find all page components
  const pageFiles = await glob('src/**/*Page.tsx');
  const pageNames = new Map<string, string[]>();
  
  pageFiles.forEach(file => {
    const basename = path.basename(file, '.tsx');
    if (!pageNames.has(basename)) {
      pageNames.set(basename, []);
    }
    pageNames.get(basename)!.push(file);
  });
  
  // Find duplicates
  pageNames.forEach((locations, name) => {
    if (locations.length > 1) {
      issues.push({
        type: 'page',
        name,
        locations,
        severity: 'error'
      });
    }
  });
  
  return issues;
}

async function findDuplicateTypes(): Promise<DuplicateIssue[]> {
  const issues: DuplicateIssue[] = [];
  
  // Patterns to look for
  const typePatterns = [
    { name: 'UserRole', pattern: /export type UserRole = / },
    { name: 'ALL_ROLES', pattern: /export const ALL_ROLES/ },
    { name: 'PUBLIC_ROLES', pattern: /export const PUBLIC_ROLES/ },
    { name: 'AUTHENTICATED_ROLES', pattern: /export const AUTHENTICATED_ROLES/ },
    { name: 'roleIcons', pattern: /const roleIcons = {/ },
    { name: 'roleLabels', pattern: /const roleLabels = {/ },
  ];
  
  const typeScriptFiles = await glob('src/**/*.{ts,tsx}');
  
  for (const pattern of typePatterns) {
    const locations: string[] = [];
    
    for (const file of typeScriptFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (pattern.pattern.test(content)) {
        locations.push(file);
      }
    }
    
    if (locations.length > 1) {
      // Filter out known acceptable duplicates
      const filteredLocations = locations.filter(loc => {
        const content = fs.readFileSync(loc, 'utf8');
        // Allow re-exports and legacy compatibility files
        return !content.includes('Re-export') && !content.includes('DEPRECATED');
      });
      
      if (filteredLocations.length > 1) {
        issues.push({
          type: 'type',
          name: pattern.name,
          locations: filteredLocations,
          severity: pattern.name.includes('Role') ? 'error' : 'warning'
        });
      }
    }
  }
  
  return issues;
}

async function main() {
  console.log('🔍 Scanning for duplicate pages and types...\n');
  
  const [pageIssues, typeIssues] = await Promise.all([
    findDuplicatePages(),
    findDuplicateTypes()
  ]);
  
  const allIssues = [...pageIssues, ...typeIssues];
  
  if (allIssues.length === 0) {
    console.log('✅ No duplicates found!');
    process.exit(0);
  }
  
  let errorCount = 0;
  
  allIssues.forEach(issue => {
    const emoji = issue.severity === 'error' ? '❌' : '⚠️';
    const typeLabel = issue.type.toUpperCase();
    
    console.log(`${emoji} DUPLICATE ${typeLabel}: ${issue.name}`);
    issue.locations.forEach(loc => console.log(`   ${loc}`));
    console.log();
    
    if (issue.severity === 'error') {
      errorCount++;
    }
  });
  
  if (errorCount > 0) {
    console.log(`\n💥 Found ${errorCount} critical duplicates that must be resolved.`);
    process.exit(1);
  } else {
    console.log(`\n⚠️ Found ${allIssues.length} warnings - consider consolidating.`);
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(console.error);
}