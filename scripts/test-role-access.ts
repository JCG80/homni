#!/usr/bin/env tsx

/**
 * Multi-Role Access Testing Script
 * Tests authentication and access control for different user roles
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kkazhcihooovsuwravhs.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXpoY2lob29vdnN1d3JhdmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzMwMzUsImV4cCI6MjA2MjEwOTAzNX0.-HzjqXYqgThN0PrbrwZlm5GWK1vOGOeYHEEFrt0OpwM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TestUser {
  email: string;
  password: string;
  role: string;
  expectedAccess: string[];
  forbiddenAccess: string[];
}

const TEST_USERS: TestUser[] = [
  {
    email: 'user@test.local',
    password: 'password',
    role: 'user',
    expectedAccess: ['leads (own)', 'user_profiles (own)'],
    forbiddenAccess: ['admin_actions_log', 'admin_audit_log', 'analytics_metrics']
  },
  {
    email: 'company@test.local', 
    password: 'password',
    role: 'company',
    expectedAccess: ['leads (company)', 'user_profiles (own)', 'smart_start_submissions (lead_created)'],
    forbiddenAccess: ['admin_actions_log', 'admin_audit_log']
  },
  {
    email: 'admin@test.local',
    password: 'password', 
    role: 'admin',
    expectedAccess: ['admin_actions_log', 'analytics_events', 'analytics_metrics', 'leads (all)'],
    forbiddenAccess: ['admin_audit_log'] // Only master_admin can access
  },
  {
    email: 'master_admin@test.local',
    password: 'password',
    role: 'master_admin', 
    expectedAccess: ['admin_actions_log', 'admin_audit_log', 'analytics_events', 'analytics_metrics', 'leads (all)'],
    forbiddenAccess: []
  }
];

async function testUserAccess(testUser: TestUser): Promise<void> {
  console.log(`\n🧪 Testing access for ${testUser.role} (${testUser.email})`);
  
  try {
    // Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });

    if (authError) {
      console.error(`❌ Login failed for ${testUser.role}: ${authError.message}`);
      return;
    }

    console.log(`✅ Login successful for ${testUser.role}`);

    // Test expected access
    console.log(`  📋 Testing expected access...`);
    
    // Test admin_actions_log access
    if (testUser.expectedAccess.includes('admin_actions_log')) {
      const { data, error } = await supabase.from('admin_actions_log').select('*').limit(1);
      if (error) {
        console.error(`❌ Expected access to admin_actions_log failed: ${error.message}`);
      } else {
        console.log(`✅ Can access admin_actions_log`);
      }
    }

    // Test admin_audit_log access  
    if (testUser.expectedAccess.includes('admin_audit_log')) {
      const { data, error } = await supabase.from('admin_audit_log').select('*').limit(1);
      if (error) {
        console.error(`❌ Expected access to admin_audit_log failed: ${error.message}`);
      } else {
        console.log(`✅ Can access admin_audit_log`);
      }
    }

    // Test analytics access
    if (testUser.expectedAccess.includes('analytics_events')) {
      const { data, error } = await supabase.from('analytics_events').select('*').limit(1);
      if (error) {
        console.error(`❌ Expected access to analytics_events failed: ${error.message}`);
      } else {
        console.log(`✅ Can access analytics_events`);
      }
    }

    // Test forbidden access
    console.log(`  🚫 Testing forbidden access...`);
    
    for (const forbiddenTable of testUser.forbiddenAccess) {
      const tableName = forbiddenTable.split(' ')[0]; // Remove parenthetical notes
      const { data, error } = await supabase.from(tableName).select('*').limit(1);
      
      if (error && error.message.includes('policy')) {
        console.log(`✅ Correctly blocked from ${tableName}`);
      } else if (!error) {
        console.error(`❌ SECURITY ISSUE: ${testUser.role} can access forbidden table ${tableName}`);
      }
    }

    // Logout
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error(`❌ Test failed for ${testUser.role}:`, error);
  }
}

async function testAnonymousAccess(): Promise<void> {
  console.log(`\n🔓 Testing anonymous access (should be very limited)`);
  
  // Ensure no user is logged in
  await supabase.auth.signOut();
  
  const sensitiveTablesThatShouldBeBlocked = [
    'admin_actions_log',
    'admin_audit_log', 
    'analytics_events',
    'analytics_metrics',
    'user_profiles'
  ];

  for (const table of sensitiveTablesThatShouldBeBlocked) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    
    if (error && error.message.includes('policy')) {
      console.log(`✅ Anonymous correctly blocked from ${table}`);
    } else if (!error) {
      console.error(`❌ CRITICAL SECURITY ISSUE: Anonymous users can access ${table}`);
    }
  }
}

async function main(): Promise<void> {
  console.log('🚀 Starting Multi-Role Access Testing');
  console.log('=====================================');

  // Test anonymous access first
  await testAnonymousAccess();

  // Test each role
  for (const testUser of TEST_USERS) {
    await testUserAccess(testUser);
  }

  console.log('\n✅ Multi-role access testing completed');
  console.log('=====================================');
}

if (require.main === module) {
  main().catch(console.error);
}