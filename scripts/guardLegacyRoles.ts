#!/usr/bin/env ts-node

import { glob } from 'glob';
import fs from 'fs';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m', 
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

interface LegacyRoleIssue {
  file: string;
  line: number;
  match: string;
  context: string;
  severity: 'error' | 'warning';
}

// Patterns to detect legacy role usage
const LEGACY_ROLE_PATTERNS = [
  /\banonymous\b/gi,
  /\bmember\b/gi
];

// Patterns to allow (exceptions)
const ALLOWED_PATTERNS = [
  /^\s*\/\/.*$/,                    // Comments
  /^\s*\/\*[\s\S]*?\*\/$/,         // Multi-line comments
  /console\.(log|warn|error|info)/,  // Console statements
  /normalizeRole/,                  // Function dealing with normalization
  /LEGACY_ROLE_MAP/,               // Legacy mapping constant
  /fixLegacyRoles/,                // This script
  /guardLegacyRoles/,              // Guard script
  /getRoleDisplayName/             // Display name function
];

async function guardLegacyRoles() {
  try {
    console.log(`${colors.cyan}🛡️  Checking for legacy roles in app code...${colors.reset}`);
    
    const files = await glob(['src/**/*', 'e2e-tests/**/*', 'scripts/**/*', '__tests__/**/*'], {
      ignore: ['**/*.sql', '**/*.md', 'node_modules/**', 'dist/**', 'build/**', 'coverage/**'],
      dot: true
    });

    const issues: LegacyRoleIssue[] = [];
    
    for (const file of files) {
      const fileIssues = await checkFile(file);
      issues.push(...fileIssues);
    }

    if (issues.length > 0) {
      console.log(`${colors.red}❌ guardLegacyRoles: legacy roles found in app code:${colors.reset}\n`);
      
      for (const issue of issues) {
        console.log(`${colors.red}${issue.file}:${issue.line}${colors.reset}`);
        console.log(`  ${colors.yellow}Found: ${issue.match}${colors.reset}`);
        console.log(`  ${colors.cyan}Context: ${issue.context.trim()}${colors.reset}\n`);
      }
      
      console.log(`${colors.bright}📊 SUMMARY${colors.reset}`);
      console.log(`${colors.red}Total issues: ${issues.length}${colors.reset}`);
      console.log(`${colors.yellow}Files affected: ${new Set(issues.map(i => i.file)).size}${colors.reset}`);
      
      process.exit(1);
    }

    console.log(`${colors.green}✅ guardLegacyRoles: no legacy roles found in app code${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error during legacy role guard:${colors.reset}`, error);
    process.exit(1);
  }
}

async function checkFile(filePath: string): Promise<LegacyRoleIssue[]> {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues: LegacyRoleIssue[] = [];
    
    lines.forEach((line, index) => {
      // Skip lines that match allowed patterns
      if (ALLOWED_PATTERNS.some(pattern => pattern.test(line))) {
        return;
      }
      
      // Check for legacy role patterns
      for (const pattern of LEGACY_ROLE_PATTERNS) {
        const matches = line.match(pattern);
        if (matches) {
          issues.push({
            file: filePath,
            line: index + 1,
            match: matches[0],
            context: line,
            severity: 'error'
          });
        }
      }
    });
    
    return issues;
  } catch (error) {
    // Skip files that can't be read (binaries, etc.)
    return [];
  }
}

// Run the script when called directly
if (require.main === module) {
  guardLegacyRoles();
}