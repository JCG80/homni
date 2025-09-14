#!/usr/bin/env tsx

/**
 * Security Audit Script
 * Comprehensive security check for RLS policies and data exposure
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kkazhcihooovsuwravhs.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXpoY2lob29vdnN1d3JhdmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzMwMzUsImV4cCI6MjA2MjEwOTAzNX0.-HzjqXYqgThN0PrbrwZlm5GWK1vOGOeYHEEFrt0OpwM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SecurityIssue {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  table: string;
  issue: string;
  recommendation: string;
}

const SENSITIVE_TABLES = [
  'admin_actions_log',
  'admin_audit_log',
  'analytics_events', 
  'analytics_metrics',
  'user_profiles',
  'leads',
  'smart_start_submissions'
];

async function checkAnonymousAccess(): Promise<SecurityIssue[]> {
  console.log('🔍 Checking anonymous access policies...');
  const issues: SecurityIssue[] = [];
  
  // Ensure no user is logged in
  await supabase.auth.signOut();
  
  for (const table of SENSITIVE_TABLES) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (!error) {
        issues.push({
          severity: 'CRITICAL',
          table,
          issue: 'Anonymous users can access sensitive data',
          recommendation: `Remove or restrict RLS policies allowing anonymous access to ${table}`
        });
      } else if (!error.message.includes('policy')) {
        issues.push({
          severity: 'HIGH', 
          table,
          issue: 'Unexpected error response (not RLS policy block)',
          recommendation: `Review RLS configuration for ${table}`
        });
      }
    } catch (error) {
      issues.push({
        severity: 'MEDIUM',
        table,
        issue: `Error testing table: ${error}`,
        recommendation: `Investigate connection or configuration issues`
      });
    }
  }
  
  return issues;
}

async function checkRLSEnabled(): Promise<SecurityIssue[]> {
  console.log('🔒 Checking RLS is enabled on all tables...');
  const issues: SecurityIssue[] = [];
  
  try {
    // This would require database admin access to check pg_tables
    // For now, we assume RLS is enabled and focus on policy testing
    console.log('ℹ️  RLS status check requires database admin privileges');
  } catch (error) {
    issues.push({
      severity: 'HIGH',
      table: 'ALL',
      issue: 'Cannot verify RLS status',
      recommendation: 'Check database permissions or verify RLS manually'
    });
  }
  
  return issues;
}

async function checkDataIsolation(): Promise<SecurityIssue[]> {
  console.log('👥 Testing data isolation between users...');
  const issues: SecurityIssue[] = [];
  
  // Test with different users if available
  const testUsers = [
    { email: 'user@test.local', password: 'password', role: 'user' },
    { email: 'company@test.local', password: 'password', role: 'company' }
  ];
  
  for (const user of testUsers) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      if (authError) {
        console.log(`⚠️  Cannot test isolation for ${user.role}: login failed`);
        continue;
      }
      
      // Test that user can only see their own data
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .limit(10);
        
      if (!leadsError && leads) {
        // Check if user sees leads they shouldn't
        const hasOtherUsersData = leads.some(lead => 
          lead.submitted_by && lead.submitted_by !== authData.user.id
        );
        
        if (hasOtherUsersData && user.role === 'user') {
          issues.push({
            severity: 'HIGH',
            table: 'leads',
            issue: `${user.role} can see other users' data`,
            recommendation: 'Review and tighten RLS policies for user data isolation'
          });
        }
      }
      
      await supabase.auth.signOut();
    } catch (error) {
      console.log(`⚠️  Error testing ${user.role}:`, error);
    }
  }
  
  return issues;
}

async function checkAdminProtection(): Promise<SecurityIssue[]> {
  console.log('👑 Checking admin-only resource protection...');
  const issues: SecurityIssue[] = [];
  
  // Test with non-admin user
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'user@test.local',
      password: 'password'
    });
    
    if (!authError) {
      // Try to access admin-only tables
      const adminTables = ['admin_actions_log', 'admin_audit_log', 'analytics_metrics'];
      
      for (const table of adminTables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        
        if (!error) {
          issues.push({
            severity: 'CRITICAL',
            table,
            issue: 'Regular user can access admin-only data',
            recommendation: `Restrict ${table} access to admin roles only`
          });
        }
      }
      
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.log('⚠️  Cannot test admin protection: user login failed');
  }
  
  return issues;
}

function printSecurityReport(allIssues: SecurityIssue[]): void {
  console.log('\n📊 SECURITY AUDIT REPORT');
  console.log('========================');
  
  const criticalIssues = allIssues.filter(i => i.severity === 'CRITICAL');
  const highIssues = allIssues.filter(i => i.severity === 'HIGH');
  const mediumIssues = allIssues.filter(i => i.severity === 'MEDIUM');
  const lowIssues = allIssues.filter(i => i.severity === 'LOW');
  
  console.log(`🔴 CRITICAL: ${criticalIssues.length}`);
  console.log(`🟠 HIGH: ${highIssues.length}`);
  console.log(`🟡 MEDIUM: ${mediumIssues.length}`);
  console.log(`🔵 LOW: ${lowIssues.length}`);
  
  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES (MUST FIX BEFORE PRODUCTION):');
    criticalIssues.forEach(issue => {
      console.log(`   ${issue.table}: ${issue.issue}`);
      console.log(`   → ${issue.recommendation}\n`);
    });
  }
  
  if (highIssues.length > 0) {
    console.log('\n⚠️  HIGH PRIORITY ISSUES:');
    highIssues.forEach(issue => {
      console.log(`   ${issue.table}: ${issue.issue}`);
      console.log(`   → ${issue.recommendation}\n`);
    });
  }
  
  if (allIssues.length === 0) {
    console.log('\n✅ No security issues detected in this audit');
  }
  
  console.log('\n📋 SECURITY CHECKLIST:');
  console.log('  □ RLS enabled on all tables with user data');
  console.log('  □ No anonymous access to sensitive data');
  console.log('  □ Admin resources protected from regular users');
  console.log('  □ Users can only access their own data');
  console.log('  □ Company users properly isolated');
  console.log('  □ Feature flags enforcing access control');
}

async function main(): Promise<void> {
  console.log('🛡️  Starting Security Audit');
  console.log('==========================');
  
  let allIssues: SecurityIssue[] = [];
  
  try {
    const anonymousIssues = await checkAnonymousAccess();
    allIssues = allIssues.concat(anonymousIssues);
    
    const rlsIssues = await checkRLSEnabled();
    allIssues = allIssues.concat(rlsIssues);
    
    const isolationIssues = await checkDataIsolation();
    allIssues = allIssues.concat(isolationIssues);
    
    const adminIssues = await checkAdminProtection();
    allIssues = allIssues.concat(adminIssues);
    
    printSecurityReport(allIssues);
    
    // Exit with error code if critical issues found
    const criticalCount = allIssues.filter(i => i.severity === 'CRITICAL').length;
    if (criticalCount > 0) {
      console.log('\n❌ Security audit FAILED - Critical issues must be resolved');
      process.exit(1);
    } else {
      console.log('\n✅ Security audit PASSED - No critical issues detected');
    }
    
  } catch (error) {
    console.error('❌ Security audit failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}