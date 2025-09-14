#!/usr/bin/env tsx
/**
 * Advanced database seeding with realistic test data
 * Usage: npm run seed:advanced [--reset] [--users=10] [--companies=5]
 */

import { supabase } from '../src/lib/supabaseClient';
import { faker } from '@faker-js/faker';
import { logger } from '../src/utils/logger';

interface SeedOptions {
  reset: boolean;
  userCount: number;
  companyCount: number;
  verbose: boolean;
}

interface TestUser {
  email: string;
  password: string;
  profile: {
    display_name: string;
    role: string;
    account_type: 'personal' | 'business';
    company_id?: string;
  };
}

interface TestCompany {
  name: string;
  org_number: string;
  contact_email: string;
  phone?: string;
  address?: string;
}

class AdvancedSeeder {
  private options: SeedOptions;

  constructor(options: SeedOptions) {
    this.options = options;
  }

  async resetDatabase() {
    if (!this.options.reset) return;

    console.log('🗑️ Resetting existing test data...');
    
    try {
      // Delete in correct order (respecting foreign keys)
      await supabase.from('user_profiles').delete().ilike('display_name', '%test%');
      await supabase.from('company_profiles').delete().ilike('name', '%Test%');
      
      console.log('✅ Test data reset complete');
    } catch (error) {
      console.error('❌ Error resetting data:', error);
      throw error;
    }
  }

  generateTestCompanies(): TestCompany[] {
    const companies: TestCompany[] = [];
    
    for (let i = 0; i < this.options.companyCount; i++) {
      const company: TestCompany = {
        name: `${faker.company.name()} Test AS`,
        org_number: faker.string.numeric({ length: 9 }),
        contact_email: faker.internet.email(),
        phone: faker.phone.number(),
        address: `${faker.location.streetAddress()}, ${faker.location.city()}`
      };
      
      companies.push(company);
    }
    
    return companies;
  }

  generateTestUsers(companyIds: string[] = []): TestUser[] {
    const users: TestUser[] = [];
    const roles = ['user', 'admin', 'content_editor'];
    const accountTypes: ('personal' | 'business')[] = ['personal', 'business'];
    
    for (let i = 0; i < this.options.userCount; i++) {
      const accountType = faker.helpers.arrayElement(accountTypes);
      const role = faker.helpers.arrayElement(roles);
      
      const user: TestUser = {
        email: `test.user.${i}@example.com`,
        password: 'TestPassword123!',
        profile: {
          display_name: `${faker.person.firstName()} ${faker.person.lastName()} (Test)`,
          role,
          account_type: accountType,
          company_id: accountType === 'business' && companyIds.length > 0 
            ? faker.helpers.arrayElement(companyIds)
            : undefined
        }
      };
      
      users.push(user);
    }
    
    return users;
  }

  async seedCompanies(companies: TestCompany[]): Promise<string[]> {
    console.log(`🏢 Creating ${companies.length} test companies...`);
    
    const companyIds: string[] = [];
    
    for (const company of companies) {
      try {
        const { data, error } = await supabase
          .from('company_profiles')
          .insert({
            name: company.name,
            org_number: company.org_number,
            contact_email: company.contact_email,
            phone: company.phone,
            address: company.address,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();
        
        if (error) throw error;
        
        companyIds.push(data.id);
        
        if (this.options.verbose) {
          console.log(`  ✅ Created company: ${company.name} (${data.id})`);
        }
        
      } catch (error) {
        console.error(`❌ Error creating company ${company.name}:`, error);
      }
    }
    
    console.log(`✅ Created ${companyIds.length} companies`);
    return companyIds;
  }

  async seedUsers(users: TestUser[]): Promise<void> {
    console.log(`👥 Creating ${users.length} test users...`);
    
    let successCount = 0;
    
    for (const user of users) {
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            emailRedirectTo: undefined // Skip email confirmation in development
          }
        });
        
        if (authError) {
          console.warn(`⚠️ Auth creation failed for ${user.email}:`, authError.message);
          continue;
        }
        
        if (!authData.user) {
          console.warn(`⚠️ No user data returned for ${user.email}`);
          continue;
        }
        
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            display_name: user.profile.display_name,
            role: user.profile.role,
            account_type: user.profile.account_type,
            company_id: user.profile.company_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (profileError) throw profileError;
        
        successCount++;
        
        if (this.options.verbose) {
          console.log(`  ✅ Created user: ${user.email} (${user.profile.role})`);
        }
        
      } catch (error) {
        console.error(`❌ Error creating user ${user.email}:`, error);
      }
    }
    
    console.log(`✅ Created ${successCount} users`);
  }

  async generateSummary(): Promise<void> {
    console.log('\n📊 Seeding Summary:');
    console.log('==================');
    
    try {
      const { data: companies, error: companyError } = await supabase
        .from('company_profiles')
        .select('count(*)')
        .ilike('name', '%Test%');
      
      const { data: users, error: userError } = await supabase
        .from('user_profiles')
        .select('count(*)')
        .ilike('display_name', '%Test%');
      
      if (!companyError && companies?.[0]) {
        console.log(`Companies: ${companies[0].count}`);
      }
      
      if (!userError && users?.[0]) {
        console.log(`Users: ${users[0].count}`);
      }
      
      // Show role distribution
      const { data: roleData } = await supabase
        .from('user_profiles')
        .select('role')
        .ilike('display_name', '%Test%');
      
      if (roleData) {
        const roleCounts = roleData.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log('\nRole Distribution:');
        Object.entries(roleCounts).forEach(([role, count]) => {
          console.log(`  ${role}: ${count}`);
        });
      }
      
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  }

  async seed(): Promise<void> {
    const startTime = Date.now();
    
    console.log('🌱 Starting advanced database seeding...\n');
    
    try {
      await this.resetDatabase();
      
      const companies = this.generateTestCompanies();
      const companyIds = await this.seedCompanies(companies);
      
      const users = this.generateTestUsers(companyIds);
      await this.seedUsers(users);
      
      await this.generateSummary();
      
      const duration = Date.now() - startTime;
      console.log(`\n✅ Seeding completed in ${duration}ms`);
      
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    }
  }
}

function parseArgs(): SeedOptions {
  const args = process.argv.slice(2);
  
  const options: SeedOptions = {
    reset: false,
    userCount: 10,
    companyCount: 3,
    verbose: false
  };
  
  for (const arg of args) {
    if (arg === '--reset') {
      options.reset = true;
    } else if (arg.startsWith('--users=')) {
      options.userCount = parseInt(arg.split('=')[1]) || 10;
    } else if (arg.startsWith('--companies=')) {
      options.companyCount = parseInt(arg.split('=')[1]) || 3;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    }
  }
  
  return options;
}

async function main() {
  const options = parseArgs();
  const seeder = new AdvancedSeeder(options);
  
  console.log('Configuration:', {
    reset: options.reset,
    users: options.userCount,
    companies: options.companyCount,
    verbose: options.verbose
  });
  
  await seeder.seed();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}