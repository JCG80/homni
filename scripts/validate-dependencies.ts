#!/usr/bin/env tsx

/**
 * Comprehensive dependency validation and security check
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';

interface ValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
}

async function validateDependencies(): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    issues: [],
    warnings: [],
    recommendations: []
  };

  console.log('🔍 Starting comprehensive dependency validation...');

  try {
    // Check package.json structure
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    
    // Validate React ecosystem
    const reactDeps = ['react', 'react-dom', 'react-router-dom'];
    const reactTypes = ['@types/react', '@types/react-dom', '@types/react-router-dom'];
    
    for (const dep of reactDeps) {
      if (!packageJson.dependencies?.[dep]) {
        result.issues.push(`Missing critical dependency: ${dep}`);
        result.isValid = false;
      }
    }
    
    for (const type of reactTypes) {
      if (!packageJson.devDependencies?.[type]) {
        result.warnings.push(`Missing TypeScript types: ${type}`);
      }
    }
    
    // Check for security vulnerabilities
    try {
      execSync('npm audit --audit-level moderate', { stdio: 'pipe' });
      console.log('✅ No moderate+ security vulnerabilities found');
    } catch (error) {
      result.warnings.push('Security vulnerabilities detected - run npm audit for details');
    }
    
    // Check for outdated packages
    try {
      execSync('npm outdated', { stdio: 'pipe' });
    } catch (error) {
      result.recommendations.push('Some packages may be outdated - consider running npm update');
    }
    
    // Validate TypeScript configuration
    try {
      const tsconfig = JSON.parse(readFileSync('tsconfig.json', 'utf8'));
      if (!tsconfig.compilerOptions?.jsx) {
        result.issues.push('TypeScript configuration missing JSX support');
        result.isValid = false;
      }
    } catch (error) {
      result.issues.push('Unable to validate TypeScript configuration');
      result.isValid = false;
    }
    
  } catch (error) {
    result.issues.push(`Validation failed: ${error}`);
    result.isValid = false;
  }

  // Report results
  console.log('\n📊 Validation Results:');
  console.log(`✅ Valid: ${result.isValid}`);
  
  if (result.issues.length > 0) {
    console.log('\n❌ Issues:');
    result.issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  if (result.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    result.recommendations.forEach(rec => console.log(`  - ${rec}`));
  }

  return result;
}

validateDependencies().then(result => {
  process.exit(result.isValid ? 0 : 1);
});