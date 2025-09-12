#!/usr/bin/env ts-node

/**
 * Seed Test Users for HOMNI Platform  
 * Creates comprehensive fictional test users for all roles to support full testing
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kkazhcihooovsuwravhs.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXpoY2lob29vdnN1d3JhdmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzMwMzUsImV4cCI6MjA2MjEwOTAzNX0.-HzjqXYqgThN0PrbrwZlm5GWK1vOGOeYHEEFrt0OpwM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface TestUser {
  id: string;
  email: string;
  display_name: string;
  full_name: string;
  role: string;
  company_id?: string;
  metadata: Record<string, any>;
}

const TEST_USERS: TestUser[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'guest@homni.test',
    display_name: 'Guest User',
    full_name: 'Guest Test User',
    role: 'guest',
    metadata: { test_user: true, role: 'guest' }
  },
  {
    id: '00000000-0000-0000-0000-000000000002', 
    email: 'user@homni.test',
    display_name: 'Regular User',
    full_name: 'Regular Test User',
    role: 'user',
    metadata: { test_user: true, role: 'user' }
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'company@homni.test',
    display_name: 'Company User', 
    full_name: 'Company Test User',
    role: 'company',
    company_id: '00000000-0000-0000-0000-000000000010',
    metadata: { test_user: true, role: 'company' }
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'editor@homni.test',
    display_name: 'Content Editor',
    full_name: 'Content Editor User',
    role: 'content_editor', 
    metadata: { test_user: true, role: 'content_editor' }
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'admin@homni.test',
    display_name: 'Admin User',
    full_name: 'Admin Test User',
    role: 'admin',
    metadata: { test_user: true, role: 'admin' }
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    email: 'master@homni.test',
    display_name: 'Master Admin',
    full_name: 'Master Admin User',
    role: 'master_admin',
    metadata: { test_user: true, role: 'master_admin', internal_admin: true }
  }
];

const TEST_COMPANY = {
  id: '00000000-0000-0000-0000-000000000010',
  name: 'Test Company AS',
  user_id: '00000000-0000-0000-0000-000000000003',
  contact_name: 'Company Test User',
  email: 'contact@testcompany.no',
  phone: '+47 12 34 56 78',
  industry: 'construction',
  status: 'active',
  tags: ['elektriker', 'rørlegger', 'bygg'],
  current_budget: 5000.00,
  daily_budget: 500.00,
  monthly_budget: 15000.00,
  auto_accept_leads: true,
  subscription_plan: 'premium',
  modules_access: ['maintenance', 'leads', 'documents'],
  metadata: { test_company: true }
};

const TEST_MAINTENANCE_TASKS = [
  {
    title: 'Rense takrenner',
    description: 'Årlig rensing av takrenner og nedløp for å unngå tetting og vannskader.',
    priority: 'medium',
    frequency_months: 12,
    seasons: ['autumn'],
    property_types: ['house', 'cabin'],
    estimated_time: '02:00:00',
    cost_estimate: 1500.00,
    version: '1.0.0'
  },
  {
    title: 'Sjekk røykvarslere',
    description: 'Test alle røykvarslere og skift batterier ved behov.',
    priority: 'high', 
    frequency_months: 6,
    seasons: ['spring', 'autumn'],
    property_types: ['apartment', 'house', 'cabin'],
    estimated_time: '00:30:00',
    cost_estimate: 200.00,
    version: '1.0.0'
  },
  {
    title: 'Vedlikehold varmepumpe',
    description: 'Rengjør filter og sjekk funksjon på varmepumpe.',
    priority: 'medium',
    frequency_months: 6,
    seasons: ['spring', 'autumn'],
    property_types: ['house', 'apartment'],
    estimated_time: '01:00:00',
    cost_estimate: 800.00,
    version: '1.0.0'
  },
  {
    title: 'Kontroller elektriske installasjoner',
    description: 'Årlig kontroll av hovedtavle, sikringer og synlige installasjoner.',
    priority: 'high',
    frequency_months: 12,
    seasons: ['spring'],
    property_types: ['house', 'apartment', 'commercial'],
    estimated_time: '01:30:00',
    cost_estimate: 2500.00,
    version: '1.0.0'
  }
];

async function seedTestUsers() {
  console.log('🌱 Seeding comprehensive test data for HOMNI platform...\n');
  
  try {
    // 1. Seed test company first
    const { error: companyError } = await supabase
      .from('company_profiles')
      .upsert([TEST_COMPANY], { onConflict: 'id' });
    
    if (companyError) {
      console.warn('⚠️  Company upsert warning:', companyError.message);
    } else {
      console.log('✅ Test company seeded');
    }
    
    // 2. Seed user profiles  
    for (const user of TEST_USERS) {
      const { error } = await supabase
        .from('user_profiles')
        .upsert([{
          id: user.id,
          user_id: user.id,
          display_name: user.display_name,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          role_enum: user.role,
          company_id: user.company_id || null,
          metadata: user.metadata,
          notification_preferences: {},
          ui_preferences: {},
          feature_overrides: {}
        }], { onConflict: 'id' });
      
      if (error) {
        console.warn(`⚠️  User ${user.email} upsert warning:`, error.message);
      } else {
        console.log(`✅ Seeded user: ${user.email} [${user.role}]`);
      }
    }
    
    // 3. Seed maintenance tasks
    const { error: tasksError } = await supabase
      .from('maintenance_tasks')
      .upsert(TEST_MAINTENANCE_TASKS, { onConflict: 'title' });
    
    if (tasksError) {
      console.warn('⚠️  Maintenance tasks warning:', tasksError.message);
    } else {
      console.log('✅ Seeded maintenance tasks'); 
    }
    
    // 4. Seed some test properties for the regular user
    const testProperties = [
      {
        id: '00000000-0000-0000-0000-000000000020',
        user_id: '00000000-0000-0000-0000-000000000002',
        name: 'Hovedbolig',
        type: 'house',
        address: 'Testveien 123, 0123 Oslo',
        size: 150.0,
        purchase_date: '2020-06-15',
        current_value: 4500000.00,
        status: 'owned'
      },
      {
        id: '00000000-0000-0000-0000-000000000021',
        user_id: '00000000-0000-0000-0000-000000000002',
        name: 'Sommerhytte',
        type: 'cabin',
        address: 'Hytteveien 45, 1234 Lillehammer',
        size: 80.0,
        purchase_date: '2018-03-20',
        current_value: 1800000.00,
        status: 'owned'
      }
    ];
    
    const { error: propertiesError } = await supabase
      .from('properties')
      .upsert(testProperties, { onConflict: 'id' });
    
    if (propertiesError) {
      console.warn('⚠️  Properties warning:', propertiesError.message);
    } else {
      console.log('✅ Seeded test properties');
    }
    
    console.log('\n🎉 Comprehensive test data seeding completed successfully!');
    console.log('\nTest Users Created:');
    TEST_USERS.forEach(user => {
      console.log(`  ${user.email} (${user.role})`);
    });
    console.log(`\nTest Company: ${TEST_COMPANY.name}`);
    console.log(`Maintenance Tasks: ${TEST_MAINTENANCE_TASKS.length} tasks`);
    console.log(`Properties: ${testProperties.length} properties`);
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedTestUsers();
}

export default seedTestUsers;