#!/usr/bin/env node

/**
 * Check if auth.users and user_profiles are properly synchronized
 * This helps catch issues where users exist in auth but not in profiles or vice versa
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SyncIssue {
  type: 'missing_profile' | 'orphaned_profile' | 'role_mismatch' | 'metadata_inconsistency';
  description: string;
  user_id?: string;
  email?: string;
  details?: any;
}

const checkAuthSync = async (): Promise<SyncIssue[]> => {
  const issues: SyncIssue[] = [];
  
  try {
    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;
    
    // Get all user profiles  
    const { data: userProfiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*');
    if (profileError) throw profileError;
    
    // Create lookup maps
    const authUserMap = new Map(authUsers.users.map(u => [u.id, u]));
    const profileMap = new Map(userProfiles.map(p => [p.user_id || p.id, p]));
    
    // Check for auth users without profiles
    for (const authUser of authUsers.users) {
      if (!profileMap.has(authUser.id)) {
        issues.push({
          type: 'missing_profile',
          description: 'Auth user exists but no corresponding user_profile',
          user_id: authUser.id,
          email: authUser.email,
        });
      }
    }
    
    // Check for profiles without auth users
    for (const profile of userProfiles) {
      const userId = profile.user_id || profile.id;
      if (!authUserMap.has(userId)) {
        issues.push({
          type: 'orphaned_profile',
          description: 'User profile exists but no corresponding auth user',
          user_id: userId,
          details: { profile_id: profile.id, role: profile.role }
        });
      }
    }
    
    // Check for role/metadata inconsistencies
    for (const profile of userProfiles) {
      const userId = profile.user_id || profile.id;
      const authUser = authUserMap.get(userId);
      
      if (authUser && profile.role) {
        const authRole = authUser.raw_user_meta_data?.role;
        const metadataRole = profile.metadata?.role;
        
        // Check if user_id !== id (should always match)
        if (profile.user_id && profile.user_id !== profile.id) {
          issues.push({
            type: 'metadata_inconsistency',
            description: 'user_profiles.user_id does not match user_profiles.id',
            user_id: userId,
            email: authUser.email,
            details: { profile_id: profile.id, user_id: profile.user_id }
          });
        }
        
        // Check role consistency
        if (authRole && profile.role !== authRole && !isCanonicalRole(profile.role, authRole)) {
          issues.push({
            type: 'role_mismatch',
            description: 'Role mismatch between auth metadata and user_profile',
            user_id: userId,
            email: authUser.email,
            details: { 
              auth_role: authRole, 
              profile_role: profile.role,
              metadata_role: metadataRole 
            }
          });
        }
      }
    }
    
  } catch (error) {
    console.error('Error checking auth sync:', error);
    process.exit(1);
  }
  
  return issues;
};

// Check if roles are equivalent (canonical vs legacy)
const isCanonicalRole = (profileRole: string, authRole: string): boolean => {
  const roleMap: Record<string, string> = {
    'anonymous': 'guest',
    'member': 'user', 
    'business': 'company',
    'provider': 'company',
    'editor': 'content_editor',
    'super_admin': 'master_admin'
  };
  
  return roleMap[authRole] === profileRole || roleMap[profileRole] === authRole;
};

const main = async () => {
  console.log('🔍 Checking auth users vs user_profiles synchronization...\n');
  
  const issues = await checkAuthSync();
  
  if (issues.length === 0) {
    console.log('✅ Auth users and user_profiles are properly synchronized!');
    process.exit(0);
  }
  
  console.log(`❌ Found ${issues.length} synchronization issues:\n`);
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.type.toUpperCase()}`);
    console.log(`   Description: ${issue.description}`);
    if (issue.user_id) console.log(`   User ID: ${issue.user_id}`);
    if (issue.email) console.log(`   Email: ${issue.email}`);
    if (issue.details) console.log(`   Details: ${JSON.stringify(issue.details, null, 2)}`);
    console.log();
  });
  
  console.log('💡 To fix these issues:');
  console.log('   - Run the normalization migration from the implementation plan');
  console.log('   - Use the seed-test-users function to create missing test users');
  console.log('   - Check if any manual cleanup is needed\n');
  
  process.exit(1);
};

if (require.main === module) {
  main().catch(console.error);
}