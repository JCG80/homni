#!/usr/bin/env ts-node

/**
 * PHASE 2A: Comprehensive Database Seeding
 * Master seed script that populates database with realistic fictional data
 * Part of Ultimate Master 2.0 testing infrastructure
 */

import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker/locale/nb_NO';
import seedTestUsers from './seedTestUsers';
import seedCompanies from './seedCompanies';
import seedLeads from './seedLeads';

const SUPABASE_URL = 'https://kkazhcihooovsuwravhs.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface SeedOptions {
  users: boolean;
  companies: boolean;
  leads: boolean;
  properties: boolean;
  analytics: boolean;
  modules: boolean;
  force: boolean; // Force reseed even if data exists
}

const DEFAULT_OPTIONS: SeedOptions = {
  users: true,
  companies: true,
  leads: true,
  properties: true,
  analytics: true,
  modules: true,
  force: false
};

/**
 * Main seeding orchestrator
 */
async function seedDatabase(options: Partial<SeedOptions> = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  console.log('🌱 Starting comprehensive database seeding...\n');
  console.log('Options:', opts);
  console.log('=' * 50);
  
  try {
    // 1. Seed test users (foundation)
    if (opts.users) {
      console.log('\n📝 Step 1: Seeding test users...');
      await seedTestUsers();
    }
    
    // 2. Seed companies
    if (opts.companies) {
      console.log('\n🏢 Step 2: Seeding companies...');
      await seedCompanies(opts.force);
    }
    
    // 3. Seed leads
    if (opts.leads) {
      console.log('\n🎯 Step 3: Seeding leads...');
      await seedLeads(opts.force);
    }
    
    // 4. Seed properties and documents
    if (opts.properties) {
      console.log('\n🏠 Step 4: Seeding properties...');
      await seedProperties(opts.force);
    }
    
    // 5. Seed analytics data 
    if (opts.analytics) {
      console.log('\n📊 Step 5: Seeding analytics...');
      await seedAnalytics(opts.force);
    }
    
    // 6. Initialize user modules
    if (opts.modules) {
      console.log('\n🧩 Step 6: Initializing user modules...');
      await initializeUserModules(opts.force);
    }
    
    console.log('\n' + '=' * 50);
    console.log('🎉 Database seeding completed successfully!');
    console.log('🔗 Access QuickLogin at: /test');
    
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  }
}

/**
 * Seed realistic property data
 */
async function seedProperties(force: boolean = false) {
  try {
    // Check if properties already exist
    if (!force) {
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });
      
      if (count && count > 0) {
        console.log(`⏭️  Properties already exist (${count} found). Use --force to reseed.`);
        return;
      }
    }
    
    // Get test users to assign properties to
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id, display_name, role')
      .in('role', ['user', 'company']);
    
    if (!users || users.length === 0) {
      console.log('⏭️  No users found for property assignment');
      return;
    }
    
    const properties = [];
    const documents = [];
    const maintenanceTasks = [];
    
    // Create 15-25 properties
    const propertyCount = faker.number.int({ min: 15, max: 25 });
    
    for (let i = 0; i < propertyCount; i++) {
      const user = faker.helpers.arrayElement(users);
      const propertyType = faker.helpers.arrayElement(['apartment', 'house', 'cabin', 'commercial']);
      
      const property = {
        id: faker.string.uuid(),
        user_id: user.id,
        name: faker.location.street() + ' ' + faker.location.buildingNumber(),
        type: propertyType,
        address: faker.location.streetAddress() + ', ' + faker.location.zipCode() + ' ' + faker.location.city(),
        description: faker.commerce.productDescription(),
        size: faker.number.int({ min: 50, max: 500 }),
        purchase_date: faker.date.past({ years: 10 }),
        current_value: faker.number.int({ min: 1000000, max: 15000000 }),
        status: faker.helpers.arrayElement(['owned', 'rented', 'for_sale'])
      };
      
      properties.push(property);
      
      // Add 2-8 documents per property
      const docCount = faker.number.int({ min: 2, max: 8 });
      for (let j = 0; j < docCount; j++) {
        documents.push({
          id: faker.string.uuid(),
          property_id: property.id,
          name: faker.helpers.arrayElement([
            'Kjøpekontrakt', 'Takstrapport', 'Forsikringspapirer',
            'Garantier', 'Manualer', 'Situasjonsplan', 'Byggetegninger'
          ]) + `_${j + 1}.pdf`,
          document_type: faker.helpers.arrayElement(['contract', 'insurance', 'manual', 'plan', 'certificate']),
          file_path: `/documents/${property.id}/${faker.string.alphanumeric(20)}.pdf`,
          mime_type: 'application/pdf',
          file_size: faker.number.int({ min: 100000, max: 5000000 }),
          description: faker.lorem.sentence(),
          tags: faker.helpers.arrayElements(['important', 'archived', 'warranty', 'insurance'], { min: 0, max: 2 })
        });
      }
      
      // Add 1-5 maintenance tasks per property
      const taskCount = faker.number.int({ min: 1, max: 5 });
      for (let k = 0; k < taskCount; k++) {
        maintenanceTasks.push({
          id: faker.string.uuid(),
          property_id: property.id,
          title: faker.helpers.arrayElement([
            'Rens ventilasjon', 'Sjekk røykvarslere', 'Vedlikehold terrasse',
            'Service varmepumpe', 'Maling utendørs', 'Taktekking sjekk'
          ]),
          description: faker.lorem.sentences(2),
          category: faker.helpers.arrayElement(['heating', 'electrical', 'plumbing', 'exterior', 'interior']),
          priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
          status: faker.helpers.arrayElement(['pending', 'in_progress', 'completed']),
          due_date: faker.date.future({ years: 1 }),
          estimated_cost: faker.number.int({ min: 500, max: 25000 }),
          recurring_frequency: faker.helpers.maybe(() => 
            faker.helpers.arrayElement(['yearly', 'quarterly', 'monthly']), { probability: 0.3 }
          )
        });
      }
    }
    
    // Insert properties
    const { error: propError } = await supabase
      .from('properties')
      .insert(properties);
    
    if (propError) throw propError;
    
    // Insert documents
    const { error: docError } = await supabase
      .from('property_documents')
      .insert(documents);
    
    if (docError) throw docError;
    
    // Insert maintenance tasks
    const { error: taskError } = await supabase
      .from('property_maintenance_tasks')
      .insert(maintenanceTasks);
    
    if (taskError) throw taskError;
    
    console.log(`✅ Created ${properties.length} properties with ${documents.length} documents and ${maintenanceTasks.length} maintenance tasks`);
    
  } catch (error) {
    console.error('❌ Error seeding properties:', error);
    throw error;
  }
}

/**
 * Seed analytics data for testing dashboards
 */
async function seedAnalytics(force: boolean = false) {
  try {
    // Check if analytics data already exists
    if (!force) {
      const { count } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true });
      
      if (count && count > 0) {
        console.log(`⏭️  Analytics data already exists (${count} events found). Use --force to reseed.`);
        return;
      }
    }
    
    // Get test users
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id, role');
    
    if (!users || users.length === 0) {
      console.log('⏭️  No users found for analytics data');
      return;
    }
    
    const events = [];
    const metrics = [];
    const activitySummaries = [];
    
    // Create analytics events for the past 30 days
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayEvents = [];
      
      // Generate 10-50 events per day
      const eventCount = faker.number.int({ min: 10, max: 50 });
      
      for (let i = 0; i < eventCount; i++) {
        const user = faker.helpers.arrayElement(users);
        const eventTime = new Date(d);
        eventTime.setHours(faker.number.int({ min: 6, max: 23 }));
        eventTime.setMinutes(faker.number.int({ min: 0, max: 59 }));
        
        const event = {
          id: faker.string.uuid(),
          user_id: user.id,
          session_id: faker.string.uuid(),
          event_type: faker.helpers.arrayElement(['page_view', 'click', 'form_submit', 'search', 'conversion']),
          event_name: faker.helpers.arrayElement([
            'dashboard_view', 'property_create', 'lead_submit', 'profile_update',
            'document_upload', 'search_performed', 'module_enabled'
          ]),
          properties: {
            page: faker.helpers.arrayElement(['/dashboard', '/properties', '/leads', '/profile']),
            source: faker.helpers.arrayElement(['direct', 'google', 'social', 'email']),
            device: faker.helpers.arrayElement(['desktop', 'mobile', 'tablet'])
          },
          created_at: eventTime.toISOString()
        };
        
        events.push(event);
        dayEvents.push(event);
      }
      
      // Create daily metrics
      metrics.push({
        id: faker.string.uuid(),
        metric_name: 'daily_active_users',
        metric_value: new Set(dayEvents.map(e => e.user_id)).size,
        date_recorded: d.toISOString().split('T')[0],
        dimensions: {
          source: 'analytics_events'
        }
      });
      
      metrics.push({
        id: faker.string.uuid(),
        metric_name: 'page_views',
        metric_value: dayEvents.filter(e => e.event_type === 'page_view').length,
        date_recorded: d.toISOString().split('T')[0],
        dimensions: {
          source: 'analytics_events'
        }
      });
      
      // Create user activity summaries
      const usersByDay = groupBy(dayEvents, 'user_id');
      for (const [userId, userEvents] of Object.entries(usersByDay)) {
        activitySummaries.push({
          id: faker.string.uuid(),
          user_id: userId,
          date_summary: d.toISOString().split('T')[0],
          total_events: userEvents.length,
          session_count: new Set(userEvents.map(e => e.session_id)).size,
          time_spent_minutes: faker.number.int({ min: 5, max: 120 }),
          features_used: userEvents.reduce((acc, e) => {
            acc[e.event_type] = (acc[e.event_type] || 0) + 1;
            return acc;
          }, {}),
          conversion_events: userEvents.filter(e => e.event_type === 'conversion').length
        });
      }
    }
    
    console.log(`📊 Preparing to insert ${events.length} analytics events...`);
    
    // Insert in batches to avoid overwhelming the database
    const BATCH_SIZE = 100;
    
    for (let i = 0; i < events.length; i += BATCH_SIZE) {
      const batch = events.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('analytics_events')
        .insert(batch);
      
      if (error) throw error;
      
      if (i % 500 === 0) {
        console.log(`📊 Inserted ${i + batch.length}/${events.length} events...`);
      }
    }
    
    // Insert metrics
    const { error: metricsError } = await supabase
      .from('analytics_metrics')
      .insert(metrics);
    
    if (metricsError) throw metricsError;
    
    // Insert activity summaries
    const { error: summaryError } = await supabase
      .from('user_activity_summaries')
      .insert(activitySummaries);
    
    if (summaryError) throw summaryError;
    
    console.log(`✅ Created ${events.length} analytics events, ${metrics.length} metrics, and ${activitySummaries.length} activity summaries`);
    
  } catch (error) {
    console.error('❌ Error seeding analytics:', error);
    throw error;
  }
}

/**
 * Initialize modules for all test users
 */
async function initializeUserModules(force: boolean = false) {
  try {
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id, role')
      .neq('role', 'guest');
    
    if (!users || users.length === 0) {
      console.log('⏭️  No users found for module initialization');
      return;
    }
    
    let initializedCount = 0;
    
    for (const user of users) {
      try {
        // Check if user already has modules initialized
        if (!force) {
          const { count } = await supabase
            .from('user_modules')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          
          if (count && count > 0) {
            console.log(`⏭️  User ${user.id} already has modules initialized`);
            continue;
          }
        }
        
        // Use the existing RPC function to initialize modules
        const { error } = await supabase
          .rpc('initialize_user_module_access', {
            target_user_id: user.id
          });
        
        if (!error) {
          initializedCount++;
        } else {
          console.warn(`⚠️  Failed to initialize modules for user ${user.id}:`, error);
        }
      } catch (userError) {
        console.warn(`⚠️  Error processing user ${user.id}:`, userError);
      }
    }
    
    console.log(`✅ Initialized modules for ${initializedCount} users`);
    
  } catch (error) {
    console.error('❌ Error initializing user modules:', error);
    throw error;
  }
}

/**
 * Utility function to group array by key
 */
function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = item[key] as string;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: Partial<SeedOptions> = {};
  
  // Parse command line arguments
  args.forEach(arg => {
    switch (arg) {
      case '--force':
        options.force = true;
        break;
      case '--users-only':
        options.users = true;
        options.companies = false;
        options.leads = false;
        options.properties = false;
        options.analytics = false;
        options.modules = false;
        break;
      case '--no-analytics':
        options.analytics = false;
        break;
      case '--no-properties':
        options.properties = false;
        break;
    }
  });
  
  seedDatabase(options);
}

export default seedDatabase;