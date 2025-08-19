#!/usr/bin/env ts-node

/**
 * Seed script for creating test users in development
 * Run with: npm run seed:users
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TestUser {
  email: string;
  password: string;
  role: string;
  display_name: string;
  company_name?: string;
}

const testUsers: TestUser[] = [
  {
    email: 'guest@test.no',
    password: 'testpassword123',
    role: 'guest',
    display_name: 'Guest User'
  },
  {
    email: 'user@test.no',
    password: 'testpassword123',
    role: 'user',
    display_name: 'Test Bruker'
  },
  {
    email: 'company@test.no',
    password: 'testpassword123',
    role: 'company',
    display_name: 'Bedrift Bruker',
    company_name: 'Test Eiendom AS'
  },
  {
    email: 'editor@test.no',
    password: 'testpassword123',
    role: 'content_editor',
    display_name: 'Innhold Editor'
  },
  {
    email: 'admin@test.no',
    password: 'testpassword123',
    role: 'admin',
    display_name: 'System Administrator'
  },
  {
    email: 'master@test.no',
    password: 'testpassword123',
    role: 'master_admin',
    display_name: 'Master Administrator'
  }
];

async function createTestUser(user: TestUser) {
  try {
    console.log(`Creating user: ${user.email} (${user.role})`);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true
    });

    if (authError) {
      console.error(`Auth error for ${user.email}:`, authError.message);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      console.error(`No user ID returned for ${user.email}`);
      return;
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        display_name: user.display_name,
        role: user.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error(`Profile error for ${user.email}:`, profileError.message);
      return;
    }

    // Create company profile if needed
    if (user.role === 'company' && user.company_name) {
      const { error: companyError } = await supabase
        .from('company_profiles')
        .upsert({
          user_id: userId,
          company_name: user.company_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (companyError) {
        console.error(`Company error for ${user.email}:`, companyError.message);
        return;
      }
    }

    console.log(`✅ Successfully created user: ${user.email}`);

  } catch (error) {
    console.error(`Unexpected error creating ${user.email}:`, error);
  }
}

async function seedTestUsers() {
  console.log('🌱 Seeding test users...');
  
  for (const user of testUsers) {
    await createTestUser(user);
  }

  console.log('\n🎉 Test user seeding completed!');
  console.log('\nTest accounts created:');
  testUsers.forEach(user => {
    console.log(`  ${user.role}: ${user.email} / ${user.password}`);
  });
}

// Run the seed function
seedTestUsers().catch(console.error);