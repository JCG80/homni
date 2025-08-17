#!/usr/bin/env tsx

/**
 * Duplicate detector script for auth module cleanup
 * Scans for duplicate function definitions, types, and components
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface DuplicateReport {
  functions: Record<string, string[]>;
  types: Record<string, string[]>;
  components: Record<string, string[]>;
  interfaces: Record<string, string[]>;
}

const report: DuplicateReport = {
  functions: {},
  types: {},
  components: {},
  interfaces: {}
};

function scanDirectory(dir: string): void {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      scanDirectory(fullPath);
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath: string): void {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Find function declarations
    const functionMatches = content.match(/(?:export\s+)?(?:function|const)\s+(\w+)/g);
    if (functionMatches) {
      functionMatches.forEach(match => {
        const name = match.replace(/(?:export\s+)?(?:function|const)\s+/, '');
        if (!report.functions[name]) report.functions[name] = [];
        report.functions[name].push(filePath);
      });
    }
    
    // Find type declarations
    const typeMatches = content.match(/(?:export\s+)?type\s+(\w+)/g);
    if (typeMatches) {
      typeMatches.forEach(match => {
        const name = match.replace(/(?:export\s+)?type\s+/, '');
        if (!report.types[name]) report.types[name] = [];
        report.types[name].push(filePath);
      });
    }
    
    // Find interface declarations
    const interfaceMatches = content.match(/(?:export\s+)?interface\s+(\w+)/g);
    if (interfaceMatches) {
      interfaceMatches.forEach(match => {
        const name = match.replace(/(?:export\s+)?interface\s+/, '');
        if (!report.interfaces[name]) report.interfaces[name] = [];
        report.interfaces[name].push(filePath);
      });
    }
    
    // Find React components
    const componentMatches = content.match(/(?:export\s+)?(?:const|function)\s+(\w+).*(?:React\.FC|ReactNode|JSX\.Element)/g);
    if (componentMatches) {
      componentMatches.forEach(match => {
        const name = match.replace(/(?:export\s+)?(?:const|function)\s+(\w+).*/, '$1');
        if (!report.components[name]) report.components[name] = [];
        report.components[name].push(filePath);
      });
    }
  } catch (error) {
    console.warn(`Could not scan file ${filePath}:`, error);
  }
}

function printReport(): void {
  console.log('🔍 DUPLICATE DETECTION REPORT\n');
  
  let foundDuplicates = false;
  
  // Check functions
  const duplicateFunctions = Object.entries(report.functions).filter(([_, files]) => files.length > 1);
  if (duplicateFunctions.length > 0) {
    foundDuplicates = true;
    console.log('⚠️  DUPLICATE FUNCTIONS:');
    duplicateFunctions.forEach(([name, files]) => {
      console.log(`  ${name}: ${files.length} occurrences`);
      files.forEach(file => console.log(`    - ${file}`));
    });
    console.log();
  }
  
  // Check types
  const duplicateTypes = Object.entries(report.types).filter(([_, files]) => files.length > 1);
  if (duplicateTypes.length > 0) {
    foundDuplicates = true;
    console.log('⚠️  DUPLICATE TYPES:');
    duplicateTypes.forEach(([name, files]) => {
      console.log(`  ${name}: ${files.length} occurrences`);
      files.forEach(file => console.log(`    - ${file}`));
    });
    console.log();
  }
  
  // Check interfaces
  const duplicateInterfaces = Object.entries(report.interfaces).filter(([_, files]) => files.length > 1);
  if (duplicateInterfaces.length > 0) {
    foundDuplicates = true;
    console.log('⚠️  DUPLICATE INTERFACES:');
    duplicateInterfaces.forEach(([name, files]) => {
      console.log(`  ${name}: ${files.length} occurrences`);
      files.forEach(file => console.log(`    - ${file}`));
    });
    console.log();
  }
  
  // Check components
  const duplicateComponents = Object.entries(report.components).filter(([_, files]) => files.length > 1);
  if (duplicateComponents.length > 0) {
    foundDuplicates = true;
    console.log('⚠️  DUPLICATE COMPONENTS:');
    duplicateComponents.forEach(([name, files]) => {
      console.log(`  ${name}: ${files.length} occurrences`);
      files.forEach(file => console.log(`    - ${file}`));
    });
    console.log();
  }
  
  if (!foundDuplicates) {
    console.log('✅ No duplicates found! Auth module is clean.');
  } else {
    console.log('🔧 Consider consolidating duplicates or removing unused exports.');
  }
}

// Run the scan
console.log('🔍 Scanning for duplicates in auth module...\n');
scanDirectory('src/modules/auth');
printReport();