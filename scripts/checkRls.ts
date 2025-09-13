#!/usr/bin/env ts-node

/**
 * RLS Policy Checker
 * Validates Row Level Security implementation
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kkazhcihooovsuwravhs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXpoY2lob29vdnN1d3JhdmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzMwMzUsImV4cCI6MjA2MjEwOTAzNX0.-HzjqXYqgThN0PrbrwZlm5GWK1vOGOeYHEEFrt0OpwM';

interface RLSCheck {
  table: string;
  hasRLS: boolean;
  policies: number;
  issues: string[];
}

async function checkRLS(): Promise<{ passed: boolean; message: string; details: RLSCheck[] }> {
  console.log('🔒 Checking RLS policies...\n');
  
  const issues: string[] = [];
  const checks: RLSCheck[] = [];
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Core tables that must have RLS
    const criticalTables = [
      'user_profiles',
      'company_profiles', 
      'leads',
      'admin_actions_log',
      'error_tracking',
      'performance_metrics',
      'analytics_metrics',
      'admin_audit_log',
      'role_switch_audit',
      'smart_start_submissions',
      'lead_assignments',
      'company_budget_transactions'
    ];
    
    for (const table of criticalTables) {
      const check: RLSCheck = {
        table,
        hasRLS: false,
        policies: 0,
        issues: []
      };
      
      try {
        // Check if RLS is enabled (this would fail on anonymous access if properly configured)
        const { data, error } = await supabase.from(table).select('*').limit(1);
        
        if (error && error.message.includes('row-level security')) {
          check.hasRLS = true;
          check.policies = 1; // Assume at least one policy if RLS blocks access
        } else if (!error) {
          check.issues.push('Table allows anonymous access - RLS may be missing or too permissive');
        }
        
        // Additional checks for specific tables
        if (table === 'admin_actions_log' || table === 'admin_audit_log') {
          if (!check.hasRLS) {
            check.issues.push('CRITICAL: Admin tables must have strict RLS policies');
          }
        }
        
        if (table === 'user_profiles' && !check.hasRLS) {
          check.issues.push('CRITICAL: User profiles must be protected by RLS');
        }
        
      } catch (err) {
        check.issues.push(`Error checking table: ${err instanceof Error ? err.message : String(err)}`);
      }
      
      checks.push(check);
    }
    
    // Analyze results
    const criticalIssues = checks.filter(c => c.issues.some(i => i.includes('CRITICAL')));
    const warningIssues = checks.filter(c => c.issues.length > 0 && !c.issues.some(i => i.includes('CRITICAL')));
    
    if (criticalIssues.length > 0) {
      issues.push(`${criticalIssues.length} CRITICAL RLS issues found`);
      criticalIssues.forEach(c => {
        issues.push(`  - ${c.table}: ${c.issues.join(', ')}`);
      });
    }
    
    if (warningIssues.length > 0) {
      issues.push(`${warningIssues.length} RLS warnings found`);
      warningIssues.forEach(c => {
        issues.push(`  - ${c.table}: ${c.issues.join(', ')}`);
      });
    }
    
    const passed = criticalIssues.length === 0;
    const message = passed 
      ? `✅ RLS checks passed (${checks.filter(c => c.hasRLS).length}/${checks.length} tables properly protected)`
      : `❌ RLS validation failed:\n${issues.join('\n')}`;
    
    return { passed, message, details: checks };
    
  } catch (error) {
    return {
      passed: false,
      message: `❌ Error during RLS check: ${error instanceof Error ? error.message : String(error)}`,
      details: []
    };
  }
}

if (require.main === module) {
  checkRLS().then(result => {
    console.log(result.message);
    if (result.details.length > 0) {
      console.log('\nDetailed Results:');
      result.details.forEach(detail => {
        console.log(`  ${detail.table}: RLS=${detail.hasRLS}, Policies=${detail.policies}`);
        if (detail.issues.length > 0) {
          detail.issues.forEach(issue => console.log(`    ⚠️  ${issue}`));
        }
      });
    }
    process.exit(result.passed ? 0 : 1);
  });
}

export { checkRLS };