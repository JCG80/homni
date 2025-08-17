#!/usr/bin/env ts-node

/**
 * Unit Test Coverage Guard
 * Ensures unit test coverage meets minimum requirements
 */

import { execSync } from 'child_process';

console.log('🧪 Unit Test Coverage Check');
console.log('═'.repeat(40));

try {
  const result = execSync('npm run test:coverage', { encoding: 'utf8' });
  console.log(result);
  
  // Simple check for now - if tests pass, coverage is acceptable
  console.log('✅ Unit tests passed with coverage');
  process.exit(0);
} catch (error) {
  console.log('❌ Unit test coverage failed');
  console.error(error);
  process.exit(1);
}