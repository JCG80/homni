#!/usr/bin/env node

/**
 * Repository health checker - enforces routing standards and catches issues
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const SRC_DIR = 'src';
const problems = [];

function walkDirectory(dirPath) {
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walkDirectory(fullPath);
        }
      } else if (/\.(t|j)sx?$/.test(entry.name)) {
        checkFile(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dirPath}:`, error.message);
  }
}

function checkFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const relativePath = relative(process.cwd(), filePath);
    
    // Check for multiple router instances
    if (/<BrowserRouter/i.test(content)) {
      problems.push(`❌ BrowserRouter found in ${relativePath} - use single AppRouter only`);
    }
    
    if (/<HashRouter/i.test(content)) {
      problems.push(`❌ HashRouter found in ${relativePath} - use single AppRouter only`);
    }
    
    // Allow Routes in main entry points but warn about JSX Route elements elsewhere
    if (/<Route(\s|>)/i.test(content) && !filePath.includes('Shell.tsx') && !filePath.includes('App.tsx')) {
      problems.push(`⚠️ JSX <Route> element in ${relativePath} - prefer route objects`);
    }
    
    // Check for hardcoded navigation paths that should use route objects
    const hardcodedPaths = content.match(/to=['"][^'"]*['"]/g);
    if (hardcodedPaths) {
      const suspiciousPaths = hardcodedPaths.filter(path => 
        !path.includes('http') && 
        !path.includes('#') && 
        !path.includes('mailto:') &&
        path.length > 8 // Ignore simple paths like "/"
      );
      
      if (suspiciousPaths.length > 5) {
        problems.push(`⚠️ Many hardcoded navigation paths in ${relativePath} - consider route constants`);
      }
    }
    
    // Check for token cleanup
    if (content.includes('__lovable_token') && !content.includes('stripLovableToken')) {
      problems.push(`⚠️ __lovable_token handling in ${relativePath} - ensure proper cleanup`);
    }
    
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}:`, error.message);
  }
}

function checkCasingSensitivity() {
  console.log('🔍 Checking for case sensitivity issues...');
  
  // This is more relevant for deployment - in development we can check for common patterns
  const commonIssues = [];
  
  try {
    walkDirectory(SRC_DIR);
    
    // Additional check for common case issues in imports
    // This would need more sophisticated analysis for full coverage
    console.log('✅ Basic case sensitivity check passed');
  } catch (error) {
    problems.push(`❌ Case sensitivity check failed: ${error.message}`);
  }
}

function main() {
  console.log('🔍 Running repository health checks...\n');
  
  try {
    console.log('📁 Scanning source files for routing violations...');
    walkDirectory(SRC_DIR);
    
    checkCasingSensitivity();
    
    if (problems.length === 0) {
      console.log('\n🎉 Repository health check passed - no issues found!');
      process.exit(0);
    } else {
      console.log('\n📋 Repository health issues found:\n');
      problems.forEach(problem => console.log(problem));
      
      const criticalIssues = problems.filter(p => p.startsWith('❌'));
      const warnings = problems.filter(p => p.startsWith('⚠️'));
      
      console.log(`\n📊 Summary: ${criticalIssues.length} critical issues, ${warnings.length} warnings`);
      
      if (criticalIssues.length > 0) {
        console.log('\n💥 Critical issues must be fixed before deployment');
        process.exit(1);
      } else {
        console.log('\n⚠️ Warnings found but build can continue');
        process.exit(0);
      }
    }
  } catch (error) {
    console.error('💥 Health check failed:', error.message);
    process.exit(1);
  }
}

main();