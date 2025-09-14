/**
 * Seed Test Users Script - Creates fictional test data
 * Part of Homni platform development plan
 */

import { supabase } from '../src/lib/supabaseClient';
import { UserRole } from '../src/modules/auth/utils/normalizeRole';

interface TestUser {
  email: string;
  password: string;
  role: UserRole;
  account_type: 'privatperson' | 'bedrift';
  profile_data: any;
  company_data?: any;
}

export interface CreateUserResult {
  success: boolean;
  user_id?: string;
  profile_id?: string;
  company_id?: string;
  error?: string;
}

export interface RlsValidationResult {
  success: boolean;
  policies_tested: number;
  failed_policies: number;
  errors: string[];
}

const TEST_USERS: TestUser[] = [
  {
    email: 'anonymous@test.homni.no',
    password: 'TestUser123!',
    role: 'anonymous',
    account_type: 'privatperson',
    profile_data: {
      display_name: 'Anonym Bruker',
      notification_preferences: {
        email: false,
        sms: false,
        push: false,
        marketing: false,
        system: true
      },
      ui_preferences: {
        theme: 'system',
        language: 'no',
        dashboard_layout: 'minimal',
        preferred_modules: [],
        quick_actions: ['search', 'browse']
      },
      feature_overrides: {}
    }
  },
  {
    email: 'user@test.homni.no',
    password: 'TestUser123!',
    role: 'user',
    account_type: 'privatperson',
    profile_data: {
      display_name: 'Ola Nordmann',
      notification_preferences: {
        email: true,
        sms: true,
        push: true,
        marketing: false,
        system: true
      },
      ui_preferences: {
        theme: 'light',
        language: 'no',
        dashboard_layout: 'standard',
        preferred_modules: ['leads', 'properties', 'documents'],
        quick_actions: ['new-request', 'my-properties', 'messages']
      },
      feature_overrides: {
        'advanced_search': true,
        'document_management': true
      }
    }
  },
  {
    email: 'company@test.homni.no',
    password: 'TestCompany123!',
    role: 'company',
    account_type: 'bedrift',
    profile_data: {
      display_name: 'Norsk Håndverk AS',
      notification_preferences: {
        email: true,
        sms: true,
        push: true,
        marketing: true,
        system: true
      },
      ui_preferences: {
        theme: 'light',
        language: 'no',
        dashboard_layout: 'professional',
        preferred_modules: ['leads', 'analytics', 'team', 'billing'],
        quick_actions: ['new-lead', 'team-dashboard', 'analytics', 'billing']
      },
      feature_overrides: {
        'lead_distribution': true,
        'advanced_analytics': true,
        'team_management': true
      }
    },
    company_data: {
      company_name: 'Norsk Håndverk AS',
      org_number: '123456789',
      industry: 'construction',
      size: 'medium',
      subscription_tier: 'premium'
    }
  }
];

export async function createUser(userData: TestUser): Promise<CreateUserResult> {
  try {
    console.log(`👤 Creating test user: ${userData.email}`);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: undefined // Skip email confirmation in development
      }
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'No user data returned from auth signup' };
    }

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        display_name: userData.profile_data.display_name,
        role: userData.role,
        account_type: userData.account_type,
        notification_preferences: userData.profile_data.notification_preferences,
        ui_preferences: userData.profile_data.ui_preferences,
        feature_overrides: userData.profile_data.feature_overrides,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    let companyId: string | undefined;

    // Create company profile if business account
    if (userData.account_type === 'bedrift' && userData.company_data) {
      const { data: companyData, error: companyError } = await supabase
        .from('company_profiles')
        .insert({
          user_id: authData.user.id,
          name: userData.company_data.company_name,
          org_number: userData.company_data.org_number,
          industry: userData.company_data.industry,
          size: userData.company_data.size,
          subscription_tier: userData.company_data.subscription_tier,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (companyError) {
        console.warn(`⚠️ Company profile creation failed for ${userData.email}:`, companyError.message);
      } else {
        companyId = companyData.id;
      }
    }

    console.log(`✅ Test user created: ${userData.email}`);
    
    return {
      success: true,
      user_id: authData.user.id,
      profile_id: profileData.id,
      company_id: companyId
    };

  } catch (error: any) {
    console.error(`❌ Failed to create test user ${userData.email}:`, error);
    return { success: false, error: error.message };
  }
}

export async function validateRlsPolicies(userId: string, role: UserRole): Promise<RlsValidationResult> {
  const result: RlsValidationResult = {
    success: true,
    policies_tested: 0,
    failed_policies: 0,
    errors: []
  };

  const testCases = [
    {
      name: 'user_profiles_select',
      test: () => supabase.from('user_profiles').select('id').eq('user_id', userId).limit(1)
    },
    {
      name: 'user_profiles_update',
      test: () => supabase.from('user_profiles').update({ updated_at: new Date().toISOString() }).eq('user_id', userId)
    }
  ];

  // Add role-specific test cases
  if (role === 'company' || role === 'admin') {
    testCases.push({
      name: 'company_profiles_access',
      test: () => supabase.from('company_profiles').select('id').limit(1)
    });
  }

  if (role === 'admin' || role === 'master_admin') {
    testCases.push({
      name: 'admin_user_access',
      test: () => supabase.from('user_profiles').select('id').limit(5)
    });
  }

  for (const testCase of testCases) {
    try {
      result.policies_tested++;
      const { error } = await testCase.test();
      
      if (error) {
        result.failed_policies++;
        result.errors.push(`${testCase.name}: ${error.message}`);
        result.success = false;
      }
    } catch (error: any) {
      result.failed_policies++;
      result.errors.push(`${testCase.name}: ${error.message}`);
      result.success = false;
    }
  }

  return result;
}

export function getExpectedModulesForRole(role: UserRole): string[] {
  const moduleMap: Record<UserRole, string[]> = {
    anonymous: [],
    user: ['leads', 'properties', 'documents', 'profile'],
    company: ['leads', 'analytics', 'team', 'billing', 'properties', 'profile'],
    content_editor: ['content', 'media', 'pages', 'profile'],
    admin: ['admin', 'users', 'system', 'analytics', 'content', 'properties', 'profile'],
    master_admin: ['admin', 'users', 'system', 'analytics', 'content', 'properties', 'profile', 'billing', 'team']
  };

  return moduleMap[role] || [];
}

export async function seedTestUsers() {
  try {
    console.log('🌱 Starting test user seeding...');

    const results: CreateUserResult[] = [];

    // Create test users
    for (const testUser of TEST_USERS) {
      const result = await createUser(testUser);
      results.push(result);
      
      if (result.success && result.user_id) {
        // Validate RLS policies for this user
        const rlsResult = await validateRlsPolicies(result.user_id, testUser.role);
        if (!rlsResult.success) {
          console.warn(`⚠️ RLS validation failed for ${testUser.email}:`, rlsResult.errors);
        }
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ Test user seeding completed: ${successful} successful, ${failed} failed`);
    
    if (failed > 0) {
      const errors = results.filter(r => !r.success).map(r => r.error);
      console.error('❌ Seeding errors:', errors);
    }

  } catch (error) {
    console.error('❌ Test user seeding failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}