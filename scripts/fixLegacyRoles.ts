#!/usr/bin/env ts-node

import { glob } from 'glob';
import fs from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m', 
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

interface FixResult {
  success: boolean;
  changes: number;
  error?: string;
}

// Define role mappings
const ROLE_MAPPINGS = {
  'member': 'user',
  'anonymous': 'guest'
};

// Files to skip during fixing
const SKIP_FILES = [
  'scripts/fixLegacyRoles.ts',
  'scripts/guardLegacyRoles.ts',
  '**/*.sql',
  '**/*.md',
  'node_modules/**',
  'dist/**',
  'build/**',
  'coverage/**'
];

// Replacement patterns for role normalization
const REPLACEMENT_PATTERNS = [
  {
    pattern: /\banonymous\b/g,
    replacement: 'guest'
  },
  {
    pattern: /\bmember\b/g,
    replacement: 'user'
  }
];

// Patterns to exempt from replacement
const EXEMPT_PATTERNS = [
  /^\s*\/\/.*$/,           // Single line comments
  /^\s*\/\*[\s\S]*?\*\//, // Multi-line comments
  /console\.(log|warn|error|info)/,
  /normalizeRole/,
  /LEGACY_ROLE_MAP/,
  /fixLegacyRoles/,
  /guardLegacyRoles/
];

async function fixLegacyRoles() {
  try {
    console.log(`${colors.cyan}🔄 Starting legacy role fix...${colors.reset}`);
    
    // Find all relevant files
    const files = await glob(['src/**/*.{ts,tsx,js,jsx}', 'e2e-tests/**/*.{ts,tsx,js,jsx}', 'scripts/**/*.{ts,tsx,js,jsx}', '__tests__/**/*.{ts,tsx,js,jsx}'], {
      ignore: SKIP_FILES,
      dot: true
    });

    console.log(`${colors.cyan}📁 Found ${files.length} files to process${colors.reset}`);

    let totalChanges = 0;
    let processedFiles = 0;
    let successfulFiles = 0;
    let failedFiles = 0;

    for (const file of files) {
      const result = await fixFile(file);
      
      if (result.success) {
        if (result.changes > 0) {
          console.log(`${colors.green}✅ ${file}: ${result.changes} changes${colors.reset}`);
          totalChanges += result.changes;
        }
        successfulFiles++;
      } else {
        console.log(`${colors.red}❌ ${file}: ${result.error}${colors.reset}`);
        failedFiles++;
      }
      
      processedFiles++;
    }

    console.log(`\n${colors.bright}📊 SUMMARY${colors.reset}`);
    console.log(`${colors.cyan}Total files processed: ${processedFiles}${colors.reset}`);
    console.log(`${colors.green}Successful: ${successfulFiles}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failedFiles}${colors.reset}`);
    console.log(`${colors.yellow}Total changes: ${totalChanges}${colors.reset}`);

    if (totalChanges > 0) {
      console.log(`\n${colors.bright}🎯 NEXT STEPS${colors.reset}`);
      console.log(`${colors.cyan}1. Review changes: git diff${colors.reset}`);
      console.log(`${colors.cyan}2. Run type check: npm run typecheck${colors.reset}`);
      console.log(`${colors.cyan}3. Run tests: npm run test${colors.reset}`);
      console.log(`${colors.cyan}4. Run guard: npm run guard:legacy-roles${colors.reset}`);
    }

    console.log(`${colors.green}✅ fixLegacyRoles: changed=${totalChanges}${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error during legacy role fix:${colors.reset}`, error);
    process.exit(1);
  }
}

async function fixFile(filePath: string): Promise<FixResult> {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let changes = 0;
    
    const modifiedLines = lines.map(line => {
      // Skip lines that match exempt patterns
      if (EXEMPT_PATTERNS.some(pattern => pattern.test(line))) {
        return line;
      }
      
      let modifiedLine = line;
      for (const { pattern, replacement } of REPLACEMENT_PATTERNS) {
        const before = modifiedLine;
        modifiedLine = modifiedLine.replace(pattern, replacement);
        if (modifiedLine !== before) {
          changes++;
        }
      }
      
      return modifiedLine;
    });
    
    if (changes > 0) {
      const newContent = modifiedLines.join('\n');
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
    
    return { success: true, changes };
  } catch (error) {
    return { 
      success: false, 
      changes: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Run the script when called directly
if (require.main === module) {
  fixLegacyRoles();
}