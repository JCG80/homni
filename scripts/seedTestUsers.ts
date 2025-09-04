#!/usr/bin/env ts-node

/**
 * Seed Test Users for Development
 * Creates fictional users with different roles for testing
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kkazhcihooovsuwravhs.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const TEST_USERS = [
  {
    email: 'guest@homni.test',
    role: 'guest',
    display_name: 'Guest User',
    metadata: { test_user: true }
  },
  {
    email: 'user@homni.test', 
    role: 'user',
    display_name: 'Regular User',
    metadata: { test_user: true }
  },
  {
    email: 'company@homni.test',
    role: 'company', 
    display_name: 'Company User',
    company_name: 'Test Company AS',
    metadata: { test_user: true }
  },
  {
    email: 'editor@homni.test',
    role: 'content_editor',
    display_name: 'Content Editor', 
    metadata: { test_user: true }
  },
  {
    email: 'admin@homni.test',
    role: 'admin',
    display_name: 'Admin User',
    metadata: { test_user: true }
  },
  {
    email: 'master@homni.test',
    role: 'master_admin',
    display_name: 'Master Admin',
    metadata: { test_user: true }
  }
];

async function seedTestUsers() {
  console.log('🌱 Seeding test users...\n');
  
  try {
    for (const user of TEST_USERS) {
      // Check if user already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('display_name', user.display_name)
        .single();
      
      if (existingProfile) {
        console.log(`⏭️  User ${user.display_name} already exists`);
        continue;
      }
      
      // Create user profile (simplified for testing)
      const userId = `test-${user.role}-${Date.now()}`;
      
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          user_id: userId,
          display_name: user.display_name,
          role: user.role,
          metadata: user.metadata,
          notification_preferences: {},
          ui_preferences: {},
          feature_overrides: {}
        });
      
      if (profileError) {
        console.error(`❌ Failed to create profile for ${user.display_name}:`, profileError);
        continue;
      }
      
      // Create company profile if company user
      if (user.role === 'company' && 'company_name' in user) {
        const { error: companyError } = await supabase
          .from('company_profiles')
          .insert({
            user_id: userId,
            name: user.company_name,
            status: 'active',
            subscription_plan: 'free',
            modules_access: ['leads'],
            metadata: user.metadata,
            notification_preferences: {},
            ui_preferences: {},
            feature_overrides: {}
          });
        
        if (companyError) {
          console.warn(`⚠️  Failed to create company profile for ${user.display_name}:`, companyError);
        }
      }
      
      console.log(`✅ Created test user: ${user.display_name} (${user.role})`);
    }
    
    console.log('\n🎉 Test user seeding completed');
    
  } catch (error) {
    console.error('❌ Error seeding test users:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedTestUsers();
}

export default seedTestUsers;