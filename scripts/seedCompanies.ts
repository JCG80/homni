#!/usr/bin/env ts-node

/**
 * PHASE 2A: Company Profile Seeding
 * Creates realistic Norwegian company data for testing
 * Part of Ultimate Master 2.0 testing infrastructure
 */

import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker/locale/nb_NO';

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

// Norwegian business types and services
const NORWEGIAN_BUSINESS_TYPES = [
  'Rørlegger', 'Elektriker', 'Maler', 'Tømrer', 'Byggemester',
  'Eiendomsmegler', 'Taktekkere', 'Forsikringsselskap', 'Bank',
  'Revisor', 'Advokat', 'IT-konsulent', 'Renholdsfirma', 'Sikkerhetsfirma'
];

const SERVICE_CATEGORIES = [
  'rør', 'elektro', 'bygg', 'mal', 'tak', 'eiendom', 
  'forsikring', 'finans', 'jus', 'it', 'renhold', 'sikkerhet'
];

const NORWEGIAN_CITIES = [
  'Oslo', 'Bergen', 'Stavanger', 'Trondheim', 'Drammen',
  'Fredrikstad', 'Sandnes', 'Tromsø', 'Sarpsborg', 'Skien'
];

/**
 * Seed company profiles with realistic Norwegian data
 */
async function seedCompanies(force: boolean = false) {
  console.log('🏢 Seeding Norwegian companies...\n');
  
  try {
    // Check if companies already exist
    if (!force) {
      const { count } = await supabase
        .from('company_profiles')
        .select('*', { count: 'exact', head: true });
      
      if (count && count > 0) {
        console.log(`⏭️  Companies already exist (${count} found). Use --force to reseed.`);
        return;
      }
    }
    
    // Get company users to assign companies to
    const { data: companyUsers } = await supabase
      .from('user_profiles')
      .select('id, display_name')
      .eq('role', 'company');
    
    if (!companyUsers || companyUsers.length === 0) {
      console.log('⏭️  No company users found. Please seed users first.');
      return;
    }
    
    const companies = [];
    const budgetTransactions = [];
    
    // Create 20-35 companies
    const companyCount = faker.number.int({ min: 20, max: 35 });
    
    for (let i = 0; i < companyCount; i++) {
      const businessType = faker.helpers.arrayElement(NORWEGIAN_BUSINESS_TYPES);
      const city = faker.helpers.arrayElement(NORWEGIAN_CITIES);
      const companyUser = faker.helpers.arrayElement(companyUsers);
      const serviceTags = faker.helpers.arrayElements(SERVICE_CATEGORIES, { min: 1, max: 3 });
      
      // Generate realistic Norwegian company name
      const companyName = generateNorwegianCompanyName(businessType, city);
      
      const currentBudget = faker.number.int({ min: 0, max: 50000 });
      const monthlyBudget = faker.number.int({ min: 5000, max: 100000 });
      
      const company = {
        id: faker.string.uuid(),
        user_id: companyUser.id,
        name: companyName,
        status: faker.helpers.arrayElement(['active', 'inactive', 'pending']),
        tags: serviceTags,
        contact_name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: generateNorwegianPhone(),
        industry: businessType.toLowerCase(),
        subscription_plan: faker.helpers.arrayElement(['free', 'basic', 'premium', 'enterprise']),
        modules_access: generateModulesAccess(faker.helpers.arrayElement(['free', 'basic', 'premium', 'enterprise'])),
        current_budget: currentBudget,
        daily_budget: faker.number.int({ min: 100, max: 2000 }),
        monthly_budget: monthlyBudget,
        auto_accept_leads: faker.datatype.boolean({ probability: 0.7 }),
        lead_cost_per_unit: faker.number.int({ min: 200, max: 1500 }),
        budget_alerts_enabled: faker.datatype.boolean({ probability: 0.8 }),
        low_budget_threshold: faker.number.int({ min: 50, max: 1000 }),
        metadata: {
          org_number: generateNorwegianOrgNumber(),
          founded: faker.date.past({ years: 30 }).getFullYear(),
          employees: faker.number.int({ min: 1, max: 250 }),
          website: faker.internet.url(),
          description: generateBusinessDescription(businessType),
          certifications: generateCertifications(businessType),
          coverage_areas: faker.helpers.arrayElements(NORWEGIAN_CITIES, { min: 1, max: 5 })
        },
        notification_preferences: {
          email_leads: faker.datatype.boolean({ probability: 0.9 }),
          sms_urgent: faker.datatype.boolean({ probability: 0.6 }),
          budget_alerts: faker.datatype.boolean({ probability: 0.8 }),
          weekly_reports: faker.datatype.boolean({ probability: 0.7 })
        },
        ui_preferences: {
          theme: faker.helpers.arrayElement(['light', 'dark', 'auto']),
          dashboard_layout: faker.helpers.arrayElement(['grid', 'list']),
          lead_view: faker.helpers.arrayElement(['card', 'table'])
        },
        feature_overrides: {}
      };
      
      companies.push(company);
      
      // Generate some budget transactions for active companies
      if (company.status === 'active') {
        const transactionCount = faker.number.int({ min: 3, max: 15 });
        
        for (let j = 0; j < transactionCount; j++) {
          const isDebit = faker.datatype.boolean({ probability: 0.7 });
          const amount = isDebit 
            ? -faker.number.int({ min: 100, max: 2000 })
            : faker.number.int({ min: 500, max: 10000 });
          
          budgetTransactions.push({
            id: faker.string.uuid(),
            company_id: company.id,
            transaction_type: isDebit ? 'debit' : 'credit',
            amount: Math.abs(amount),
            balance_before: currentBudget,
            balance_after: currentBudget + amount,
            description: isDebit 
              ? `Lead purchase: ${faker.commerce.productName()}`
              : `Budget top-up: ${faker.commerce.productName()}`,
            metadata: {
              source: isDebit ? 'lead_purchase' : 'manual_topup',
              campaign_id: faker.string.uuid()
            },
            created_at: faker.date.past({ days: 90 })
          });
        }
      }
    }
    
    console.log(`📊 Inserting ${companies.length} companies...`);
    
    // Insert companies
    const { error: companyError } = await supabase
      .from('company_profiles')
      .insert(companies);
    
    if (companyError) throw companyError;
    
    // Insert budget transactions
    if (budgetTransactions.length > 0) {
      const { error: transactionError } = await supabase
        .from('company_budget_transactions')
        .insert(budgetTransactions);
      
      if (transactionError) throw transactionError;
    }
    
    console.log(`✅ Created ${companies.length} companies with ${budgetTransactions.length} budget transactions`);
    
  } catch (error) {
    console.error('❌ Error seeding companies:', error);
    throw error;
  }
}

/**
 * Generate Norwegian-style company name
 */
function generateNorwegianCompanyName(businessType: string, city: string): string {
  const patterns = [
    `${city} ${businessType} AS`,
    `${faker.person.lastName()} ${businessType}`,
    `${city}${businessType.replace(' ', '')} AS`,
    `Norsk ${businessType} ${city}`,
    `${faker.person.lastName()} & ${faker.person.lastName()} ${businessType}`,
    `${businessType}mester ${city}`
  ];
  
  return faker.helpers.arrayElement(patterns);
}

/**
 * Generate Norwegian phone number
 */
function generateNorwegianPhone(): string {
  const prefixes = ['22', '23', '40', '41', '45', '46', '47', '48', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'];
  const prefix = faker.helpers.arrayElement(prefixes);
  const number = faker.string.numeric(6);
  return `${prefix} ${number.slice(0, 2)} ${number.slice(2, 4)} ${number.slice(4)}`;
}

/**
 * Generate Norwegian organization number
 */
function generateNorwegianOrgNumber(): string {
  // Norwegian org numbers are 9 digits
  return faker.string.numeric(9);
}

/**
 * Generate business description in Norwegian
 */
function generateBusinessDescription(businessType: string): string {
  const templates = {
    'Rørlegger': 'Profesjonell rørleggerservice for private og bedrifter. Utfører alt fra småjobber til store prosjekter.',
    'Elektriker': 'Autorisert elektrikervirksomhet med lang erfaring. Tilbyr alle typer elektriske installasjoner og service.',
    'Maler': 'Kvalitetsmaling for hjem og næring. Profesjonell utførelse og gode priser.',
    'Tømrer': 'Erfaren tømrermester tilbyr alle typer tømrerarbeid. Fra oppussing til nybygg.',
    'Byggemester': 'Totalentreprise for bygg og anlegg. Leverer komplette prosjekter fra A til Å.',
    'Eiendomsmegler': 'Din lokale eiendomsmegler med god kjennskap til markedet. Personlig service og gode resultater.',
    'Taktekkere': 'Spesialister på alle typer takarbeider. Reparasjoner, nytak og vedlikehold.',
    'Forsikringsselskap': 'Omfattende forsikringsløsninger for privat og næring. Trygghet du kan stole på.',
    'Bank': 'Din lokale bankpartner med personlig service og konkurransedyktige betingelser.',
    'IT-konsulent': 'Profesjonelle IT-tjenester for små og mellomstore bedrifter. Kompetent og pålitelig.'
  };
  
  return templates[businessType] || `Profesjonell ${businessType.toLowerCase()}service med høy kvalitet og god service.`;
}

/**
 * Generate relevant certifications for business type
 */
function generateCertifications(businessType: string): string[] {
  const certificationMap = {
    'Rørlegger': ['Rørteknikk', 'VVS-installatør', 'Vannbehandling'],
    'Elektriker': ['Elektroautorisasjon', 'NEK400', 'Høyspent'],
    'Maler': ['Mesterbrev maler', 'Byggebeskyttelse', 'Overflatebehandling'],
    'Tømrer': ['Mesterbrev tømrer', 'Byggteknikk', 'Trebearbeiding'],
    'Byggemester': ['Byggmesterautorisasjon', 'Prosjektledelse', 'Kvalitetssikring'],
    'Eiendomsmegler': ['Eiendomsmeglereksamen', 'Takstmann', 'Markedsanalyse'],
    'Taktekkere': ['Taktekkermester', 'Fallsikring', 'Tetting og membran'],
    'Forsikringsselskap': ['Finanstilsynet godkjent', 'Skadetakst', 'Risikostyring'],
    'Bank': ['Finanstilsynet', 'Autorisert finansrådgiver', 'Kredittvurdering'],
    'IT-konsulent': ['ITIL', 'Microsoft Partner', 'Cybersikkerhet']
  };
  
  return certificationMap[businessType] || ['Fagbrev', 'Kvalitetssertifikat'];
}

/**
 * Generate modules access based on subscription plan
 */
function generateModulesAccess(plan: string): string[] {
  const moduleMap = {
    'free': ['leads'],
    'basic': ['leads', 'analytics'],
    'premium': ['leads', 'analytics', 'marketplace', 'reporting'],
    'enterprise': ['leads', 'analytics', 'marketplace', 'reporting', 'api', 'white_label']
  };
  
  return moduleMap[plan] || ['leads'];
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  seedCompanies(force);
}

export default seedCompanies;