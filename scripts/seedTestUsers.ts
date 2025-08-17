#!/usr/bin/env ts-node

import { supabase } from '../src/integrations/supabase/client';

interface TestUser {
  email: string;
  password: string;
  role: string;
  display_name: string;
  company_name?: string;
}

const TEST_USERS: TestUser[] = [
  {
    email: 'admin@homni.no',
    password: 'admin123',
    role: 'admin',
    display_name: 'System Administrator'
  },
  {
    email: 'master@homni.no', 
    password: 'master123',
    role: 'master_admin',
    display_name: 'Master Administrator'
  },
  {
    email: 'company@homni.no',
    password: 'company123', 
    role: 'company',
    display_name: 'Test Company User',
    company_name: 'Test Company AS'
  },
  {
    email: 'user@homni.no',
    password: 'user123',
    role: 'user', 
    display_name: 'Test User'
  },
  {
    email: 'editor@homni.no',
    password: 'editor123',
    role: 'content_editor',
    display_name: 'Content Editor'
  },
  {
    email: 'guest@homni.no',
    password: 'guest123',
    role: 'anonymous',
    display_name: 'Guest User'
  }
];

async function seedTestUsers() {
  console.log('🌱 Starting test user seeding...');
  
  try {
    for (const user of TEST_USERS) {
      console.log(`Creating user: ${user.email} (${user.role})`);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true
      });
      
      if (authError) {
        console.error(`Failed to create auth user ${user.email}:`, authError);
        continue;
      }
      
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: authData.user.id,
          display_name: user.display_name,
          role: user.role,
          account_type: user.role === 'company' ? 'business' : 'personal'
        });
        
      if (profileError) {
        console.error(`Failed to create profile for ${user.email}:`, profileError);
        continue;
      }
      
      // Create company profile if needed
      if (user.company_name) {
        const { error: companyError } = await supabase
          .from('company_profiles')
          .upsert({
            user_id: authData.user.id,
            company_name: user.company_name,
            industry: 'Technology',
            website: 'https://example.com'
          });
          
        if (companyError) {
          console.error(`Failed to create company for ${user.email}:`, companyError);
        }
      }
      
      console.log(`✅ Successfully created: ${user.email}`);
    }
    
    console.log('🎉 Test user seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding test users:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedTestUsers()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { seedTestUsers, TEST_USERS };