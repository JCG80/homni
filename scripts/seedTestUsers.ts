#!/usr/bin/env ts-node

/**
 * Seed script for creating test users with proper profiles
 * Creates 6 test users covering all roles for development/testing
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const SUPABASE_URL = process.env.SUPABASE_URL || "https://kkazhcihooovsuwravhs.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'anonymous@test.com',
    role: 'anonymous',
    full_name: 'Anonymous User',
    password: 'password123'
  },
  {
    id: '22222222-2222-2222-2222-222222222222', 
    email: 'member@test.com',
    role: 'member',
    full_name: 'Test Member',
    password: 'password123'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'company@test.com',
    role: 'company',
    full_name: 'Test Company User',
    password: 'password123',
    company_id: '44444444-4444-4444-4444-444444444444'
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'editor@test.com',
    role: 'content_editor',
    full_name: 'Content Editor',
    password: 'password123'
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    email: 'admin@test.com',
    role: 'admin',
    full_name: 'Test Admin',
    password: 'password123'
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    email: 'master@test.com',
    role: 'master_admin',
    full_name: 'Master Admin',
    password: 'password123'
  }
];

const testCompany = {
  id: '44444444-4444-4444-4444-444444444444',
  user_id: '33333333-3333-3333-3333-333333333333',
  name: 'Test Company AS',
  email: 'company@test.com',
  phone: '+47 12345678',
  industry: 'Technology',
  contact_name: 'Test Company User'
};

async function seedUsers() {
  console.log('🌱 Starting to seed test users...');

  try {
    // First, create the test company profile
    console.log('Creating test company profile...');
    const { error: companyError } = await supabase
      .from('company_profiles')
      .upsert(testCompany, { onConflict: 'id' });

    if (companyError) {
      console.error('Error creating company profile:', companyError);
    } else {
      console.log('✅ Test company profile created');
    }

    // Create auth users and profiles
    for (const user of testUsers) {
      console.log(`Creating user: ${user.email} (${user.role})`);

      // Create auth user (this will skip if user already exists)
      const { error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: {
          role: user.role,
          full_name: user.full_name
        },
        email_confirm: true // Skip email confirmation for test users
      });

      if (authError && !authError.message.includes('already registered')) {
        console.error(`Error creating auth user ${user.email}:`, authError);
        continue;
      }

      // Create/update user profile with new schema
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          user_id: user.id, // Now required and NOT NULL
          full_name: user.full_name,
          email: user.email,
          role: user.role, // Direct role column
          company_id: user.company_id || null,
          account_type: user.role === 'company' ? 'company' : 'member',
          metadata: {
            role: user.role, // Keep in metadata for backward compatibility
            company_id: user.company_id || null
          },
          notification_preferences: {},
          ui_preferences: {},
          feature_overrides: {}
        }, { onConflict: 'id' });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError);
      } else {
        console.log(`✅ User profile created: ${user.email}`);
      }
    }

    // Insert some sample feature flags
    console.log('Creating sample feature flags...');
    const sampleFlags = [
      {
        name: 'lead_generation_module',
        description: 'Enable lead generation features (Bytt.no style)',
        is_enabled: true,
        rollout_percentage: 100,
        target_roles: ['company', 'admin', 'master_admin']
      },
      {
        name: 'property_management_module', 
        description: 'Enable property documentation features (Boligmappa style)',
        is_enabled: true,
        rollout_percentage: 100,
        target_roles: ['member', 'company', 'admin', 'master_admin']
      },
      {
        name: 'diy_sales_module',
        description: 'Enable DIY sales features (Propr style)',
        is_enabled: false,
        rollout_percentage: 50,
        target_roles: ['member', 'company']
      }
    ];

    for (const flag of sampleFlags) {
      const { error: flagError } = await supabase
        .from('feature_flags')
        .upsert(flag, { onConflict: 'name' });

      if (flagError) {
        console.error('Error creating feature flag:', flagError);
      }
    }

    // Insert sample module metadata
    console.log('Creating sample module metadata...');
    const sampleModules = [
      {
        name: 'lead_generation',
        description: 'Lead generation and comparison engine',
        version: '1.0.0',
        dependencies: ['feature_flags'],
        feature_flags: { required_flag: 'lead_generation_module' },
        active: true
      },
      {
        name: 'property_management',
        description: 'Property documentation and maintenance tracking',
        version: '1.0.0', 
        dependencies: [],
        feature_flags: { required_flag: 'property_management_module' },
        active: true
      },
      {
        name: 'diy_sales',
        description: 'DIY property sales workflow',
        version: '0.5.0',
        dependencies: ['property_management'],
        feature_flags: { required_flag: 'diy_sales_module' },
        active: false
      }
    ];

    for (const module of sampleModules) {
      const { error: moduleError } = await supabase
        .from('module_metadata')
        .upsert(module, { onConflict: 'name' });

      if (moduleError) {
        console.error('Error creating module metadata:', moduleError);
      }
    }

    console.log('🎉 All test users and data seeded successfully!');
    console.log('\nTest users created:');
    testUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - password: ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedUsers()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { seedUsers };