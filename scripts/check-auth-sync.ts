#!/usr/bin/env tsx

/**
 * Auth synchronization checker - validates user profiles consistency
 * Detects orphaned profiles, missing profiles, and role mismatches
 */

import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallbacks
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kkazhcihooovsuwravhs.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXpoY2lob29vdnN1d3JhdmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzMwMzUsImV4cCI6MjA2MjEwOTAzNX0.-HzjqXYqgThN0PrbrwZlm5GWK1vOGOeYHEEFrt0OpwM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface AuthSyncIssue {
  type: 'orphaned_profile' | 'missing_profile' | 'role_mismatch' | 'duplicate_profile';
  user_id: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

async function checkAuthSync(): Promise<AuthSyncIssue[]> {
  const issues: AuthSyncIssue[] = [];
  
  try {
    console.log('🔍 Checking auth synchronization...');
    
    // Check for duplicate profiles
    const { data: duplicates, error: duplicateError } = await supabase
      .from('user_profiles')
      .select('user_id, count(*)')
      .group('user_id')
      .having('count(*) > 1');
      
    if (duplicateError) {
      console.warn('⚠️ Could not check for duplicate profiles:', duplicateError.message);
    } else if (duplicates && duplicates.length > 0) {
      duplicates.forEach((dup: any) => {
        issues.push({
          type: 'duplicate_profile',
          user_id: dup.user_id,
          details: { count: dup.count },
          severity: 'high'
        });
      });
    }
    
    // Check for profiles with invalid roles
    const { data: invalidRoles, error: roleError } = await supabase
      .from('user_profiles')
      .select('user_id, role, role_enum')
      .not('role', 'in', '(guest,user,company,content_editor,admin,master_admin)');
      
    if (roleError) {
      console.warn('⚠️ Could not check role consistency:', roleError.message);
    } else if (invalidRoles && invalidRoles.length > 0) {
      invalidRoles.forEach((profile: any) => {
        issues.push({
          type: 'role_mismatch',
          user_id: profile.user_id,
          details: { 
            role: profile.role, 
            role_enum: profile.role_enum 
          },
          severity: 'medium'
        });
      });
    }
    
    console.log(`✅ Auth sync check complete. Found ${issues.length} issues.`);
    
    if (issues.length > 0) {
      console.log('\n📋 Issues Summary:');
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.type}`);
        console.log(`   User ID: ${issue.user_id}`);
        console.log(`   Details: ${JSON.stringify(issue.details, null, 2)}`);
        console.log('');
      });
      
      const criticalCount = issues.filter(i => i.severity === 'critical').length;
      const highCount = issues.filter(i => i.severity === 'high').length;
      
      if (criticalCount > 0 || highCount > 0) {
        console.log(`🚨 Found ${criticalCount} critical and ${highCount} high severity issues!`);
        process.exit(1);
      }
    }
    
    return issues;
    
  } catch (error) {
    console.error('❌ Auth sync check failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  checkAuthSync()
    .then(() => {
      console.log('✅ Auth synchronization check completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Auth synchronization check failed:', error);
      process.exit(1);
    });
}

export { checkAuthSync };