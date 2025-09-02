#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

// 32 forsikringsselskaper fra Tjenestetorget.no/forsikring/forsikringsselskaper-oversikt
const INSURANCE_COMPANIES = [
  'Agria',
  'Codan', 
  'DS Försäkring',
  'Enter',
  'Europeiske',
  'Frende',
  'Fremtind',
  'Gjensidige',
  'Gouda',
  'Help',
  'If',
  'Jernbanepersonalets Bank og Forsikring (JBF)',
  'Knif',
  'Komplett',
  'KLP',
  'Landkreditt', 
  'Nemi',
  'Nordea',
  'NAF',
  'Rema',
  'Sparebank 1',
  'Storebrand',
  'Tide',
  'Tryg',
  'Tennant',
  'Troll',
  'Tribe', 
  'Trumf',
  'Vardia',
  'Volvia',
  'Vesta',
  'Watercircles'
];

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae') 
    .replace(/å/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ä/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seedInsuranceCompanies() {
  const supabaseUrl = process.env.SUPABASE_URL || "https://kkazhcihooovsuwravhs.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🔄 Seeding insurance companies from Tjenestetorget.no...');

  for (const [index, companyName] of INSURANCE_COMPANIES.entries()) {
    const slug = toSlug(companyName);
    const sortIndex = index;

    // Check if company already exists
    const { data: existing } = await supabase
      .from('insurance_companies')
      .select('id, name, slug')
      .eq('slug', slug)
      .maybeSingle();

    const companyData = {
      name: companyName,
      slug: slug,
      description: `${companyName} tilbyr forsikringsløsninger for privatpersoner og bedrifter.`,
      is_published: true,
      sort_index: sortIndex,
      website_url: `https://${slug}.no`, // Placeholder URL
      customer_rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10, // Random rating between 3.5-5.0
      is_featured: index < 6 // Feature first 6 companies
    };

    if (!existing) {
      // Insert new company
      const { error } = await supabase
        .from('insurance_companies')
        .insert([companyData]);

      if (error) {
        console.error(`❌ Failed to insert ${companyName}:`, error.message);
      } else {
        console.log(`✅ Inserted ${companyName} (${slug})`);
      }
    } else {
      // Update existing company with new fields
      const { error } = await supabase
        .from('insurance_companies')
        .update({
          is_published: companyData.is_published,
          sort_index: companyData.sort_index,
          website_url: companyData.website_url,
          customer_rating: existing.customer_rating || companyData.customer_rating,
          is_featured: companyData.is_featured
        })
        .eq('id', existing.id);

      if (error) {
        console.error(`❌ Failed to update ${companyName}:`, error.message);
      } else {
        console.log(`🔄 Updated ${companyName} (${slug})`);
      }
    }
  }

  console.log('✅ Insurance companies seeding completed!');
  console.log(`📊 Total companies: ${INSURANCE_COMPANIES.length}`);
}

// Run the seeding script
seedInsuranceCompanies().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});