/**
 * Seed Test Users Script - Creates fictional test data
 * Part of Homni platform development plan
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for seeding
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TestUser {
  email: string;
  password: string;
  role: 'anonymous' | 'user' | 'company' | 'content_editor' | 'admin' | 'master_admin';
  account_type: 'privatperson' | 'bedrift';
  profile_data: any;
  company_data?: any;
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

export async function seedTestUsers() {
  try {
    console.log('🌱 Starting test user seeding...');

    // Create test users
    for (const testUser of TEST_USERS) {
      await createTestUser(testUser);
    }

    console.log('✅ Test user seeding completed successfully!');
  } catch (error) {
    console.error('❌ Test user seeding failed:', error);
    throw error;
  }
}

async function createTestUser(testUser: TestUser) {
  try {
    console.log(`👤 Creating test user: ${testUser.email}`);

    // For now, just log the user creation
    // In a real implementation, this would create actual users
    console.log(`User data:`, {
      email: testUser.email,
      role: testUser.role,
      account_type: testUser.account_type,
      display_name: testUser.profile_data.display_name
    });

    console.log(`✅ Test user logged: ${testUser.email}`);
  } catch (error) {
    console.error(`❌ Failed to create test user ${testUser.email}:`, error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedTestUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}