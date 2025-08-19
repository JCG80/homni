/**
 * Seed Test Users - Fictional data for testing all features
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kkazhcihooovsuwravhs.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export interface TestUser {
  email: string;
  password: string;
  role: string;
  profile: {
    full_name: string;
    display_name: string;
    role: string;
    account_type: string;
    metadata: Record<string, any>;
  };
  company?: {
    name: string;
    industry: string;
    contact_email: string;
    subscription_plan: string;
  };
}

export const TEST_USERS: TestUser[] = [
  {
    email: 'guest@homni.no',
    password: 'Test123456!',
    role: 'guest',
    profile: {
      full_name: 'Guest User',
      display_name: 'Guest',
      role: 'guest',
      account_type: 'personal',
      metadata: { test_account: true },
    },
  },
  {
    email: 'privatperson@homni.no',
    password: 'Test123456!',
    role: 'user',
    profile: {
      full_name: 'Lars Hansen',
      display_name: 'Lars',
      role: 'user',
      account_type: 'personal',
      metadata: { 
        test_account: true,
        interests: ['home_insurance', 'property_documentation']
      },
    },
  },
  {
    email: 'bedrift@homni.no',
    password: 'Test123456!',
    role: 'company',
    profile: {
      full_name: 'Kari Andersen',
      display_name: 'Kari',
      role: 'company',
      account_type: 'business',
      metadata: { test_account: true },
    },
    company: {
      name: 'Test Forsikring AS',
      industry: 'insurance',
      contact_email: 'bedrift@homni.no',
      subscription_plan: 'professional',
    },
  },
  {
    email: 'redaktør@homni.no',
    password: 'Test123456!',
    role: 'content_editor',
    profile: {
      full_name: 'Emma Johansen',
      display_name: 'Emma',
      role: 'content_editor',
      account_type: 'business',
      metadata: { 
        test_account: true,
        specialties: ['content_creation', 'seo', 'marketing']
      },
    },
  },
  {
    email: 'admin@homni.no',
    password: 'Test123456!',
    role: 'admin',
    profile: {
      full_name: 'Thomas Eriksen',
      display_name: 'Thomas',
      role: 'admin',
      account_type: 'business',
      metadata: { 
        test_account: true,
        permissions: ['user_management', 'content_management', 'lead_management']
      },
    },
  },
  {
    email: 'superadmin@homni.no',
    password: 'Test123456!',
    role: 'master_admin',
    profile: {
      full_name: 'Sarah Olsen',
      display_name: 'Sarah',
      role: 'master_admin',
      account_type: 'business',
      metadata: { 
        test_account: true,
        permissions: ['all']
      },
    },
  },
];

/**
 * Create sample properties for testing
 */
async function createSampleProperties(userId: string): Promise<void> {
  const properties = [
    {
      user_id: userId,
      name: 'Min første bolig',
      type: 'apartment',
      address: 'Testveien 123, 0123 Oslo',
      size: 85,
      purchase_date: '2020-06-15',
    },
    {
      user_id: userId,
      name: 'Hytte i skogen',
      type: 'cabin',
      address: 'Skogveien 45, 1234 Lillehammer',
      size: 60,
      purchase_date: '2019-08-20',
    },
  ];

  for (const property of properties) {
    const { data: propertyData, error } = await supabase
      .from('properties')
      .insert(property)
      .select()
      .single();

    if (error) {
      console.error('Error creating property:', error);
      continue;
    }

    // Add sample documents
    await supabase.from('property_documents').insert([
      {
        property_id: propertyData.id,
        name: 'Boligkjøpskontrakt',
        document_type: 'manual',
      },
      {
        property_id: propertyData.id,
        name: 'Husbank garantibevis',
        document_type: 'warranty',
      },
    ]);

    // Add sample expenses
    await supabase.from('property_expenses').insert([
      {
        property_id: propertyData.id,
        name: 'Månedlig felleskost',
        amount: 3500,
        date: '2024-01-01',
        recurring: true,
        recurring_frequency: 'monthly',
      },
      {
        property_id: propertyData.id,
        name: 'Årlig forsikring',
        amount: 8500,
        date: '2024-01-01',
        recurring: true,
        recurring_frequency: 'annual',
      },
    ]);
  }
}

/**
 * Create sample leads for testing
 */
async function createSampleLeads(): Promise<void> {
  const leads = [
    {
      title: 'Hjemforsikring for ny bolig',
      description: 'Trenger hjemforsikring for leilighet på 85 kvm i Oslo',
      category: 'home_insurance',
      lead_type: 'insurance',
      status: 'new',
      metadata: {
        customer_contact: {
          name: 'Test Kunde',
          email: 'kunde@test.no',
          phone: '+47 900 00 000',
        },
        property_details: {
          address: 'Testveien 123, Oslo',
          property_type: 'apartment',
          size: 85,
        },
        insurance_details: {
          type: 'home_insurance',
          coverage_amount: 2000000,
        },
      },
    },
    {
      title: 'Salg av enebolig',
      description: 'Ønsker å selge enebolig på 150 kvm',
      category: 'property_sale',
      lead_type: 'property',
      status: 'new',
      metadata: {
        customer_contact: {
          name: 'Selger Hansen',
          email: 'selger@test.no',
          phone: '+47 900 11 111',
        },
        property_details: {
          address: 'Boligveien 456, Bergen',
          property_type: 'house',
          size: 150,
        },
      },
    },
  ];

  for (const lead of leads) {
    const { error } = await supabase
      .from('leads')
      .insert(lead);

    if (error) {
      console.error('Error creating lead:', error);
    }
  }
}

/**
 * Create sample insurance companies
 */
async function createSampleInsuranceCompanies(): Promise<void> {
  const companies = [
    {
      name: 'Test Forsikring',
      description: 'Ledende forsikringsselskap med over 50 års erfaring',
      logo_url: '/images/test-insurance-logo.png',
      customer_rating: 4.2,
      review_count: 150,
      is_featured: true,
    },
    {
      name: 'Trygg Hjem AS',
      description: 'Spesialist på hjemforsikring og boligtjenester',
      logo_url: '/images/trygg-hjem-logo.png',
      customer_rating: 4.5,
      review_count: 89,
      is_featured: false,
    },
  ];

  for (const company of companies) {
    const { error } = await supabase
      .from('insurance_companies')
      .insert(company);

    if (error) {
      console.error('Error creating insurance company:', error);
    }
  }
}

/**
 * Main seeding function
 */
export async function seedTestUsers(): Promise<void> {
  console.log('🌱 Starting test user seeding...');

  try {
    // Create test users
    for (const testUser of TEST_USERS) {
      console.log(`Creating user: ${testUser.email}`);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: {
          full_name: testUser.profile.full_name,
          role: testUser.role,
        },
      });

      if (authError) {
        console.error(`Error creating auth user ${testUser.email}:`, authError);
        continue;
      }

      const userId = authData.user.id;

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          user_id: userId,
          ...testUser.profile,
        });

      if (profileError) {
        console.error(`Error creating profile for ${testUser.email}:`, profileError);
        continue;
      }

      // Create company profile if applicable
      if (testUser.company) {
        const { data: companyData, error: companyError } = await supabase
          .from('company_profiles')
          .insert({
            user_id: userId,
            ...testUser.company,
          })
          .select()
          .single();

        if (companyError) {
          console.error(`Error creating company for ${testUser.email}:`, companyError);
        } else {
          // Update user profile with company_id
          await supabase
            .from('user_profiles')
            .update({ company_id: companyData.id })
            .eq('id', userId);
        }
      }

      // Create sample properties for regular users
      if (testUser.role === 'user') {
        await createSampleProperties(userId);
      }

      console.log(`✅ Created user: ${testUser.email} (${testUser.role})`);
    }

    // Create sample leads
    await createSampleLeads();
    console.log('✅ Created sample leads');

    // Create sample insurance companies
    await createSampleInsuranceCompanies();
    console.log('✅ Created sample insurance companies');

    console.log('🎉 Test user seeding completed successfully!');
    console.log('\n📋 Test Users:');
    TEST_USERS.forEach(user => {
      console.log(`  ${user.email} (${user.role}) - Password: ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

// Run seeding if called directly
if (typeof window === 'undefined' && require.main === module) {
  seedTestUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}