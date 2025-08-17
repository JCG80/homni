#!/usr/bin/env ts-node

/**
 * Script to seed test users for development and testing
 * Creates users with different roles for comprehensive testing
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://kkazhcihooovsuwravhs.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

interface TestUser {
  email: string;
  password: string;
  role: string;
  display_name: string;
  company_name?: string;
}

const TEST_USERS: TestUser[] = [
  {
    email: 'guest@homni.test',
    password: 'TestPass123!',
    role: 'guest',
    display_name: 'Guest User'
  },
  {
    email: 'user@homni.test', 
    password: 'TestPass123!',
    role: 'user',
    display_name: 'Regular User'
  },
  {
    email: 'company@homni.test',
    password: 'TestPass123!',
    role: 'company',
    display_name: 'Company Representative',
    company_name: 'Test Insurance Company'
  },
  {
    email: 'editor@homni.test',
    password: 'TestPass123!',
    role: 'content_editor',
    display_name: 'Content Editor'
  },
  {
    email: 'admin@homni.test',
    password: 'TestPass123!', 
    role: 'admin',
    display_name: 'System Administrator'
  },
  {
    email: 'master@homni.test',
    password: 'TestPass123!',
    role: 'master_admin',
    display_name: 'Master Administrator'
  }
];

async function seedTestUsers(): Promise<void> {
  console.log('🌱 Seeding test users...\n');
  
  let created = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const testUser of TEST_USERS) {
    try {
      console.log(`Creating user: ${testUser.email} (${testUser.role})`);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: {
          role: testUser.role,
          display_name: testUser.display_name
        }
      });
      
      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`  ⚠️  User already exists, skipping...`);
          skipped++;
          continue;
        } else {
          throw authError;
        }
      }
      
      const userId = authData.user.id;
      
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          user_id: userId,
          display_name: testUser.display_name,
          role: testUser.role,
          email: testUser.email,
          account_type: testUser.role === 'company' ? 'business' : 'personal'
        });
      
      if (profileError) {
        console.error(`  ❌ Failed to create profile: ${profileError.message}`);
        errors++;
        continue;
      }
      
      // Create company profile if needed
      if (testUser.company_name) {
        const { error: companyError } = await supabase
          .from('company_profiles')
          .upsert({
            user_id: userId,
            name: testUser.company_name,
            contact_name: testUser.display_name,
            email: testUser.email,
            industry: 'insurance',
            subscription_plan: 'premium'
          });
        
        if (companyError) {
          console.error(`  ❌ Failed to create company: ${companyError.message}`);
          errors++;
          continue;
        }
      }
      
      // Add user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: testUser.role
        });
      
      if (roleError) {
        console.error(`  ❌ Failed to add role: ${roleError.message}`);
        errors++;
        continue;
      }
      
      console.log(`  ✅ Created successfully`);
      created++;
      
    } catch (error) {
      console.error(`  ❌ Failed to create ${testUser.email}:`, error);
      errors++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  ✅ Created: ${created}`);
  console.log(`  ⚠️  Skipped: ${skipped}`);
  console.log(`  ❌ Errors: ${errors}`);
  
  if (errors > 0) {
    console.log(`\n⚠️  Some users failed to create. Check the logs above.`);
  } else {
    console.log(`\n🎉 All test users created successfully!`);
  }
}

if (require.main === module) {
  seedTestUsers().catch(console.error);
}