#!/usr/bin/env node

/**
 * Guard script: Check RLS policies use proper security functions
 * Part of Hybrid Testability & QA Pass v3.1
 */

const fs = require('fs');
const glob = require('glob');

function checkRlsPolicies() {
  console.log('🔍 Checking RLS policy security...');
  
  const sqlFiles = glob.sync('supabase/**/*.sql');
  
  if (sqlFiles.length === 0) {
    console.log('ℹ️  No SQL files found');
    return;
  }
  
  const issues = [];
  const recommendations = [];
  
  sqlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Find all CREATE POLICY statements
    const policyRegex = /CREATE\s+POLICY\s+[^;]+;/gis;
    let match;
    
    while ((match = policyRegex.exec(content)) !== null) {
      const policy = match[0];
      
      // Check for admin-related policies that could use role grants
      if (policy.includes('admin') || policy.includes('master_admin')) {
        if (!policy.includes('has_role_grant') && !policy.includes('is_master_admin')) {
          recommendations.push({
            file,
            suggestion: 'Consider extending with has_role_grant() or is_master_admin()',
            policy: policy.split('\n')[0]
          });
        }
      }
      
      // Check for potential security issues
      if (policy.includes('auth.uid() =') && policy.includes('SELECT') && policy.includes('FROM')) {
        issues.push({
          file,
          issue: 'Potential recursive RLS - use security definer function instead',
          policy: policy.split('\n')[0]
        });
      }
    }
  });
  
  console.log(`📊 RLS Analysis:`);
  console.log(`   Issues: ${issues.length}`);
  console.log(`   Recommendations: ${recommendations.length}`);
  
  if (issues.length > 0) {
    console.log('\n❌ RLS Issues:');
    issues.forEach(issue => {
      console.log(`   ${issue.file}: ${issue.issue}`);
      console.log(`     ${issue.policy}`);
    });
  }
  
  if (recommendations.length > 0) {
    console.log('\n💡 RLS Recommendations:');
    recommendations.forEach(rec => {
      console.log(`   ${rec.file}: ${rec.suggestion}`);
      console.log(`     ${rec.policy}`);
    });
  }
  
  if (issues.length === 0 && recommendations.length === 0) {
    console.log('✅ RLS policies look good');
  }
  
  // Only exit with error for actual issues, not recommendations
  if (issues.length > 0) {
    process.exit(1);
  }
}

checkRlsPolicies();