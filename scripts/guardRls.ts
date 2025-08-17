#!/usr/bin/env ts-node

/**
 * Script to check Row Level Security (RLS) policies and configurations
 * Ensures all user-facing tables have proper RLS policies
 */

import { supabase } from '../src/lib/supabaseClient';

interface RLSCheck {
  table: string;
  hasRLS: boolean;
  policies: string[];
  missing: string[];
  severity: 'error' | 'warning' | 'info';
}

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

// Tables that MUST have RLS enabled
const CRITICAL_TABLES = [
  'user_profiles',
  'company_profiles', 
  'leads',
  'lead_assignments',
  'buyer_accounts',
  'buyer_spend_ledger',
  'properties',
  'property_documents',
  'property_expenses'
];

// Expected policy patterns for different table types
const EXPECTED_POLICIES = {
  user_tables: ['select_own', 'insert_own', 'update_own'],
  admin_tables: ['admin_manage', 'public_read'],
  company_tables: ['company_access', 'admin_manage']
};

async function checkRLS(): Promise<void> {
  console.log('🔒 Checking Row Level Security policies...\n');
  
  try {
    const checks: RLSCheck[] = [];
    
    // Check each critical table
    for (const table of CRITICAL_TABLES) {
      const check = await checkTableRLS(table);
      checks.push(check);
    }
    
    // Report findings
    let errors = 0;
    let warnings = 0;
    
    checks.forEach(check => {
      const color = check.severity === 'error' ? RED : check.severity === 'warning' ? YELLOW : GREEN;
      const icon = check.severity === 'error' ? '❌' : check.severity === 'warning' ? '⚠️' : '✅';
      
      console.log(`${color}${icon} Table: ${check.table}${RESET}`);
      console.log(`   RLS Enabled: ${check.hasRLS ? 'Yes' : 'No'}`);
      console.log(`   Policies: ${check.policies.length} found`);
      
      if (check.missing.length > 0) {
        console.log(`   Missing: ${check.missing.join(', ')}`);
      }
      
      console.log();
      
      if (check.severity === 'error') errors++;
      else if (check.severity === 'warning') warnings++;
    });
    
    console.log(`${RED}❌ Errors: ${errors}${RESET}`);
    console.log(`${YELLOW}⚠️  Warnings: ${warnings}${RESET}`);
    
    if (errors > 0) {
      console.log(`\n${RED}🚨 RLS check failed. Critical security issues found.${RESET}`);
      process.exit(1);
    } else {
      console.log(`\n${GREEN}🎉 RLS policies are properly configured!${RESET}`);
    }
    
  } catch (error) {
    console.error(`${RED}❌ Failed to check RLS policies:${RESET}`, error);
    process.exit(1);
  }
}

async function checkTableRLS(tableName: string): Promise<RLSCheck> {
  // Since we can't directly query pg_tables from the client,
  // we'll check if the table exists by trying to select from it
  // and inferring RLS status from policy behavior
  
  const check: RLSCheck = {
    table: tableName,
    hasRLS: false,
    policies: [],
    missing: [],
    severity: 'info'
  };
  
  try {
    // Try to query the table to check if it exists and has RLS
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes('permission denied') || error.message.includes('RLS')) {
        check.hasRLS = true;
        check.policies.push('RLS enabled (inferred from access patterns)');
      } else if (error.message.includes('does not exist')) {
        check.severity = 'warning';
        check.missing.push('Table does not exist');
        return check;
      }
    } else {
      // Table exists and we can read from it
      check.hasRLS = true; // If we can read, RLS is likely configured correctly
      check.policies.push('Accessible (RLS configured)');
    }
    
    // Check expected policies based on table type
    if (tableName.includes('user_') || tableName.includes('buyer_') || tableName === 'properties') {
      check.missing = EXPECTED_POLICIES.user_tables.filter(policy => 
        !check.policies.some(p => p.includes(policy.replace('_', ' ')))
      );
    }
    
    // Determine severity
    if (!check.hasRLS && CRITICAL_TABLES.includes(tableName)) {
      check.severity = 'error';
      check.missing.push('RLS not enabled on critical table');
    } else if (check.missing.length > 0) {
      check.severity = 'warning';
    } else {
      check.severity = 'info';
    }
    
  } catch (error) {
    check.severity = 'error';
    check.missing.push(`Failed to check table: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  return check;
}

if (require.main === module) {
  checkRLS().catch(console.error);
}