#!/usr/bin/env ts-node

/**
 * Guard against legacy role usage in codebase
 * Prevents regression to old role names
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface LegacyRoleIssue {
  file: string;
  line: number;
  match: string;
  context: string;
  severity: 'error' | 'warning';
}

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Legacy role patterns to detect (not allowed as canonical values)
const LEGACY_ROLE_PATTERNS = [
  // Direct legacy role usage
  /['"`]anonymous['"`]/g,
  /['"`]member['"`]/g,
  /['"`]regular['"`]/g,
  /['"`]basic['"`]/g,
  /['"`]business['"`]/g,
  /['"`]provider['"`]/g,
  /['"`]vendor['"`]/g,
  /['"`]buyer['"`]/g,
  /['"`]editor['"`]/g,
  /['"`]moderator['"`]/g,
  /['"`]super_admin['"`]/g,
  /['"`]root['"`]/g,
  
  // Role type definitions or constants
  /\banonymous\s*[|:]/g,
  /\bmember\s*[|:]/g,
  /\bregular\s*[|:]/g,
  /\bbasic\s*[|:]/g,
  
  // Case statements
  /case\s+['"`]anonymous['"`]/g,
  /case\s+['"`]member['"`]/g,
  /case\s+['"`]regular['"`]/g,
  /case\s+['"`]basic['"`]/g,
];

// Patterns that are allowed (comments, documentation, etc.)
const ALLOWED_PATTERNS = [
  /\/\/.*/, // Comments
  /\/\*[\s\S]*?\*\//, // Block comments
  /\* .*/, // Documentation comments
  /console\.(log|warn|error|info)/, // Console statements
  /description.*legacy/, // Legacy documentation
  /mapping.*legacy/, // Legacy mapping documentation
  /\bnormalizeRole\b/, // Our normalization function
  /\bisLegacyRole\b/, // Our legacy detection function
  /LEGACY_ROLE_MAP/, // Our mapping object
];

async function guardLegacyRoles(): Promise<void> {
  console.log('🔍 Guarding against legacy role usage...');
  console.log('═'.repeat(50));

  const issues: LegacyRoleIssue[] = [];
  
  // Find all TypeScript and JavaScript files in src/
  const files = await glob('src/**/*.{ts,tsx,js,jsx}');
  
  for (const file of files) {
    const fileIssues = await checkFile(file);
    issues.push(...fileIssues);
  }

  // Report findings
  let errors = 0;
  let warnings = 0;

  if (issues.length === 0) {
    console.log(`${colors.green}✅ No legacy role usage found!${colors.reset}`);
    console.log(`${colors.green}✅ All roles are using canonical values${colors.reset}`);
    process.exit(0);
  }

  issues.forEach(issue => {
    const color = issue.severity === 'error' ? colors.red : colors.yellow;
    const icon = issue.severity === 'error' ? '❌' : '⚠️';
    
    console.log(`${color}${icon} ${issue.file}:${issue.line}${colors.reset}`);
    console.log(`   Match: ${issue.match}`);
    console.log(`   Context: ${issue.context.trim()}`);
    console.log();
    
    if (issue.severity === 'error') errors++;
    else warnings++;
  });

  console.log(`${colors.red}❌ Errors: ${errors}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${warnings}${colors.reset}`);

  if (errors > 0) {
    console.log(`\n${colors.red}🚨 Legacy role usage detected!${colors.reset}`);
    console.log(`${colors.red}Replace with canonical roles: guest, user, company, content_editor, admin, master_admin${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${colors.yellow}⚠️  Warnings found but no blocking errors${colors.reset}`);
    process.exit(0);
  }
}

async function checkFile(filePath: string): Promise<LegacyRoleIssue[]> {
  const issues: LegacyRoleIssue[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Skip lines that match allowed patterns
      if (ALLOWED_PATTERNS.some(pattern => pattern.test(line))) {
        return;
      }
      
      // Check for legacy role patterns
      LEGACY_ROLE_PATTERNS.forEach(pattern => {
        let match;
        pattern.lastIndex = 0; // Reset regex state
        
        while ((match = pattern.exec(line)) !== null) {
          // Double-check it's not in a comment or allowed context
          const beforeMatch = line.substring(0, match.index);
          const isInComment = beforeMatch.includes('//') || beforeMatch.includes('/*');
          const isInConsole = line.includes('console.');
          const isInNormalizeFunction = line.includes('normalizeRole') || line.includes('isLegacyRole');
          
          if (!isInComment && !isInConsole && !isInNormalizeFunction) {
            issues.push({
              file: filePath,
              line: lineNumber,
              match: match[0],
              context: line,
              severity: 'error'
            });
          }
        }
      });
    });
    
  } catch (error) {
    console.warn(`Could not read file ${filePath}:`, error);
  }
  
  return issues;
}

if (require.main === module) {
  guardLegacyRoles().catch(console.error);
}