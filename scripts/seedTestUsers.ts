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
      id: '20000000-0000-0000-0000-000000000001',
      name: 'Basic Package',
      description: 'Basic lead package for testing',
      price_per_lead: 25.00,
      monthly_price: 299.00,
      lead_cap_per_day: 5,
      lead_cap_per_month: 100,
      priority_level: 1,
      is_active: true
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      name: 'Premium Package',
      description: 'Premium lead package for testing',
      price_per_lead: 20.00,
      monthly_price: 599.00,
      lead_cap_per_day: 15,
      lead_cap_per_month: 300,
      priority_level: 2,
      is_active: true
    }
  ];

  for (const pkg of testPackages) {
    const { error } = await supabase
      .from('lead_packages')
      .upsert(pkg, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Failed to create package ${pkg.name}:`, error);
    } else {
      console.log(`✅ Created package: ${pkg.name}`);
    }
  }

  // Create sample buyer account for company user
  const { error: buyerError } = await supabase
    .from('buyer_accounts')
    .upsert({
      id: '30000000-0000-0000-0000-000000000001',
      company_name: 'Test Company AS',
      contact_email: 'company@test.no',
      current_budget: 1000.00,
      daily_budget: 100.00,
      monthly_budget: 2000.00,
      preferred_categories: ['insurance', 'home'],
      geographical_scope: ['oslo', 'akershus']
    }, { onConflict: 'id' });

  if (buyerError) {
    console.error('❌ Failed to create buyer account:', buyerError);
  } else {
    console.log('✅ Created buyer account for Test Company AS');
  }

  console.log('\n🎉 Test users and packages seeded successfully!');
}

if (require.main === module) {
  seedTestUsers().catch(console.error);
}