#!/usr/bin/env ts-node

/**
 * Script to systematically fix legacy role references in the codebase
 * Replaces 'member' with 'user' and 'anonymous' with 'guest'
 */

import { promises as fs } from 'fs';
import { glob } from 'glob';
import path from 'path';

const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Role mappings: legacy -> canonical
const ROLE_MAPPINGS = {
  'member': 'user',
  'anonymous': 'guest',
} as const;

// Files to skip (contain documentation or special cases)
const SKIP_FILES = [
  'README.md',
  'CHANGELOG.md', 
  'scripts/guardLegacyRoles.ts',
  'scripts/fixLegacyRoles.ts',
  'src/modules/auth/normalizeRole.ts', // Contains intentional mappings
];

// Patterns to replace with context awareness
const REPLACEMENT_PATTERNS = [
  // String literals
  { pattern: /(['"`])member\1/g, replacement: '$1user$1' },
  { pattern: /(['"`])anonymous\1/g, replacement: '$1guest$1' },
  
  // Role assignments
  { pattern: /role\s*:\s*(['"`])member\1/g, replacement: 'role: $1user$1' },
  { pattern: /role\s*:\s*(['"`])anonymous\1/g, replacement: 'role: $1guest$1' },
  
  // Comparisons
  { pattern: /===\s*(['"`])member\1/g, replacement: '=== $1user$1' },
  { pattern: /===\s*(['"`])anonymous\1/g, replacement: '=== $1guest$1' },
  { pattern: /(['"`])member\1\s*===/g, replacement: '$1user$1 ===' },
  { pattern: /(['"`])anonymous\1\s*===/g, replacement: '$1guest$1 ===' },
  
  // Array elements
  { pattern: /,\s*(['"`])member\1/g, replacement: ', $1user$1' },
  { pattern: /,\s*(['"`])anonymous\1/g, replacement: ', $1guest$1' },
  { pattern: /\[\s*(['"`])member\1/g, replacement: '[$1user$1' },
  { pattern: /\[\s*(['"`])anonymous\1/g, replacement: '[$1guest$1' },
];

// Patterns that should NOT be replaced (exemptions)
const EXEMPT_PATTERNS = [
  // Comments
  /^\s*\/\/.*$/,
  /^\s*\*.*$/,
  
  // Console logs
  /console\.(log|warn|error|info)/,
  
  // Migration or normalization context
  /normalizeRole|isLegacyRole|LEGACY_ROLE_MAP|migration/i,
  
  // Database/RLS references
  /auth\.users|raw_user_meta_data|policy|RLS/i,
];

interface FixResult {
  file: string;
  changes: number;
  success: boolean;
  error?: string;
}

async function fixLegacyRoles(): Promise<void> {
  console.log(`${colors.blue}🔧 Starting legacy role fix...${colors.reset}`);
  
  // Find all source files
  const files = await glob(['src/**/*.{ts,tsx,js,jsx}'], {
    ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**']
  });
  
  const results: FixResult[] = [];
  
  for (const file of files) {
    // Skip exempt files
    if (SKIP_FILES.some(skip => file.includes(skip))) {
      console.log(`${colors.yellow}⏭️  Skipping: ${file}${colors.reset}`);
      continue;
    }
    
    const result = await fixFile(file);
    results.push(result);
    
    if (result.success && result.changes > 0) {
      console.log(`${colors.green}✅ Fixed ${result.changes} issues in: ${file}${colors.reset}`);
    } else if (!result.success) {
      console.log(`${colors.red}❌ Error fixing: ${file} - ${result.error}${colors.reset}`);
    }
  }
  
  // Summary
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalChanges = successful.reduce((sum, r) => sum + r.changes, 0);
  
  console.log(`\n${colors.bold}Summary:${colors.reset}`);
  console.log(`${colors.green}✅ Successfully processed: ${successful.length} files${colors.reset}`);
  console.log(`${colors.green}🔧 Total fixes applied: ${totalChanges}${colors.reset}`);
  
  if (failed.length > 0) {
    console.log(`${colors.red}❌ Failed to process: ${failed.length} files${colors.reset}`);
    for (const fail of failed) {
      console.log(`  ${fail.file}: ${fail.error}`);
    }
  }
  
  console.log(`\n${colors.blue}💡 Next steps:${colors.reset}`);
  console.log('1. Run npm run typecheck to verify fixes');
  console.log('2. Run npm run test to ensure functionality');
  console.log('3. Run scripts/guardLegacyRoles.ts to verify no legacy roles remain');
}

async function fixFile(filePath: string): Promise<FixResult> {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    const originalContent = content;
    let changeCount = 0;
    
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip exempt lines
      if (EXEMPT_PATTERNS.some(pattern => pattern.test(line))) {
        continue;
      }
      
      let modifiedLine = line;
      
      // Apply replacement patterns
      for (const { pattern, replacement } of REPLACEMENT_PATTERNS) {
        const before = modifiedLine;
        modifiedLine = modifiedLine.replace(pattern, replacement);
        if (before !== modifiedLine) {
          changeCount++;
        }
      }
      
      lines[i] = modifiedLine;
    }
    
    content = lines.join('\n');
    
    // Only write if changes were made
    if (content !== originalContent) {
      await fs.writeFile(filePath, content, 'utf8');
    }
    
    return {
      file: filePath,
      changes: changeCount,
      success: true,
    };
  } catch (error) {
    return {
      file: filePath,
      changes: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Run the fixer if called directly
if (require.main === module) {
  fixLegacyRoles().catch(error => {
    console.error(`${colors.red}Error running legacy role fixer:${colors.reset}`, error);
    process.exit(1);
  });
}

export { fixLegacyRoles };