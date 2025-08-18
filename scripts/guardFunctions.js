#!/usr/bin/env node

/**
 * Guard script: Check that all SQL functions have SECURITY DEFINER + SET search_path
 * Part of Hybrid Testability & QA Pass v3.1
 */

const fs = require('fs');
const glob = require('glob');

function checkFunctionSecurity() {
  console.log('🔍 Checking SQL function security...');
  
  const sqlFiles = glob.sync('supabase/**/*.sql');
  
  if (sqlFiles.length === 0) {
    console.log('ℹ️  No SQL files found');
    return;
  }
  
  const issues = [];
  
  sqlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Find all CREATE FUNCTION statements
    const functionRegex = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+[\w.]+\([^)]*\)[^$]*?\$\$[^$]*?\$\$/gis;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      const functionDef = match[0];
      
      // Check for SECURITY DEFINER
      if (!functionDef.includes('SECURITY DEFINER')) {
        issues.push({
          file,
          issue: 'Missing SECURITY DEFINER',
          function: functionDef.split('\n')[0]
        });
      }
      
      // Check for SET search_path
      if (!functionDef.includes('SET search_path')) {
        issues.push({
          file,
          issue: 'Missing SET search_path',
          function: functionDef.split('\n')[0]
        });
      }
    }
  });
  
  if (issues.length === 0) {
    console.log('✅ All SQL functions properly secured');
    return;
  }
  
  console.log(`❌ Found ${issues.length} function security issues:`);
  
  const groupedIssues = {};
  issues.forEach(issue => {
    if (!groupedIssues[issue.file]) groupedIssues[issue.file] = [];
    groupedIssues[issue.file].push(issue);
  });
  
  Object.entries(groupedIssues).forEach(([file, fileIssues]) => {
    console.log(`\n📄 ${file}:`);
    fileIssues.forEach(issue => {
      console.log(`   ${issue.issue}: ${issue.function}`);
    });
  });
  
  console.log('\n💡 Add SECURITY DEFINER and SET search_path = public to all functions');
  process.exit(1);
}

checkFunctionSecurity();