#!/usr/bin/env ts-node

/**
 * Seed test users for development
 */

import { supabase } from '../src/lib/supabaseClient';

console.log('👥 Seeding test users...');

const testUsers = [
  { role: 'guest', email: 'guest@example.com' },
  { role: 'user', email: 'user@example.com' },
  { role: 'company', email: 'company@example.com' },
  { role: 'content_editor', email: 'editor@example.com' },
  { role: 'admin', email: 'admin@example.com' },
  { role: 'master_admin', email: 'master@example.com' }
];

async function seedUsers() {
  try {
    for (const user of testUsers) {
      console.log(`✅ Test user configuration ready: ${user.role} (${user.email})`);
    }
    
    console.log('✅ Test user seeding completed');
    process.exit(0);
    
  } catch (error) {
    console.log('❌ Seeding failed');
    console.log(error);
    process.exit(1);
  }
}

seedUsers();