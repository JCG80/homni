/**
 * PHASE 2A: Test Data Generators
 * Utilities for generating realistic test data in frontend components
 * Part of Ultimate Master 2.0 testing infrastructure
 */

import { faker } from '@faker-js/faker/locale/nb_NO';
import type { UserRole } from '@/modules/auth/normalizeRole';

// Norwegian-specific data
const NORWEGIAN_CITIES = [
  'Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen',
  'Kristiansand', 'Fredrikstad', 'Tromsø', 'Sandnes', 'Sarpsborg'
];

const NORWEGIAN_POSTCODES = [
  '0150', '0162', '0173', '0188', '0194', // Oslo
  '5003', '5020', '5039', '5045', '5089', // Bergen  
  '4010', '4020', '4033', '4046', '4085', // Stavanger
  '7010', '7020', '7033', '7046', '7089', // Trondheim
  '3015', '3025', '3033', '3046', '3089'  // Drammen
];

const BUSINESS_TYPES = [
  'Rørlegger', 'Elektriker', 'Maler', 'Tømrer', 'Byggemester',
  'Eiendomsmegler', 'Taktekkere', 'Forsikringsselskap', 'Bank'
];

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  company?: string;
}

export interface TestCompany {
  id: string;
  name: string;
  industry: string;
  city: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  services: string[];
  budget: {
    current: number;
    monthly: number;
    daily: number;
  };
}

export interface TestLead {
  id: string;
  title: string;
  description: string;
  category: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  metadata: {
    urgency: 'low' | 'medium' | 'high' | 'urgent';
    budget: string;
    timeline: string;
    source: string;
  };
  status: 'new' | 'qualified' | 'contacted' | 'negotiating' | 'converted' | 'lost';
}

export interface TestProperty {
  id: string;
  name: string;
  type: 'apartment' | 'house' | 'cabin' | 'commercial';
  address: string;
  size: number;
  value: number;
  purchaseDate: Date;
  status: 'owned' | 'rented' | 'for_sale';
}

/**
 * Generate test users for different roles
 */
export function generateTestUsers(count: number = 10): TestUser[] {
  const users: TestUser[] = [];
  const roles: UserRole[] = ['user', 'company', 'content_editor', 'admin', 'master_admin'];
  
  for (let i = 0; i < count; i++) {
    const role = faker.helpers.arrayElement(roles);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    users.push({
      id: faker.string.uuid(),
      email: faker.internet.email({ firstName, lastName }),
      name: `${firstName} ${lastName}`,
      role,
      phone: generateNorwegianPhone(),
      company: role === 'company' ? generateCompanyName() : undefined
    });
  }
  
  return users;
}

/**
 * Generate test companies
 */
export function generateTestCompanies(count: number = 15): TestCompany[] {
  const companies: TestCompany[] = [];
  
  for (let i = 0; i < count; i++) {
    const businessType = faker.helpers.arrayElement(BUSINESS_TYPES);
    const city = faker.helpers.arrayElement(NORWEGIAN_CITIES);
    
    companies.push({
      id: faker.string.uuid(),
      name: generateCompanyName(businessType, city),
      industry: businessType.toLowerCase(),
      city,
      contact: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: generateNorwegianPhone()
      },
      services: faker.helpers.arrayElements([
        'rør', 'elektro', 'bygg', 'mal', 'tak', 'hage', 'renhold'
      ], { min: 1, max: 3 }),
      budget: {
        current: faker.number.int({ min: 1000, max: 50000 }),
        monthly: faker.number.int({ min: 5000, max: 100000 }),
        daily: faker.number.int({ min: 100, max: 2000 })
      }
    });
  }
  
  return companies;
}

/**
 * Generate test leads
 */
export function generateTestLeads(count: number = 50): TestLead[] {
  const leads: TestLead[] = [];
  const categories = ['rør', 'elektro', 'bygg', 'mal', 'tak', 'forsikring'];
  const statuses: TestLead['status'][] = ['new', 'qualified', 'contacted', 'negotiating', 'converted', 'lost'];
  
  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(categories);
    
    leads.push({
      id: faker.string.uuid(),
      title: generateLeadTitle(category),
      description: generateLeadDescription(category),
      category,
      customer: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: generateNorwegianPhone(),
        location: `${faker.helpers.arrayElement(NORWEGIAN_POSTCODES)} ${faker.helpers.arrayElement(NORWEGIAN_CITIES)}`
      },
      metadata: {
        urgency: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
        budget: faker.helpers.arrayElement(['under_10k', '10k_25k', '25k_50k', '50k_100k', 'over_100k']),
        timeline: faker.helpers.arrayElement(['asap', 'within_week', 'within_month', 'flexible']),
        source: faker.helpers.arrayElement(['website', 'google', 'facebook', 'referral', 'phone'])
      },
      status: faker.helpers.arrayElement(statuses)
    });
  }
  
  return leads;
}

/**
 * Generate test properties
 */
export function generateTestProperties(count: number = 20): TestProperty[] {
  const properties: TestProperty[] = [];
  const types: TestProperty['type'][] = ['apartment', 'house', 'cabin', 'commercial'];
  const statuses: TestProperty['status'][] = ['owned', 'rented', 'for_sale'];
  
  for (let i = 0; i < count; i++) {
    const type = faker.helpers.arrayElement(types);
    const city = faker.helpers.arrayElement(NORWEGIAN_CITIES);
    
    properties.push({
      id: faker.string.uuid(),
      name: `${faker.location.street()} ${faker.location.buildingNumber()}`,
      type,
      address: `${faker.location.streetAddress()}, ${faker.helpers.arrayElement(NORWEGIAN_POSTCODES)} ${city}`,
      size: faker.number.int({ min: 30, max: 300 }),
      value: faker.number.int({ min: 1000000, max: 15000000 }),
      purchaseDate: faker.date.past({ years: 20 }),
      status: faker.helpers.arrayElement(statuses)
    });
  }
  
  return properties;
}

/**
 * Generate Norwegian phone number
 */
export function generateNorwegianPhone(): string {
  const prefixes = ['40', '41', '45', '46', '47', '48', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'];
  const prefix = faker.helpers.arrayElement(prefixes);
  const number = faker.string.numeric(6);
  return `${prefix} ${number.slice(0, 2)} ${number.slice(2, 4)} ${number.slice(4)}`;
}

/**
 * Generate Norwegian company name
 */
export function generateCompanyName(businessType?: string, city?: string): string {
  const type = businessType || faker.helpers.arrayElement(BUSINESS_TYPES);
  const location = city || faker.helpers.arrayElement(NORWEGIAN_CITIES);
  
  const patterns = [
    `${location} ${type} AS`,
    `${faker.person.lastName()} ${type}`,
    `${location}${type.replace(' ', '')} AS`,
    `Norsk ${type} ${location}`,
    `${faker.person.lastName()} & ${faker.person.lastName()} ${type}`
  ];
  
  return faker.helpers.arrayElement(patterns);
}

/**
 * Generate lead title based on category
 */
function generateLeadTitle(category: string): string {
  const titles = {
    'rør': ['Lekkasje i bad - haster!', 'Installere nytt kjøkken', 'Reparere varmtvannstank'],
    'elektro': ['Bytte sikringsskap', 'Installere ladestasjon elbil', 'Legge nye strømkabler'],
    'bygg': ['Påbygg til hus', 'Oppussing av bad', 'Bygge terrasse'],
    'mal': ['Male huset utvendig', 'Innvendig maling stue', 'Tape og maling kjøkken'],
    'tak': ['Takreparasjon etter storm', 'Nytt takbelegg', 'Takrenner og sluk'],
    'forsikring': ['Boligforsikring sammenligning', 'Bilforsikring ung sjåfør', 'Innboforsikring']
  };
  
  const categoryTitles = titles[category] || ['Generell forespørsel'];
  return faker.helpers.arrayElement(categoryTitles);
}

/**
 * Generate lead description based on category
 */
function generateLeadDescription(category: string): string {
  const descriptions = {
    'rør': 'Trenger rask hjelp med rørarbeider. Problemet må løses snarest mulig.',
    'elektro': 'Ønsker tilbud på elektrisk arbeid. Viktig at arbeidet gjøres trygt og profesjonelt.',
    'bygg': 'Større byggeprosjekt som krever erfaren byggemester. Har tegninger klare.',
    'mal': 'Ønsker profesjonell maling av bolig. Kvalitet er viktigst.',
    'tak': 'Trenger hjelp med takarbeider. Kan møtes for befaring denne uken.',
    'forsikring': 'Ønsker å sammenligne forsikringstilbud. Trenger råd om beste løsning.'
  };
  
  return descriptions[category] || 'Trenger profesjonell hjelp med dette prosjektet.';
}

/**
 * Generate mock analytics data
 */
export function generateMockAnalytics(days: number = 30) {
  const data = [];
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    data.push({
      date: d.toISOString().split('T')[0],
      users: faker.number.int({ min: 10, max: 100 }),
      leads: faker.number.int({ min: 5, max: 30 }),
      conversions: faker.number.int({ min: 1, max: 10 }),
      revenue: faker.number.int({ min: 1000, max: 25000 })
    });
  }
  
  return data;
}

/**
 * Create realistic module usage data
 */
export function generateModuleUsage(userId: string, role: UserRole) {
  const baseModules = ['authentication', 'dashboard'];
  const roleModules = {
    'user': ['property_management'],
    'company': ['lead_management', 'analytics'],
    'content_editor': ['content_management'],
    'admin': ['user_management', 'company_management', 'analytics'],
    'master_admin': ['user_management', 'company_management', 'system_management', 'module_management', 'analytics'],
    'guest': []
  };
  
  const userModules = [...baseModules, ...(roleModules[role] || [])];
  
  return userModules.map(moduleId => ({
    id: faker.string.uuid(),
    user_id: userId,
    module_id: moduleId,
    is_enabled: faker.datatype.boolean({ probability: 0.8 }),
    settings: {
      notifications: faker.datatype.boolean({ probability: 0.7 }),
      auto_refresh: faker.datatype.boolean({ probability: 0.5 })
    },
    last_used: faker.date.recent({ days: 7 })
  }));
}