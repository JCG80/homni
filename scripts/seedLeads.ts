#!/usr/bin/env ts-node

/**
 * PHASE 2A: Lead Data Seeding
 * Creates realistic lead data for testing marketplace and distribution
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

// Norwegian lead categories and types
const LEAD_CATEGORIES = [
  'rør', 'elektro', 'bygg', 'mal', 'tak', 'hage', 'renhold', 
  'sikkerhet', 'it', 'eiendom', 'forsikring', 'finans'
];

const LEAD_TITLES = {
  'rør': [
    'Lekkasje i bad - haster!', 'Installere nytt kjøkken', 'Reparere varmtvannstank',
    'Legge nye rør i kjeller', 'Koble til oppvaskmaskin', 'Skifte toalett'
  ],
  'elektro': [
    'Bytte sikringsskap', 'Installere ladestasjon elbil', 'Legge nye strømkabler',
    'Reparere lyspunkter', 'Installere varmepumpe', 'Automasjon smarthus'
  ],
  'bygg': [
    'Påbygg til hus', 'Oppussing av bad', 'Bygge terrasse', 
    'Kjellerisolering', 'Loft utbygging', 'Carport/garasje'
  ],
  'mal': [
    'Male huset utvendig', 'Innvendig maling stue', 'Tape og maling kjøkken',
    'Vedlikehold tre fasade', 'Male garasje', 'Restaurere vinduer'
  ],
  'tak': [
    'Takreparasjon etter storm', 'Nytt takbelegg', 'Takrenner og sluk',
    'Isolering av loft', 'Takvindu installasjon', 'Snøfang og takavising'
  ],
  'forsikring': [
    'Boligforsikring sammenligning', 'Bilforsikring ung sjåfør', 'Innboforsikring',
    'Reiseforsikring familie', 'Forsikring fritidshus', 'Bedriftsforsikring'
  ]
};

const NORWEGIAN_POSTCODES = [
  '0150', '0162', '0173', '0188', '0194', // Oslo
  '5003', '5020', '5039', '5045', '5089', // Bergen  
  '4010', '4020', '4033', '4046', '4085', // Stavanger
  '7010', '7020', '7033', '7046', '7089', // Trondheim
  '3015', '3025', '3033', '3046', '3089'  // Drammen
];

/**
 * Seed realistic Norwegian leads
 */
async function seedLeads(force: boolean = false) {
  console.log('🎯 Seeding Norwegian leads...\n');
  
  try {
    // Check if leads already exist
    if (!force) {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
      
      if (count && count > 0) {
        console.log(`⏭️  Leads already exist (${count} found). Use --force to reseed.`);
        return;
      }
    }
    
    // Get users for lead assignment
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id, display_name, role')
      .in('role', ['user', 'company']);
    
    // Get companies for lead distribution
    const { data: companies } = await supabase
      .from('company_profiles')
      .select('id, name, tags')
      .eq('status', 'active');
    
    if (!users || users.length === 0) {
      console.log('⏭️  No users found for lead creation');
      return;
    }
    
    const leads = [];
    const leadHistory = [];
    const smartStartSubmissions = [];
    
    // Create 100-200 leads
    const leadCount = faker.number.int({ min: 100, max: 200 });
    
    for (let i = 0; i < leadCount; i++) {
      const category = faker.helpers.arrayElement(LEAD_CATEGORIES);
      const possibleTitles = LEAD_TITLES[category] || ['Generell forespørsel'];
      const title = faker.helpers.arrayElement(possibleTitles);
      
      const leadType = faker.helpers.arrayElement(['visitor', 'user', 'import', 'referral']);
      const status = faker.helpers.arrayElement(['new', 'qualified', 'contacted', 'negotiating', 'converted', 'lost']);
      
      // Determine if this is a user-submitted or anonymous lead
      const isAnonymous = leadType === 'visitor' || faker.datatype.boolean({ probability: 0.3 });
      const user = isAnonymous ? null : faker.helpers.arrayElement(users);
      
      // Find matching company for assignment (if lead is processed)
      let assignedCompany = null;
      if (status !== 'new' && companies && companies.length > 0) {
        const matchingCompanies = companies.filter(c => 
          c.tags && c.tags.some(tag => tag.includes(category))
        );
        if (matchingCompanies.length > 0) {
          assignedCompany = faker.helpers.arrayElement(matchingCompanies);
        }
      }
      
      const lead = {
        id: faker.string.uuid(),
        title,
        description: generateLeadDescription(category, title),
        category,
        lead_type: leadType,
        status,
        submitted_by: user?.id || null,
        company_id: assignedCompany?.id || null,
        anonymous_email: isAnonymous ? faker.internet.email() : null,
        session_id: isAnonymous ? faker.string.uuid() : null,
        customer_name: faker.person.fullName(),
        customer_email: faker.internet.email(),
        customer_phone: generateNorwegianPhone(),
        metadata: {
          postcode: faker.helpers.arrayElement(NORWEGIAN_POSTCODES),
          urgency: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
          budget_range: faker.helpers.arrayElement(['under_10k', '10k_25k', '25k_50k', '50k_100k', 'over_100k']),
          property_type: faker.helpers.arrayElement(['apartment', 'house', 'cabin', 'commercial']),
          timeline: faker.helpers.arrayElement(['asap', 'within_week', 'within_month', 'flexible']),
          source: faker.helpers.arrayElement(['website', 'google', 'facebook', 'referral', 'phone']),
          utm_source: faker.helpers.arrayElement(['google', 'facebook', 'email', 'direct']),
          utm_campaign: faker.company.buzzNoun()
        },
        attributed_at: user ? faker.date.past({ days: 30 }) : null,
        created_at: faker.date.past({ days: 60 }),
        updated_at: faker.date.recent({ days: 30 })
      };
      
      leads.push(lead);
      
      // Create lead history entries for processed leads
      if (assignedCompany && status !== 'new') {
        leadHistory.push({
          id: faker.string.uuid(),
          lead_id: lead.id,
          assigned_to: assignedCompany.id,
          method: faker.helpers.arrayElement(['auto', 'manual', 'marketplace']),
          previous_status: 'new',
          new_status: status,
          created_at: faker.date.between({ 
            from: lead.created_at, 
            to: lead.updated_at 
          }),
          metadata: {
            cost: faker.number.int({ min: 200, max: 1500 }),
            assignment_reason: 'category_match',
            company_name: assignedCompany.name,
            notes: faker.lorem.sentence()
          }
        });
        
        // Add status progression history for converted leads
        if (status === 'converted') {
          const statuses = ['qualified', 'contacted', 'negotiating', 'converted'];
          statuses.forEach((newStatus, index) => {
            if (index > 0) {
              leadHistory.push({
                id: faker.string.uuid(),
                lead_id: lead.id,
                assigned_to: assignedCompany.id,
                method: 'manual',
                previous_status: statuses[index - 1],
                new_status: newStatus,
                created_at: faker.date.between({ 
                  from: lead.created_at, 
                  to: lead.updated_at 
                }),
                metadata: {
                  notes: `Status updated to ${newStatus}`,
                  updated_by: assignedCompany.id
                }
              });
            }
          });
        }
      }
      
      // Create SmartStart submissions for some leads (20% chance)
      if (faker.datatype.boolean({ probability: 0.2 })) {
        smartStartSubmissions.push({
          id: faker.string.uuid(),
          user_id: user?.id || null,
          session_id: lead.session_id || faker.string.uuid(),
          postcode: lead.metadata.postcode,
          requested_services: [category, faker.helpers.arrayElement(LEAD_CATEGORIES)],
          is_company: user?.role === 'company',
          search_query: title,
          selected_category: category,
          email: lead.customer_email,
          step_completed: faker.number.int({ min: 1, max: 4 }),
          lead_created: true,
          lead_id: lead.id,
          converted_at: faker.date.recent({ days: 7 }),
          flow_data: {
            steps_completed: faker.number.int({ min: 1, max: 4 }),
            time_spent: faker.number.int({ min: 30, max: 600 }),
            referrer: faker.internet.url()
          },
          created_at: faker.date.past({ days: 30 })
        });
      }
    }
    
    console.log(`📊 Inserting ${leads.length} leads...`);
    
    // Insert leads in batches
    const BATCH_SIZE = 50;
    for (let i = 0; i < leads.length; i += BATCH_SIZE) {
      const batch = leads.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('leads')
        .insert(batch);
      
      if (error) throw error;
      
      if (i % 100 === 0) {
        console.log(`📊 Inserted ${i + batch.length}/${leads.length} leads...`);
      }
    }
    
    // Insert lead history
    if (leadHistory.length > 0) {
      const { error: historyError } = await supabase
        .from('lead_history')
        .insert(leadHistory);
      
      if (historyError) throw historyError;
    }
    
    // Insert SmartStart submissions
    if (smartStartSubmissions.length > 0) {
      const { error: submissionError } = await supabase
        .from('smart_start_submissions')
        .insert(smartStartSubmissions);
      
      if (submissionError) throw submissionError;
    }
    
    console.log(`✅ Created ${leads.length} leads with ${leadHistory.length} history entries and ${smartStartSubmissions.length} SmartStart submissions`);
    
  } catch (error) {
    console.error('❌ Error seeding leads:', error);
    throw error;
  }
}

/**
 * Generate realistic lead description
 */
function generateLeadDescription(category: string, title: string): string {
  const templates = {
    'rør': [
      'Trenger rask hjelp med rørarbeider. Problemet oppstod i går og må løses snarest.',
      'Ønsker kostnadsoverslag for rørleggerarbeid. Kan møtes for befaring denne uken.',
      'Planlegger oppussing og trenger profesjonell rørlegger til prosjektet.'
    ],
    'elektro': [
      'Trenger autorisert elektriker til elektriske installasjoner. Viktig at arbeidet gjøres trygt.',
      'Ønsker tilbud på elektrisk arbeid. Kan sende bilder og tegninger på forespørsel.',
      'Elektriske problemer som må løses av fagmann. Kontakt meg for detaljer.'
    ],
    'bygg': [
      'Større byggeprosjekt som krever erfaren byggemester. Har tegninger klare.',
      'Trenger tilbud på byggearbeid. Fleksibel på tidspunkt og kan diskutere løsninger.',
      'Ønsker profesjonell utførelse av byggeprosjekt. Kvalitet er viktigst.'
    ]
  };
  
  const categoryTemplates = templates[category] || [
    'Trenger profesjonell hjelp med dette prosjektet. Kontakt meg for mer informasjon.',
    'Ønsker kostnadsoverslag og kan møtes for befaring. Fleksibel på tidspunkt.',
    'Viktig at jobben gjøres skikkelig av fagfolk. Ta kontakt for å diskutere detaljer.'
  ];
  
  return faker.helpers.arrayElement(categoryTemplates);
}

/**
 * Generate Norwegian phone number
 */
function generateNorwegianPhone(): string {
  const prefixes = ['40', '41', '45', '46', '47', '48', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'];
  const prefix = faker.helpers.arrayElement(prefixes);
  const number = faker.string.numeric(6);
  return `${prefix} ${number.slice(0, 2)} ${number.slice(2, 4)} ${number.slice(4)}`;
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  seedLeads(force);
}

export default seedLeads;