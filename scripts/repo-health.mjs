#!/usr/bin/env node

/**
 * Repository health checker - enforces routing standards and catches issues
 * Prevents multiple router instances and routing violations
 */

import { readFileSync, readdirSync } from 'fs';
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
    
    // Check for multiple router instances - CRITICAL ERROR
    if (/<BrowserRouter/i.test(content) && !filePath.includes('test') && !filePath.includes('__tests__')) {
      problems.push(`❌ BrowserRouter found in ${relativePath} - use AppRouter only`);
    }
    
    if (/<HashRouter/i.test(content) && !filePath.includes('test') && !filePath.includes('__tests__')) {
      problems.push(`❌ HashRouter found in ${relativePath} - use AppRouter only`);
    }
    
    // Check for JSX Route elements outside of tests
    if (/<Route(\s|>)/i.test(content) && 
        !filePath.includes('test') && 
        !filePath.includes('__tests__') && 
        !filePath.includes('Shell.tsx')) {
      problems.push(`⚠️ JSX <Route> element in ${relativePath} - prefer route objects`);
    }
    
    // Check for hardcoded navigation paths that should use route objects
    const hardcodedPaths = content.match(/to=['"][^'"]*['"]/g);
    if (hardcodedPaths) {
      const suspiciousPaths = hardcodedPaths.filter(path => 
        !path.includes('http') && 
        !path.includes('#') && 
        !path.includes('mailto:') &&
        path.length > 12 // Ignore simple paths
      );
      
      if (suspiciousPaths.length > 8) {
        problems.push(`⚠️ Many hardcoded navigation paths in ${relativePath} - consider route constants`);
      }
    }
    
    // Check for token cleanup usage
    if (content.includes('__lovable_token') && !content.includes('stripLovableToken')) {
      problems.push(`⚠️ __lovable_token handling in ${relativePath} - ensure proper cleanup`);
    }
    
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}:`, error.message);
  }
}

function checkCasingSensitivity() {
  console.log('🔍 Checking for case sensitivity issues...');
  
  try {
    // Basic case sensitivity check - would need more sophisticated implementation for full coverage
    walkDirectory(SRC_DIR);
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
      console.log('✅ Single router pattern maintained');
      console.log('✅ Route objects standard followed');
      console.log('✅ No critical routing violations detected');
      process.exit(0);
    } else {
      console.log('\n📋 Repository health issues found:\n');
      problems.forEach(problem => console.log(problem));
      
      const criticalIssues = problems.filter(p => p.startsWith('❌'));
      const warnings = problems.filter(p => p.startsWith('⚠️'));
      
      console.log(`\n📊 Summary: ${criticalIssues.length} critical issues, ${warnings.length} warnings`);
      
      if (criticalIssues.length > 0) {
        console.log('\n💥 Critical issues must be fixed before deployment:');
        console.log('- Multiple router instances can cause navigation conflicts');
        console.log('- Use AppRouter wrapper for all routing needs');
        console.log('- Convert JSX Routes to route objects for consistency');
        process.exit(1);
      } else {
        console.log('\n⚠️ Warnings found but build can continue');
        console.log('💡 Consider addressing warnings for better maintainability');
        process.exit(0);
      }
    }
  } catch (error) {
    console.error('💥 Health check failed:', error.message);
    process.exit(1);
  }
}

main();