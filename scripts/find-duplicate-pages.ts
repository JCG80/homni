#!/usr/bin/env ts-node

/**
 * Script to detect and prevent duplicate page components across the codebase
 * Follows find-before-build architecture principle
 */

import { glob } from 'glob';
import path from 'path';
import fs from 'fs';

interface PageInfo {
  path: string;
  component: string;
  exportName: string;
}

async function findAllPages(): Promise<PageInfo[]> {
  // Find all potential page files
  const patterns = [
    'src/pages/**/*.tsx',
    'src/modules/**/pages/*.tsx',
    'src/components/**/pages/*.tsx'
  ];

  const pages: PageInfo[] = [];

  for (const pattern of patterns) {
    const files = await glob(pattern);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Extract component name from filename
      const filename = path.basename(file, '.tsx');
      
      // Look for export patterns
      const exportMatches = content.match(/export\s+(const|function)\s+(\w+)/g) || [];
      const defaultExportMatch = content.match(/export\s+default\s+(\w+)/);
      
      let exportName = filename;
      if (defaultExportMatch) {
        exportName = defaultExportMatch[1];
      } else if (exportMatches.length > 0) {
        const firstExport = exportMatches[0].match(/export\s+(?:const|function)\s+(\w+)/);
        if (firstExport) {
          exportName = firstExport[1];
        }
      }

      pages.push({
        path: file,
        component: filename,
        exportName
      });
    }
  }

  return pages;
}

function detectDuplicates(pages: PageInfo[]): Map<string, PageInfo[]> {
  const duplicates = new Map<string, PageInfo[]>();
  
  // Group by component name
  const grouped = pages.reduce((acc, page) => {
    const key = page.component.toLowerCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(page);
    return acc;
  }, {} as Record<string, PageInfo[]>);

  // Find duplicates
  for (const [componentName, pageList] of Object.entries(grouped)) {
    if (pageList.length > 1) {
      duplicates.set(componentName, pageList);
    }
  }

  return duplicates;
}

function generateReport(duplicates: Map<string, PageInfo[]>): void {
  console.log('\n🔍 DUPLICATE PAGE DETECTION REPORT');
  console.log('=====================================');
  
  if (duplicates.size === 0) {
    console.log('✅ No duplicate pages found!');
    return;
  }

  console.log(`❌ Found ${duplicates.size} duplicate page components:\n`);

  duplicates.forEach((pages, componentName) => {
    console.log(`📄 Component: ${componentName}`);
    console.log(`   Duplicates found: ${pages.length}`);
    
    pages.forEach((page, index) => {
      const isModular = page.path.includes('/modules/');
      const isPlaceholder = page.path.includes('/pages/');
      
      let status = '';
      if (isModular) status = '✓ Functional';
      else if (isPlaceholder) status = '⚠️  Placeholder';
      
      console.log(`   ${index + 1}. ${page.path} ${status}`);
    });
    
    console.log('   Recommendation: Keep functional version, delete placeholder\n');
  });
}

async function main() {
  try {
    console.log('🔍 Scanning for duplicate pages...');
    
    const pages = await findAllPages();
    const duplicates = detectDuplicates(pages);
    
    generateReport(duplicates);
    
    // Exit with error code if duplicates found (for CI)
    if (duplicates.size > 0) {
      console.log('💡 To fix: Run this script in --fix mode or manually remove duplicates');
      process.exit(1);
    }
    
    console.log('✅ Scan complete - no issues found');
    
  } catch (error) {
    console.error('❌ Error scanning for duplicates:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { findAllPages, detectDuplicates, generateReport };