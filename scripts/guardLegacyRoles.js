#!/usr/bin/env node

/**
 * Guard script: Check for legacy role references (anonymous, member)
 * Part of Hybrid Testability & QA Pass v3.1
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const LEGACY_ROLES = ['anonymous', 'member'];
const IGNORE_PATTERNS = ['**/*.sql', '**/*.md', 'node_modules/**', 'dist/**', 'build/**', 'coverage/**'];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const findings = [];
  
  LEGACY_ROLES.forEach(role => {
    const regex = new RegExp(`\\b${role}\\b`, 'gi');
    let match;
    let lineNumber = 1;
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (regex.test(line)) {
        findings.push({
          file: filePath,
          line: index + 1,
          role: role,
          content: line.trim()
        });
      }
    });
  });
  
  return findings;
}

function main() {
  console.log('🔍 Scanning for legacy role references...');
  
  const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
    ignore: IGNORE_PATTERNS
  });
  
  let totalFindings = 0;
  const results = {};
  
  files.forEach(file => {
    const findings = scanFile(file);
    if (findings.length > 0) {
      results[file] = findings;
      totalFindings += findings.length;
    }
  });
  
  if (totalFindings === 0) {
    console.log('✅ No legacy role references found');
    process.exit(0);
  }
  
  console.log(`❌ Found ${totalFindings} legacy role references:`);
  
  Object.entries(results).forEach(([file, findings]) => {
    console.log(`\n📄 ${file}:`);
    findings.forEach(finding => {
      console.log(`  Line ${finding.line}: "${finding.role}" in: ${finding.content}`);
    });
  });
  
  console.log('\n💡 Use: npm run fix:legacy-roles to automatically fix these issues');
  process.exit(1);
}

main();