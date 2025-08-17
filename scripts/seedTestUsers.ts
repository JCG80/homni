#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://kkazhcihooovsuwravhs.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface TestUser {
  id: string;
  email: string;
  role: string;
  full_name: string;
  company_name?: string;
}

const testUsers: TestUser[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'anonymous@test.no',
    role: 'anonymous',
    full_name: 'Anonymous User'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'user@test.no',
    role: 'user',
    full_name: 'Regular User'
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'company@test.no',
    role: 'company',
    full_name: 'Company User',
    company_name: 'Test Company AS'
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'editor@test.no',
    role: 'content_editor',
    full_name: 'Content Editor'
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'admin@test.no',
    role: 'admin',
    full_name: 'System Admin'
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    email: 'master@test.no',
    role: 'master_admin',
    full_name: 'Master Admin'
  }
];

async function seedTestUsers(): Promise<void> {
  console.log('🌱 Seeding test users...\n');

  for (const user of testUsers) {
    try {
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          user_id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          account_type: user.role === 'company' ? 'business' : 'personal',
          metadata: {},
          notification_preferences: {},
          ui_preferences: {},
          feature_overrides: {}
        });

      if (profileError) {
        console.error(`❌ Failed to create profile for ${user.email}:`, profileError);
        continue;
      }

      // Create user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: user.role
        });

      if (roleError) {
        console.error(`❌ Failed to create role for ${user.email}:`, roleError);
        continue;
      }

      // Create company profile if company user
      if (user.company_name) {
        const { error: companyError } = await supabase
          .from('company_profiles')
          .upsert({
            user_id: user.id,
            name: user.company_name,
            email: user.email,
            contact_name: user.full_name,
            status: 'active',
            subscription_plan: 'pro',
            modules_access: ['leads', 'marketplace'],
            metadata: {}
          });

        if (companyError) {
          console.error(`❌ Failed to create company for ${user.email}:`, companyError);
        } else {
          console.log(`✅ Created company: ${user.company_name}`);
        }
      }

      console.log(`✅ Created user: ${user.email} (${user.role})`);
    } catch (error) {
      console.error(`❌ Error creating user ${user.email}:`, error);
    }
  }

  // Seed test lead packages
  console.log('\n🌱 Seeding test lead packages...\n');

  const testPackages = [
    {
      name: 'Basic Leads',
      description: 'Basic lead package for small companies',
      price_cents: 5000, // 50 NOK
      rules: {
        categories: ['insurance', 'home'],
        regions: ['oslo', 'akershus'],
        max_age_hours: 24
      },
      active: true,
      priority: 100
    },
    {
      name: 'Premium Leads',
      description: 'Premium lead package with higher priority',
      price_cents: 10000, // 100 NOK
      rules: {
        categories: ['insurance', 'home', 'finance'],
        regions: ['all'],
        max_age_hours: 12
      },
      active: true,
      priority: 50
    }
  ];

  for (const pkg of testPackages) {
    const { error } = await supabase
      .from('lead_packages')
      .upsert(pkg);

    if (error) {
      console.error(`❌ Failed to create package ${pkg.name}:`, error);
    } else {
      console.log(`✅ Created package: ${pkg.name}`);
    }
  }

  console.log('\n🎉 Test users and packages seeded successfully!');
}

if (require.main === module) {
  seedTestUsers().catch(console.error);
}