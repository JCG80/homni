
import { v4 as uuidv4 } from 'uuid';
import { Lead, LeadStatus } from '@/types/leads-canonical';

/**
 * Creates a standardized test lead for use in tests
 */
export function createTestLead(overrides: Partial<Lead> = {}): Lead {
  const defaultLead: Lead = {
    id: uuidv4(),
    title: 'Test Lead',
    description: 'This is a test lead for automated testing',
    category: 'testing',
    lead_type: 'standard',
    status: 'new' as LeadStatus,
    pipeline_stage: 'new',
    customer_name: 'Test Customer',
    customer_email: 'test@example.com',
    customer_phone: '+4712345678',
    service_type: 'Testing Service',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    submitted_by: 'system',
    company_id: null,
    metadata: {}
  };

  return {
    ...defaultLead,
    ...overrides,
  };
}

/**
 * Creates multiple test leads with sequential identifiers
 */
export function createTestLeads(count: number, baseOverrides: Partial<Lead> = {}): Lead[] {
  return Array.from({ length: count }).map((_, index) => {
    return createTestLead({
      ...baseOverrides,
      id: `test-lead-${index + 1}`,
      title: `Test Lead ${index + 1}`,
    });
  });
}
